import bcrypt from "bcryptjs";
import { beforeAll, describe, expect, it } from "vitest";
import { requireRole, requireUser } from "../src/middleware/session";
import { FailureLimiter } from "../src/modules/auth/rate-limit";
import { hashSessionToken } from "../src/modules/auth/tokens";
import { InMemoryAuthRepo } from "./fake-auth-repo";
import { DAY_MS, json, makeApp, makeAuth, sessionCookie } from "./helpers";

const PASSWORD = "correct horse battery";
let HASH: string;

beforeAll(async () => {
  // A real bcrypt cost-12 hash, the same format the old NextAuth flow stored.
  HASH = await bcrypt.hash(PASSWORD, 12);
});

const post = (body: unknown, headers: Record<string, string> = {}) => ({
  method: "POST",
  headers: { "Content-Type": "application/json", ...headers },
  body: JSON.stringify(body),
});

function setup(opts: { nodeEnv?: string; cookieDomain?: string; now?: () => Date; limiter?: FailureLimiter } = {}) {
  const repo = new InMemoryAuthRepo(opts.now);
  const app = makeApp({ ...opts, auth: makeAuth(repo, { now: opts.now, limiter: opts.limiter }) });
  return { repo, app };
}

describe("POST /v1/auth/signup", () => {
  it("creates the user with a bcrypt hash, normalises email, and starts a session", async () => {
    const { repo, app } = setup();
    const res = await app.request("/v1/auth/signup", post({ name: " Ada ", email: " Ada@Example.COM ", password: PASSWORD }));
    expect(res.status).toBe(201);

    const body = await json(res);
    expect(body.data.user).toMatchObject({ name: "Ada", email: "ada@example.com", role: "member", onboardingCompleted: false });

    const stored = [...repo.users.values()][0];
    expect(stored.passwordHash).not.toBe(PASSWORD);
    expect(await bcrypt.compare(PASSWORD, stored.passwordHash!)).toBe(true);

    const setCookie = res.headers.getSetCookie().join("\n");
    expect(setCookie).toMatch(/orion_session=[\w-]{40,}/);
    expect(setCookie).toMatch(/HttpOnly/);
    expect(setCookie).toMatch(/SameSite=Lax/);
    expect(setCookie).toMatch(/Path=\//);
    const maxAge = Number(/Max-Age=(\d+)/.exec(setCookie)?.[1]);
    expect(maxAge).toBeGreaterThan(30 * 24 * 3600 - 60); // 30 days, minus test runtime slack
    expect(maxAge).toBeLessThanOrEqual(30 * 24 * 3600);
  });

  it("rejects a duplicate email case-insensitively", async () => {
    const { repo, app } = setup();
    repo.addUser({ email: "ada@example.com", passwordHash: HASH });
    const res = await app.request("/v1/auth/signup", post({ name: "Ada", email: "ADA@example.com", password: PASSWORD }));
    expect(res.status).toBe(409);
    expect((await json(res)).error.code).toBe("conflict");
  });

  it("validates input", async () => {
    const { app } = setup();
    const res = await app.request("/v1/auth/signup", post({ name: "", email: "nope", password: "short" }));
    expect(res.status).toBe(400);
    const paths = (await json(res)).error.details.map((d: { path: string }) => d.path);
    expect(paths).toEqual(expect.arrayContaining(["name", "email", "password"]));
  });
});

describe("POST /v1/auth/login", () => {
  it("signs in an existing user whose hash was created by the old app", async () => {
    const { repo, app } = setup();
    const user = repo.addUser({ email: "founder@startup.africa", passwordHash: HASH, onboardingCompleted: true });
    const res = await app.request("/v1/auth/login", post({ email: "Founder@Startup.africa", password: PASSWORD }));
    expect(res.status).toBe(200);
    expect((await json(res)).data.user).toEqual({
      id: user.id,
      name: "Test User",
      email: "founder@startup.africa",
      image: null,
      role: "member",
      status: "active",
      onboardingCompleted: true,
      emailVerified: false,
    });
  });

  it("stores only the SHA-256 of the session token", async () => {
    const { repo, app } = setup();
    repo.addUser({ email: "a@b.co", passwordHash: HASH });
    const res = await app.request("/v1/auth/login", post({ email: "a@b.co", password: PASSWORD }));
    const token = sessionCookie(res)!.split("=")[1];
    expect(repo.sessions.has(token)).toBe(false);
    expect(repo.sessions.has(hashSessionToken(token))).toBe(true);
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    const { repo, app } = setup();
    repo.addUser({ email: "a@b.co", passwordHash: HASH });
    const wrong = await app.request("/v1/auth/login", post({ email: "a@b.co", password: "nope" }));
    const unknown = await app.request("/v1/auth/login", post({ email: "who@b.co", password: "nope" }));
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect((await json(wrong)).error.message).toBe((await json(unknown)).error.message);
    expect(sessionCookie(wrong)).toBeNull();
  });

  it("refuses suspended accounts (only after a correct password)", async () => {
    const { repo, app } = setup();
    repo.addUser({ email: "s@b.co", passwordHash: HASH, status: "suspended" });
    expect((await app.request("/v1/auth/login", post({ email: "s@b.co", password: "nope" }))).status).toBe(401);
    const res = await app.request("/v1/auth/login", post({ email: "s@b.co", password: PASSWORD }));
    expect(res.status).toBe(403);
    expect(sessionCookie(res)).toBeNull();
  });

  it("locks an account after 10 failures, even for the right password, without affecting others", async () => {
    const { repo, app } = setup({ limiter: new FailureLimiter(10, 60_000) });
    repo.addUser({ email: "target@b.co", passwordHash: HASH });
    repo.addUser({ email: "other@b.co", passwordHash: HASH });
    for (let i = 0; i < 10; i++) {
      expect((await app.request("/v1/auth/login", post({ email: "target@b.co", password: `guess${i}` }))).status).toBe(401);
    }
    const locked = await app.request("/v1/auth/login", post({ email: "target@b.co", password: PASSWORD }));
    expect(locked.status).toBe(429);
    expect((await json(locked)).error.details.retryAfterSeconds).toBeGreaterThan(0);
    expect((await app.request("/v1/auth/login", post({ email: "other@b.co", password: PASSWORD }))).status).toBe(200);
  }, 30_000);

  it("sets Secure and the parent Domain in production", async () => {
    const { repo, app } = setup({ nodeEnv: "production", cookieDomain: ".orion.africa" });
    repo.addUser({ email: "a@b.co", passwordHash: HASH });
    const res = await app.request("/v1/auth/login", post({ email: "a@b.co", password: PASSWORD }));
    const setCookie = res.headers.getSetCookie().join("\n");
    expect(setCookie).toMatch(/Secure/);
    expect(setCookie).toMatch(/Domain=\.orion\.africa/);
  });
});

describe("GET /v1/auth/session and POST /v1/auth/logout", () => {
  async function signedIn(overrides: Parameters<InMemoryAuthRepo["addUser"]>[0] = { email: "a@b.co", passwordHash: "" }) {
    let clock = new Date("2026-11-24T12:00:00Z");
    const ctx = setup({ now: () => clock });
    const user = ctx.repo.addUser({ ...overrides, passwordHash: HASH });
    const res = await ctx.app.request("/v1/auth/login", post({ email: overrides.email, password: PASSWORD }));
    return { ...ctx, user, cookie: sessionCookie(res)!, tick: (ms: number) => (clock = new Date(clock.getTime() + ms)) };
  }

  it("returns the user for a valid cookie, never cached", async () => {
    const { app, cookie, user } = await signedIn();
    const res = await app.request("/v1/auth/session", { headers: { Cookie: cookie } });
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect((await json(res)).data.user.id).toBe(user.id);
  });

  it("401s without a cookie or with a forged one", async () => {
    const { app } = await signedIn();
    expect((await app.request("/v1/auth/session")).status).toBe(401);
    expect((await app.request("/v1/auth/session", { headers: { Cookie: "orion_session=forged" } })).status).toBe(401);
  });

  it("401s once the session expires", async () => {
    const { app, cookie, tick } = await signedIn();
    tick(30 * DAY_MS + 1);
    expect((await app.request("/v1/auth/session", { headers: { Cookie: cookie } })).status).toBe(401);
  });

  it("reflects role/onboarding changes immediately and revokes on suspension", async () => {
    const { app, cookie, user, repo } = await signedIn();
    repo.users.get(user.id)!.onboardingCompleted = true;
    expect((await json(await app.request("/v1/auth/session", { headers: { Cookie: cookie } }))).data.user.onboardingCompleted).toBe(true);

    repo.users.get(user.id)!.status = "suspended";
    expect((await app.request("/v1/auth/session", { headers: { Cookie: cookie } })).status).toBe(401);
    expect(repo.sessions.size).toBe(0);
  });

  it("logout deletes the session and clears the cookie", async () => {
    const { app, cookie, repo } = await signedIn();
    const res = await app.request("/v1/auth/logout", { method: "POST", headers: { Cookie: cookie } });
    expect(res.status).toBe(204);
    expect(res.headers.getSetCookie().join("\n")).toMatch(/orion_session=;.*Max-Age=0/);
    expect(repo.sessions.size).toBe(0);
    expect((await app.request("/v1/auth/session", { headers: { Cookie: cookie } })).status).toBe(401);
  });
});

describe("requireUser / requireRole", () => {
  async function appWithGuards() {
    const repo = new InMemoryAuthRepo();
    const app = makeApp({ auth: makeAuth(repo) });
    app.get("/v1/test/me", requireUser, (c) => c.json({ id: c.get("session")!.user.id }));
    app.get("/v1/test/admin", requireRole("admin"), (c) => c.json({ ok: true }));
    const login = async (email: string, role: "member" | "admin") => {
      repo.addUser({ email, passwordHash: HASH, role });
      return sessionCookie(await app.request("/v1/auth/login", post({ email, password: PASSWORD })))!;
    };
    return { app, member: await login("m@b.co", "member"), admin: await login("x@b.co", "admin") };
  }

  it("enforces sign-in and admin role", async () => {
    const { app, member, admin } = await appWithGuards();
    expect((await app.request("/v1/test/me")).status).toBe(401);
    expect((await app.request("/v1/test/me", { headers: { Cookie: member } })).status).toBe(200);
    expect((await app.request("/v1/test/admin")).status).toBe(401);
    expect((await app.request("/v1/test/admin", { headers: { Cookie: member } })).status).toBe(403);
    expect((await app.request("/v1/test/admin", { headers: { Cookie: admin } })).status).toBe(200);
  });
});
