import type { SessionUser } from "@orion/contracts";
import { and, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { getDb } from "../../lib/db";

export type AuthUser = SessionUser & { passwordHash: string | null };

export class EmailTakenError extends Error {
  constructor() {
    super("Email already registered");
    this.name = "EmailTakenError";
  }
}

export interface AuthRepo {
  /** Case-insensitive lookup; `email` must already be lowercased. */
  findUserByEmail(email: string): Promise<AuthUser | null>;
  /** Throws EmailTakenError if the email is already registered. */
  createUser(input: { name: string; email: string; passwordHash: string }): Promise<SessionUser>;
  createSession(input: { tokenHash: string; userId: string; expires: Date }): Promise<void>;
  /** Only returns unexpired sessions. */
  findSession(tokenHash: string): Promise<{ user: SessionUser; expires: Date } | null>;
  deleteSession(tokenHash: string): Promise<void>;

  /** Store a hashed email-confirmation token, replacing any earlier one for this email. */
  saveVerificationToken(input: { email: string; tokenHash: string; expires: Date }): Promise<void>;
  /** Delete and return the email for an unexpired token; null if unknown or expired. Single use. */
  consumeVerificationToken(tokenHash: string): Promise<string | null>;
  /** Marks the user verified (no-op if already). `email` must already be lowercased. */
  markEmailVerified(email: string): Promise<void>;
}

async function schema() {
  return import("@orion/db/schema");
}

export const authRepo: AuthRepo = {
  async findUserByEmail(email) {
    const db = await getDb();
    const { users } = await schema();
    const [row] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        status: users.status,
        onboardingCompleted: users.onboardingCompleted,
        emailVerified: sql<boolean>`${users.emailVerified} is not null`,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .limit(1);
    return row ?? null;
  },

  async createUser({ name, email, passwordHash }) {
    const db = await getDb();
    const { users } = await schema();
    try {
      const [row] = await db.insert(users).values({ name, email, passwordHash }).returning({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        status: users.status,
        onboardingCompleted: users.onboardingCompleted,
      });
      return { ...row, emailVerified: false };
    } catch (err) {
      // 23505 = unique_violation (a concurrent signup won the race).
      if ((err as { code?: string }).code === "23505") throw new EmailTakenError();
      throw err;
    }
  },

  async createSession({ tokenHash, userId, expires }) {
    const db = await getDb();
    const { sessions } = await schema();
    // Opportunistic cleanup of this user's expired sessions.
    await db.delete(sessions).where(and(eq(sessions.userId, userId), lt(sessions.expires, new Date())));
    await db.insert(sessions).values({ sessionToken: tokenHash, userId, expires });
  },

  async findSession(tokenHash) {
    const db = await getDb();
    const { sessions, users } = await schema();
    const [row] = await db
      .select({
        expires: sessions.expires,
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        status: users.status,
        onboardingCompleted: users.onboardingCompleted,
        emailVerified: sql<boolean>`${users.emailVerified} is not null`,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.sessionToken, tokenHash), gt(sessions.expires, new Date())))
      .limit(1);
    if (!row) return null;
    const { expires, ...user } = row;
    return { user, expires };
  },

  async deleteSession(tokenHash) {
    const db = await getDb();
    const { sessions } = await schema();
    await db.delete(sessions).where(eq(sessions.sessionToken, tokenHash));
  },

  async saveVerificationToken({ email, tokenHash, expires }) {
    const db = await getDb();
    const { verificationTokens } = await schema();
    await db.batch([
      db.delete(verificationTokens).where(eq(verificationTokens.identifier, email)),
      db.insert(verificationTokens).values({ identifier: email, token: tokenHash, expires }),
    ]);
  },

  async consumeVerificationToken(tokenHash) {
    const db = await getDb();
    const { verificationTokens } = await schema();
    const [row] = await db
      .delete(verificationTokens)
      .where(and(eq(verificationTokens.token, tokenHash), gt(verificationTokens.expires, new Date())))
      .returning({ email: verificationTokens.identifier });
    return row?.email ?? null;
  },

  async markEmailVerified(email) {
    const db = await getDb();
    const { users } = await schema();
    await db
      .update(users)
      .set({ emailVerified: new Date(), updatedAt: new Date() })
      .where(and(sql`lower(${users.email}) = ${email}`, isNull(users.emailVerified)));
  },
};
