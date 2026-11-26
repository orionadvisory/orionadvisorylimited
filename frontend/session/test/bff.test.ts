import { afterEach, describe, expect, it, vi } from "vitest";
import { ADMIN_PATHS, forwardToApi, toApiPath, toLegacyResponse } from "../src/bff";

describe("toApiPath (admin allowlist)", () => {
  const id = "6f1c2a7e-3b4d-4c5e-8f9a-0b1c2d3e4f5a";
  it("forwards only the admin client paths", () => {
    expect(toApiPath(["admin", "partners"], ADMIN_PATHS)).toBe("/v1/admin/partners");
    expect(toApiPath(["admin", "partners", id], ADMIN_PATHS)).toBe(`/v1/admin/partners/${id}`);
    expect(toApiPath(["admin", "uploads", id, "download"], ADMIN_PATHS)).toBe(`/v1/admin/uploads/${id}/download`);
    expect(toApiPath(["admin", "users"], ADMIN_PATHS)).toBeNull();
    expect(toApiPath(["chat"], ADMIN_PATHS)).toBeNull();
  });
  it("keeps admin paths out of the founder bridge", () => {
    expect(toApiPath(["admin", "partners"])).toBeNull();
  });
});

describe("toApiPath (allowlist)", () => {
  it.each([
    [["documents"], "/v1/documents"],
    [["documents", "upload"], "/v1/documents/upload"],
    [["documents", "6f1c2a7e-3b4d-4c5e-8f9a-0b1c2d3e4f5a", "download"], "/v1/documents/6f1c2a7e-3b4d-4c5e-8f9a-0b1c2d3e4f5a/download"],
    [["chat"], "/v1/chat"],
    [["health-check"], "/v1/health-check"],
    [["health-check", "reevaluate"], "/v1/health-check/reevaluate"],
    [["assessments", "start"], "/v1/assessments/start"],
    [["onboarding", "complete"], "/v1/onboarding/complete"],
  ])("%j → %s", (segments, expected) => {
    expect(toApiPath(segments)).toBe(expected);
  });

  it.each([[["auth", "login"]], [["admin", "users"]], [["documents", "..", "admin"]], [["partners"]], [["documents", "x", "download"]], [[""]]])(
    "rejects %j",
    (segments) => {
      expect(toApiPath(segments)).toBeNull();
    },
  );
});

describe("toLegacyResponse", () => {
  const jsonRes = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

  it("unwraps { data }", async () => {
    const res = await toLegacyResponse(jsonRes({ data: { assessmentId: "a1" } }));
    expect(await res.json()).toEqual({ assessmentId: "a1" });
  });

  it("keeps the status (201)", async () => {
    expect((await toLegacyResponse(jsonRes({ data: [] }, 201))).status).toBe(201);
  });

  it("flattens the error envelope to { error: message }", async () => {
    const res = await toLegacyResponse(jsonRes({ error: { code: "bad_request", message: "File too large" } }, 400));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "File too large" });
  });

  it("passes redirects through without following them", async () => {
    const res = await toLegacyResponse(new Response(null, { status: 302, headers: { location: "https://r2.example/x" } }));
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://r2.example/x");
  });

  it("streams SSE untouched", async () => {
    const res = await toLegacyResponse(
      new Response("data: {\"content\":\"hi\"}\n\ndata: [DONE]\n\n", { headers: { "content-type": "text/event-stream" } }),
    );
    expect(res.headers.get("content-type")).toBe("text/event-stream");
    expect(await res.text()).toBe('data: {"content":"hi"}\n\ndata: [DONE]\n\n');
  });
});

describe("forwardToApi", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("forwards only the session cookie, the body, query and client IP", async () => {
    const seen: { url?: string; init?: RequestInit } = {};
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      seen.url = url;
      seen.init = init;
      return new Response(JSON.stringify({ data: { ok: true } }), { headers: { "content-type": "application/json" } });
    });
    const req = new Request("https://orion.africa/api/chat?x=1", {
      method: "POST",
      headers: {
        cookie: "theme=dark; orion_session=tok_123; other=secret",
        "content-type": "application/json",
        "x-forwarded-for": "198.51.100.7, 10.0.0.1",
      },
      body: JSON.stringify({ message: "hi" }),
    });
    const res = await forwardToApi(req, "/v1/chat", "http://api.internal");
    expect(await res.json()).toEqual({ ok: true });
    expect(seen.url).toBe("http://api.internal/v1/chat?x=1");
    const h = new Headers(seen.init!.headers);
    expect(h.get("cookie")).toBe("orion_session=tok_123");
    expect(h.get("x-orion-client-ip")).toBe("198.51.100.7");
    expect(seen.init!.redirect).toBe("manual");
  });
});
