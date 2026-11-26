import { createAuthProxy } from "@orion/session/proxy";

export const proxy = createAuthProxy();

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
  ],
};
