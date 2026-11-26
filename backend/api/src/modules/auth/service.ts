import type { SessionUser } from "@orion/contracts";
import { verificationEmail, type Mailer } from "../../lib/email";
import { ApiError } from "../../lib/errors";
import { RateLimiter } from "../../lib/rate-limit";
import { hashPassword, verifyPassword } from "./password";
import type { FailureLimiter } from "./rate-limit";
import { EmailTakenError, type AuthRepo } from "./repo";
import { hashSessionToken, newSessionToken } from "./tokens";

export type ActiveSession = { user: SessionUser; expires: Date };
export type IssuedSession = { token: string; session: ActiveSession };

export type AuthService = ReturnType<typeof createAuthService>;

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export function createAuthService(deps: {
  repo: AuthRepo;
  limiter: FailureLimiter;
  ttlMs: number;
  mailer: Mailer;
  /** Public web app URL; confirmation links point at `${appUrl}/verify-email`. */
  appUrl: string;
  /** Caps "resend confirmation email" per user. Defaults to 3 per hour. */
  resendLimiter?: RateLimiter;
  now?: () => Date;
}) {
  const { repo, limiter, ttlMs, mailer, appUrl } = deps;
  const now = deps.now ?? (() => new Date());
  const resendLimiter = deps.resendLimiter ?? new RateLimiter(3, 60 * 60 * 1000);

  /** Issue a fresh single-use token (only its hash is stored) and email the link. */
  async function sendVerification(user: { email: string; name: string | null }) {
    const token = newSessionToken();
    await repo.saveVerificationToken({
      email: user.email.toLowerCase(),
      tokenHash: hashSessionToken(token),
      expires: new Date(now().getTime() + VERIFICATION_TTL_MS),
    });
    const link = `${appUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(token)}`;
    await mailer.send({ to: user.email, ...verificationEmail({ name: user.name, link }) });
  }

  async function issue(user: SessionUser): Promise<IssuedSession> {
    const token = newSessionToken();
    const expires = new Date(now().getTime() + ttlMs);
    await repo.createSession({ tokenHash: hashSessionToken(token), userId: user.id, expires });
    return { token, session: { user, expires } };
  }

  return {
    async signup(input: { name: string; email: string; password: string }): Promise<IssuedSession> {
      if (await repo.findUserByEmail(input.email)) {
        throw new ApiError(409, "conflict", "An account with this email already exists");
      }
      let user: SessionUser;
      try {
        user = await repo.createUser({
          name: input.name,
          email: input.email,
          passwordHash: await hashPassword(input.password),
        });
      } catch (err) {
        if (err instanceof EmailTakenError) throw new ApiError(409, "conflict", "An account with this email already exists");
        throw err;
      }
      // A delivery failure must not block sign-up; the user can resend from the app.
      try {
        await sendVerification(user);
      } catch (err) {
        console.error(JSON.stringify({ level: "error", msg: "verification email failed", userId: user.id, err: String(err) }));
      }
      return issue(user);
    },

    /** Resend the confirmation email to a signed-in, unverified user. */
    async resendVerification(user: SessionUser): Promise<"sent" | "already_verified"> {
      if (user.emailVerified) return "already_verified";
      const retryAfter = resendLimiter.hit(user.id);
      if (retryAfter) {
        throw new ApiError(429, "rate_limited", "Please wait before requesting another email.", { retryAfterSeconds: retryAfter });
      }
      try {
        await sendVerification(user);
      } catch (err) {
        console.error(JSON.stringify({ level: "error", msg: "verification email failed", userId: user.id, err: String(err) }));
        throw new ApiError(502, "service_unavailable", "We couldn't send the email right now. Please try again shortly.");
      }
      return "sent";
    },

    /** Consume a confirmation token and mark its email verified. */
    async verifyEmail(token: string): Promise<void> {
      const email = await repo.consumeVerificationToken(hashSessionToken(token));
      if (!email) throw new ApiError(400, "bad_request", "This confirmation link is invalid or has expired");
      await repo.markEmailVerified(email);
    },

    async login(input: { email: string; password: string }): Promise<IssuedSession> {
      const key = input.email;
      const retryAfter = limiter.retryAfterSeconds(key);
      if (retryAfter > 0) {
        throw new ApiError(429, "rate_limited", "Too many failed sign-in attempts. Try again later.", {
          retryAfterSeconds: retryAfter,
        });
      }

      const user = await repo.findUserByEmail(input.email);
      const valid = await verifyPassword(input.password, user?.passwordHash ?? null);
      if (!user || !valid) {
        limiter.recordFailure(key);
        throw new ApiError(401, "unauthorized", "Invalid email or password");
      }
      // Checked only after the password, so status isn't disclosed to someone guessing.
      if (user.status === "suspended") {
        throw new ApiError(403, "forbidden", "This account has been suspended");
      }

      limiter.reset(key);
      const { passwordHash: _omit, ...sessionUser } = user;
      return issue(sessionUser);
    },

    /** Resolves a cookie token to a live session; suspended users' sessions are revoked on sight. */
    async getSession(token: string): Promise<ActiveSession | null> {
      const tokenHash = hashSessionToken(token);
      const found = await repo.findSession(tokenHash);
      if (!found) return null;
      if (found.user.status === "suspended") {
        await repo.deleteSession(tokenHash);
        return null;
      }
      return found;
    },

    async logout(token: string): Promise<void> {
      await repo.deleteSession(hashSessionToken(token));
    },
  };
}
