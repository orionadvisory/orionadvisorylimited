import { createHash, randomBytes } from "node:crypto";

/** 256-bit opaque session token for the cookie. Never stored as-is. */
export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** What the database stores: a leaked sessions table can't be replayed as cookies. */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
