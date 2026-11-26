import type { SessionUser } from "@orion/contracts";
import { randomUUID } from "node:crypto";
import { EmailTakenError, type AuthRepo, type AuthUser } from "../src/modules/auth/repo";

/** In-memory AuthRepo mirroring the Drizzle implementation's contract. */
export class InMemoryAuthRepo implements AuthRepo {
  users = new Map<string, AuthUser>();
  sessions = new Map<string, { userId: string; expires: Date }>();
  verificationTokens = new Map<string, { email: string; expires: Date }>();

  constructor(private readonly now: () => Date = () => new Date()) {}

  addUser(partial: Partial<AuthUser> & { email: string; passwordHash: string | null }): AuthUser {
    const user: AuthUser = {
      id: randomUUID(),
      name: "Test User",
      image: null,
      role: "member",
      status: "active",
      onboardingCompleted: false,
      emailVerified: false,
      ...partial,
    };
    this.users.set(user.id, user);
    return user;
  }

  async findUserByEmail(email: string) {
    return [...this.users.values()].find((u) => u.email.toLowerCase() === email) ?? null;
  }

  async createUser(input: { name: string; email: string; passwordHash: string }): Promise<SessionUser> {
    if (await this.findUserByEmail(input.email.toLowerCase())) throw new EmailTakenError();
    const { passwordHash: _p, ...user } = this.addUser(input);
    return user;
  }

  async createSession(input: { tokenHash: string; userId: string; expires: Date }) {
    this.sessions.set(input.tokenHash, { userId: input.userId, expires: input.expires });
  }

  async findSession(tokenHash: string) {
    const s = this.sessions.get(tokenHash);
    if (!s || s.expires <= this.now()) return null;
    const found = this.users.get(s.userId);
    if (!found) return null;
    const { passwordHash: _p, ...user } = found;
    return { user, expires: s.expires };
  }

  async deleteSession(tokenHash: string) {
    this.sessions.delete(tokenHash);
  }

  async saveVerificationToken(input: { email: string; tokenHash: string; expires: Date }) {
    for (const [hash, t] of this.verificationTokens) if (t.email === input.email) this.verificationTokens.delete(hash);
    this.verificationTokens.set(input.tokenHash, { email: input.email, expires: input.expires });
  }

  async consumeVerificationToken(tokenHash: string) {
    const t = this.verificationTokens.get(tokenHash);
    if (!t || t.expires <= this.now()) return null;
    this.verificationTokens.delete(tokenHash);
    return t.email;
  }

  async markEmailVerified(email: string) {
    for (const u of this.users.values()) if (u.email.toLowerCase() === email) u.emailVerified = true;
  }
}
