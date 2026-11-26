import { SESSION_COOKIE_NAME, type UserRole } from "@orion/contracts";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { ApiError } from "../lib/errors";
import type { ActiveSession, AuthService } from "../modules/auth/service";

declare module "hono" {
  interface ContextVariableMap {
    session: ActiveSession | null;
    sessionToken: string | null;
  }
}

/** Resolves the session cookie (if any) into `c.get("session")`. Only touches the DB when a cookie is present. */
export function sessionMiddleware(auth: AuthService) {
  return createMiddleware(async (c, next) => {
    const token = getCookie(c, SESSION_COOKIE_NAME) ?? null;
    c.set("sessionToken", token);
    c.set("session", token ? await auth.getSession(token) : null);
    await next();
  });
}

export const requireUser = createMiddleware(async (c, next) => {
  if (!c.get("session")) throw new ApiError(401, "unauthorized", "Sign in required");
  await next();
});

export function requireRole(role: UserRole) {
  return createMiddleware(async (c, next) => {
    const session = c.get("session");
    if (!session) throw new ApiError(401, "unauthorized", "Sign in required");
    if (session.user.role !== role) throw new ApiError(403, "forbidden", "You don't have access to this resource");
    await next();
  });
}
