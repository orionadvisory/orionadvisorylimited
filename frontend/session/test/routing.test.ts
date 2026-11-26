import type { SessionUser } from "@orion/contracts";
import { describe, expect, it } from "vitest";
import { decideRedirect } from "../src/routing";

const user = (over: Partial<SessionUser> = {}): SessionUser => ({
  id: "6f1c2a7e-3b4d-4c5e-8f9a-0b1c2d3e4f5a",
  name: "Ada",
  email: "ada@example.com",
  image: null,
  role: "member",
  status: "active",
  onboardingCompleted: true,
  emailVerified: true,
  ...over,
});
const fresh = user({ onboardingCompleted: false });
const admin = user({ role: "admin", onboardingCompleted: false });
const suspendedAdmin = user({ role: "admin", status: "suspended" });

describe("decideRedirect (same rules as the old NextAuth authorized callback)", () => {
  it.each([
    // [path, user, expected]
    ["/dashboard", null, { app: "web", path: "/login" }],
    ["/onboarding", null, { app: "web", path: "/login" }],
    ["/admin", null, { app: "self", path: "/login" }],
    ["/admin/users", null, { app: "self", path: "/login" }],
    ["/admin/create", null, null],
    ["/login", null, null],
    ["/signup", null, null],

    // Email confirmation links work for anyone, including mid-onboarding.
    ["/verify-email", null, null],
    ["/verify-email", fresh, null],
    ["/verify-email", user(), null],

    ["/dashboard", fresh, { app: "web", path: "/onboarding" }],
    ["/onboarding", fresh, null],
    ["/login", fresh, { app: "web", path: "/dashboard" }],

    ["/dashboard", user(), null],
    ["/onboarding", user(), { app: "web", path: "/dashboard" }],
    ["/login", user(), { app: "web", path: "/dashboard" }],
    ["/signup", user(), { app: "web", path: "/dashboard" }],
    ["/admin", user(), { app: "web", path: "/dashboard" }],

    ["/admin", admin, null],
    ["/admin/assessments/123", admin, null],
    ["/dashboard", admin, null], // admins are exempt from onboarding
    ["/admin", suspendedAdmin, { app: "web", path: "/dashboard" }],
  ] as const)("%s as %o → %o", (path, u, expected) => {
    expect(decideRedirect(path, u as SessionUser | null)).toEqual(expected);
  });
});
