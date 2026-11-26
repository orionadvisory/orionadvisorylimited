import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const fetchSession = vi.fn();
vi.mock("../src/client", () => ({ fetchSession: (t: string) => fetchSession(t) }));

const { createAuthProxy } = await import("../src/proxy");
const proxy = createAuthProxy();

const onboarded = {
  user: { id: "u1", email: "a@b.c", name: "A", role: "member", status: "active", onboardingCompleted: true },
};

function req(path: string, method = "GET") {
  return new NextRequest(new URL(path, "http://localhost:3000"), {
    method,
    headers: { cookie: "orion_session=tok" },
  });
}

describe("auth proxy", () => {
  beforeEach(() => {
    fetchSession.mockReset();
    fetchSession.mockResolvedValue(onboarded);
  });

  it("redirects an onboarded user's page load of /onboarding to /dashboard", async () => {
    const res = await proxy(req("/onboarding"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("lets server-action POSTs through untouched, without a session lookup", async () => {
    const res = await proxy(req("/onboarding", "POST"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(fetchSession).not.toHaveBeenCalled();
  });
});
