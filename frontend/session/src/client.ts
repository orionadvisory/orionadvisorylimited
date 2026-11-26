import "server-only";
import { createApiClient } from "@orion/api/client";
import { SESSION_COOKIE_NAME, type Session } from "@orion/contracts";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export const api = createApiClient(API_URL);

export const sessionCookieHeader = (token: string) => `${SESSION_COOKIE_NAME}=${token}`;

/**
 * Ask the API who owns this session token. Returns null when the token is unknown,
 * expired or revoked; throws if the API itself is unreachable or erroring, so callers
 * never mistake an outage for "signed out".
 */
export async function fetchSession(token: string): Promise<Session | null> {
  const res = await api.v1.auth.session.$get(undefined, {
    headers: { cookie: sessionCookieHeader(token) },
    init: { cache: "no-store" },
  });
  if (res.ok) return (await res.json()).data;
  const status: number = res.status;
  if (status === 401) return null;
  throw new Error(`Orion API GET /v1/auth/session failed with ${status}`);
}
