import "server-only";
import { SESSION_COOKIE_NAME, type Session, type SessionUser } from "@orion/contracts";
import { cookies } from "next/headers";
import { cache } from "react";
import { fetchSession } from "./client";

export type { Session, SessionUser };

/**
 * The signed-in session for this request, or null. Drop-in replacement for the old
 * NextAuth `auth()`: same `session.user.{id, name, email, role, status, onboardingCompleted}`.
 * Deduplicated per request via React `cache`.
 */
export const auth = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return fetchSession(token);
});
