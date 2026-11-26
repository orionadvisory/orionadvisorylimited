import type { SessionUser } from "@orion/contracts";

/**
 * Where to send a request, or null to let it through. `app: "web"` targets the web app's
 * origin (NEXT_PUBLIC_WEB_URL); `"self"` stays on the current origin. Ported 1:1 from the
 * old NextAuth `authorized` callback so behaviour is unchanged.
 */
export type RedirectTarget = { app: "web" | "self"; path: string } | null;

const web = (path: string): RedirectTarget => ({ app: "web", path });
const self = (path: string): RedirectTarget => ({ app: "self", path });

export function decideRedirect(pathname: string, user: SessionUser | null): RedirectTarget {
  const isLoggedIn = !!user;
  const isAppRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
  const isAdminCreate = pathname === "/admin/create";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminCreate;
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  // Reachable from an email link by anyone, signed in or not, mid-onboarding or not.
  if (pathname.startsWith("/verify-email")) return null;
  const isActiveAdmin = user?.role === "admin" && user.status === "active";
  const hasCompletedOnboarding = user?.onboardingCompleted === true;

  // Unauthenticated → login (admin has its own login on its own origin).
  if (isAppRoute && !isLoggedIn) return web("/login");
  if (isAdminRoute && !isLoggedIn) return self("/login");

  // Incomplete users may only use /onboarding (admins exempt).
  if (
    isLoggedIn &&
    !hasCompletedOnboarding &&
    !isActiveAdmin &&
    !isOnboardingRoute &&
    !isAuthRoute &&
    !isAdminCreate
  ) {
    return web("/onboarding");
  }

  // Completed users can't go back to /onboarding.
  if (isLoggedIn && hasCompletedOnboarding && isOnboardingRoute) return web("/dashboard");

  if (isAdminRoute && !isActiveAdmin) return web("/dashboard");

  // Signed-in users don't need auth pages.
  if (isAuthRoute && isLoggedIn) return web("/dashboard");

  return null;
}
