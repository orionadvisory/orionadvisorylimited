import { createApp, type AppDeps } from "../src/app";
import { loadEnv } from "../src/env";
import { FailureLimiter } from "../src/modules/auth/rate-limit";
import type { Mailer } from "../src/lib/email";
import { createAuthService } from "../src/modules/auth/service";
import { InMemoryAuthRepo } from "./fake-auth-repo";
import { FakeStorage, founderDeps } from "./fake-founder";
import type { AdminRepo } from "../src/modules/admin/repo";

/** Admin repo fake: every method throws unless the test supplies it. */
export function fakeAdminRepo(overrides: Partial<AdminRepo> = {}): AdminRepo {
  return new Proxy(overrides as AdminRepo, {
    get(target, prop: string) {
      if (prop in target) return target[prop as keyof AdminRepo];
      return () => {
        throw new Error(`AdminRepo.${prop} not stubbed in this test`);
      };
    },
  });
}

export const ALLOWED = "http://localhost:3000";

// Response bodies are asserted structurally in tests, so loosen the type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const json = (res: Response): Promise<any> => res.json();

export const DAY_MS = 24 * 60 * 60 * 1000;

export function makeAuth(
  repo = new InMemoryAuthRepo(),
  opts: { now?: () => Date; limiter?: FailureLimiter; mailer?: Mailer } = {},
) {
  return createAuthService({
    repo,
    limiter: opts.limiter ?? new FailureLimiter(),
    ttlMs: 30 * DAY_MS,
    mailer: opts.mailer ?? new FakeMailer(),
    appUrl: "https://app.example",
    now: opts.now,
  });
}

/** Build the app with in-memory fakes; override any dependency per test. */
export function makeApp(
  opts: { dbOk?: boolean; nodeEnv?: string; cookieDomain?: string } & Partial<Omit<AppDeps, "env">> = {},
) {
  const env = loadEnv({
    NODE_ENV: opts.nodeEnv ?? "test",
    CORS_ORIGINS: ALLOWED,
    APP_VERSION: "test-sha",
    DATABASE_URL: "postgres://u:p@localhost:5432/db",
    COOKIE_DOMAIN: opts.cookieDomain,
  });
  return createApp({
    env,
    checkDb: opts.checkDb ?? (async () => opts.dbOk ?? true),
    partners: opts.partners ?? { list: async () => [], getLogo: async () => null },
    assessments: opts.assessments ?? { getPublished: async () => null },
    auth: opts.auth ?? makeAuth(),
    founder: opts.founder ?? founderDeps(),
    admin: opts.admin ?? { repo: fakeAdminRepo(), storage: new FakeStorage() },
  });
}

/** Extract `orion_session=<token>` from a response's Set-Cookie, for replaying as a request Cookie header. */
export function sessionCookie(res: Response): string | null {
  const raw = res.headers.getSetCookie().find((c) => c.startsWith("orion_session="));
  return raw ? raw.split(";")[0] : null;
}

/** Records emails instead of sending them. */
export class FakeMailer implements Mailer {
  sent: { to: string; subject: string; html: string; text: string }[] = [];
  fail = false;
  async send(message: { to: string; subject: string; html: string; text: string }) {
    if (this.fail) throw new Error("mail provider down");
    this.sent.push(message);
  }
  /** The confirmation token from the most recent email. */
  lastToken(): string | null {
    const match = this.sent.at(-1)?.text.match(/token=([A-Za-z0-9_-]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}
