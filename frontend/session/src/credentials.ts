import "server-only";
import { SESSION_COOKIE_NAME } from "@orion/contracts";
import { cookies } from "next/headers";
import { api, sessionCookieHeader } from "./client";
import { parseSetCookie } from "./set-cookie";

export type AuthResult = { ok: true } | { ok: false; error: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

/** Re-issue the API's Set-Cookie headers on the response going back to the browser. */
async function forwardCookies(res: Response) {
  const jar = await cookies();
  for (const header of res.headers.getSetCookie()) {
    const parsed = parseSetCookie(header);
    if (parsed) jar.set(parsed.name, parsed.value, parsed.options);
  }
}

type ErrorBody = { error?: { code?: string; message?: string; details?: unknown } };

/** Turn an API error response into a message that's safe and useful to show in a form. */
async function toFailure(res: Response): Promise<AuthResult> {
  const body = (await res.json().catch(() => ({}))) as ErrorBody;
  const err = body.error;

  if (res.status === 400 && Array.isArray(err?.details)) {
    const first = err.details[0] as { message?: string } | undefined;
    if (first?.message) return { ok: false, error: first.message };
  }
  if (res.status === 429) {
    const secs = (err?.details as { retryAfterSeconds?: number } | undefined)?.retryAfterSeconds ?? 900;
    return { ok: false, error: `Too many failed attempts. Try again in ${Math.ceil(secs / 60)} minute(s).` };
  }
  if (res.status < 500 && err?.message) return { ok: false, error: err.message };

  console.error(`[session] auth request failed with ${res.status}`, err?.code);
  return { ok: false, error: GENERIC_ERROR };
}

export async function loginWithPassword(input: { email: string; password: string }): Promise<AuthResult> {
  const res = await api.v1.auth.login.$post({ json: input });
  if (!res.ok) return toFailure(res);
  await forwardCookies(res);
  return { ok: true };
}

export async function signupWithPassword(input: { name: string; email: string; password: string }): Promise<AuthResult> {
  const res = await api.v1.auth.signup.$post({ json: input });
  if (!res.ok) return toFailure(res);
  await forwardCookies(res);
  return { ok: true };
}

/** Revoke the session server-side and clear the cookie (with the API's domain, so it really goes). */
export async function logoutSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return;
  try {
    const res = await api.v1.auth.logout.$post(undefined, { headers: { cookie: sessionCookieHeader(token) } });
    await forwardCookies(res);
  } catch (err) {
    // Even if the API is unreachable, drop the cookie locally so the user is signed out here.
    console.error("[session] logout request failed", err);
    jar.delete(SESSION_COOKIE_NAME);
  }
}
