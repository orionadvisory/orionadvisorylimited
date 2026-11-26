import { describe, expect, it } from "vitest";
import { createResendMailer, verificationEmail } from "../src/lib/email";
import { InMemoryAuthRepo } from "./fake-auth-repo";
import { FakeMailer, json, makeApp, makeAuth, sessionCookie } from "./helpers";

const PASSWORD = "correct horse battery";
const post = (body: unknown, cookie?: string) => ({
  method: "POST",
  headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
  body: body === undefined ? undefined : JSON.stringify(body),
});

function setup(opts: { now?: () => Date } = {}) {
  const repo = new InMemoryAuthRepo(opts.now);
  const mailer = new FakeMailer();
  const app = makeApp({ auth: makeAuth(repo, { mailer, now: opts.now }) });
  return { repo, mailer, app };
}

async function signup(app: ReturnType<typeof setup>["app"]) {
  const res = await app.request("/v1/auth/signup", post({ name: "Ada", email: "Ada@Example.com", password: PASSWORD }));
  return { res, cookie: sessionCookie(res)! };
}

describe("email verification", () => {
  it("emails a confirmation link on sign-up and starts unverified", async () => {
    const { app, mailer, repo } = setup();
    const { res } = await signup(app);
    expect(res.status).toBe(201);
    expect((await json(res)).data.user.emailVerified).toBe(false);
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0].to).toBe("ada@example.com");
    expect(mailer.sent[0].text).toContain("https://app.example/verify-email?token=");
    // Only the hash is stored, never the token itself.
    const token = mailer.lastToken()!;
    expect([...repo.verificationTokens.keys()]).not.toContain(token);
  });

  it("confirms the email once, then rejects the reused link", async () => {
    const { app, mailer } = setup();
    const { cookie } = await signup(app);
    const token = mailer.lastToken()!;

    expect((await app.request("/v1/auth/verify-email", post({ token }))).status).toBe(200);
    const session = await app.request("/v1/auth/session", { headers: { Cookie: cookie } });
    expect((await json(session)).data.user.emailVerified).toBe(true);

    const reused = await app.request("/v1/auth/verify-email", post({ token }));
    expect(reused.status).toBe(400);
  });

  it("rejects an expired link", async () => {
    let now = new Date("2026-11-26T10:00:00Z");
    const { app, mailer } = setup({ now: () => now });
    await signup(app);
    now = new Date("2026-11-27T10:00:01Z");
    const res = await app.request("/v1/auth/verify-email", post({ token: mailer.lastToken()! }));
    expect(res.status).toBe(400);
  });

  it("rejects an unknown token", async () => {
    const { app } = setup();
    const res = await app.request("/v1/auth/verify-email", post({ token: "x".repeat(43) }));
    expect(res.status).toBe(400);
  });

  it("still signs the user up when the email provider is down", async () => {
    const { app, mailer } = setup();
    mailer.fail = true;
    const { res } = await signup(app);
    expect(res.status).toBe(201);
  });

  it("resends a new link that replaces the old one", async () => {
    const { app, mailer } = setup();
    const { cookie } = await signup(app);
    const first = mailer.lastToken()!;
    const res = await app.request("/v1/auth/verification-email", post(undefined, cookie));
    expect(res.status).toBe(200);
    expect((await json(res)).data.status).toBe("sent");
    expect(mailer.sent).toHaveLength(2);
    expect((await app.request("/v1/auth/verify-email", post({ token: first }))).status).toBe(400);
    expect((await app.request("/v1/auth/verify-email", post({ token: mailer.lastToken()! }))).status).toBe(200);
  });

  it("requires a session to resend, and rate-limits it", async () => {
    const repo = new InMemoryAuthRepo();
    const mailer = new FakeMailer();
    const auth = makeAuth(repo, { mailer });
    const app = makeApp({ auth });
    expect((await app.request("/v1/auth/verification-email", post(undefined))).status).toBe(401);

    const { cookie } = await signup(app);
    for (let i = 0; i < 3; i++) {
      expect((await app.request("/v1/auth/verification-email", post(undefined, cookie))).status).toBe(200);
    }
    expect((await app.request("/v1/auth/verification-email", post(undefined, cookie))).status).toBe(429);
  });

  it("does not resend once verified", async () => {
    const { app, mailer } = setup();
    const { cookie } = await signup(app);
    await app.request("/v1/auth/verify-email", post({ token: mailer.lastToken()! }));
    const res = await app.request("/v1/auth/verification-email", post(undefined, cookie));
    expect((await json(res)).data.status).toBe("already_verified");
    expect(mailer.sent).toHaveLength(1);
  });
});

describe("Resend mailer", () => {
  it("posts to the Resend API with the key and sender", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchImpl = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ id: "1" }), { status: 200 });
    }) as unknown as typeof fetch;
    const mailer = createResendMailer({ apiKey: "re_test", from: "ORION <hi@mail.example>", fetchImpl });
    await mailer.send({ to: "a@b.co", subject: "S", html: "<p>h</p>", text: "t" });
    expect(calls[0].url).toBe("https://api.resend.com/emails");
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
    expect(JSON.parse(String(calls[0].init.body))).toMatchObject({ from: "ORION <hi@mail.example>", to: ["a@b.co"] });
  });

  it("throws when Resend rejects the email", async () => {
    const fetchImpl = (async () => new Response("domain not verified", { status: 403 })) as unknown as typeof fetch;
    const mailer = createResendMailer({ apiKey: "re_test", from: "x@y.z", fetchImpl });
    await expect(mailer.send({ to: "a@b.co", subject: "S", html: "h", text: "t" })).rejects.toThrow(/403/);
  });

  it("escapes the user's name in the HTML", () => {
    const { html } = verificationEmail({ name: "<script>", link: "https://app.example/verify-email?token=abc" });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

