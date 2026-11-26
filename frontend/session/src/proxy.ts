import { SESSION_COOKIE_NAME } from "@orion/contracts";
import { NextResponse, type NextRequest } from "next/server";
import { fetchSession } from "./client";
import { decideRedirect } from "./routing";

/**
 * Next 16 `proxy` that applies Orion's route rules (login, onboarding, admin gating)
 * using the API session. Optimistic layer only: pages still verify via `auth()`.
 * If the API is down this throws (500) rather than letting protected routes through.
 */
export function createAuthProxy() {
  return async function proxy(request: NextRequest) {
    // Only page loads are redirected. Server actions and other POSTs check auth at the API,
    // and redirecting them breaks them: e.g. onboarding's final clearDraft action posts to
    // /onboarding right after the user is marked onboarded, and got bounced to /dashboard.
    if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();

    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await fetchSession(token) : null;

    const target = decideRedirect(request.nextUrl.pathname, session?.user ?? null);
    if (!target) return NextResponse.next();

    const base = target.app === "web" ? process.env.NEXT_PUBLIC_WEB_URL || request.url : request.url;
    return NextResponse.redirect(new URL(target.path, base));
  };
}
