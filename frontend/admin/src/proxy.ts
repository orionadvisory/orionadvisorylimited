import { createAuthProxy } from "@orion/session/proxy";

export const proxy = createAuthProxy();

export const config = {
  matcher: ["/admin/:path*"],
};
