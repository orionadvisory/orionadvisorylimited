import bcrypt from "bcryptjs";

/** Same cost the Next apps used, so every existing password hash keeps working. */
const COST = 12;

let dummyHash: Promise<string> | undefined;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

/**
 * Constant-ish time check. When there is no stored hash (unknown email, or an account
 * without a password) we still run a bcrypt compare so the response time doesn't reveal
 * whether the account exists.
 */
export async function verifyPassword(password: string, hash: string | null): Promise<boolean> {
  if (!hash) {
    dummyHash ??= bcrypt.hash("orion-timing-equaliser", COST);
    await bcrypt.compare(password, await dummyHash);
    return false;
  }
  return bcrypt.compare(password, hash);
}
