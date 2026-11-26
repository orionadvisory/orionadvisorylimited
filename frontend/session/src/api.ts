import "server-only";
import { createApiClient } from "@orion/api/client";
import { SESSION_COOKIE_NAME } from "@orion/contracts";
import { cookies } from "next/headers";
import { sessionCookieHeader } from "./client";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

/** Typed API client that acts as the current visitor (forwards their session cookie). */
export async function sessionApi() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return createApiClient(API_URL, {
    headers: token ? { cookie: sessionCookieHeader(token) } : {},
    fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, cache: "no-store" }),
  });
}

/** The API's error message from a failed response, falling back to a generic one. */
export async function apiErrorMessage(res: Response, fallback = "Something went wrong. Please try again.") {
  const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
  return body?.error?.message ?? fallback;
}
