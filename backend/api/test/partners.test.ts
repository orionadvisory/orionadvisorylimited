import { describe, expect, it } from "vitest";
import type { PartnersRepo } from "../src/modules/partners/repo";
import { ALLOWED, json, makeApp } from "./helpers";

const ID = "6f1c2a7e-3b4d-4c5e-8f9a-0b1c2d3e4f5a";
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

const repo = (overrides: Partial<PartnersRepo> = {}): PartnersRepo => ({
  list: async () => [{ id: ID, name: "Acme Ventures" }],
  getLogo: async (id) => (id === ID ? { bytes: PNG, contentType: "image/png" } : null),
  ...overrides,
});

describe("GET /v1/partners", () => {
  it("lists partners with their API logo path", async () => {
    const res = await makeApp({ partners: repo() }).request("/v1/partners");
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=60");
    expect(await json(res)).toEqual({
      data: [{ id: ID, name: "Acme Ventures", logoPath: `/v1/partners/${ID}/logo` }],
    });
  });

  it("returns an empty list when there are no partners", async () => {
    const res = await makeApp({ partners: repo({ list: async () => [] }) }).request("/v1/partners");
    expect(await json(res)).toEqual({ data: [] });
  });
});

describe("GET /v1/partners/:id/logo", () => {
  it("streams the logo bytes with a long immutable cache", async () => {
    const res = await makeApp({ partners: repo() }).request(`/v1/partners/${ID}/logo`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=86400, immutable");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(PNG);
  });

  it("sends CORS headers so the landing page can read pixels via crossOrigin=anonymous", async () => {
    const res = await makeApp({ partners: repo() }).request(`/v1/partners/${ID}/logo`, {
      headers: { Origin: ALLOWED },
    });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(ALLOWED);
    expect(res.headers.get("Vary")).toContain("Origin");
  });

  it("404s for an unknown partner", async () => {
    const res = await makeApp({ partners: repo() }).request("/v1/partners/00000000-0000-4000-8000-000000000000/logo");
    expect(res.status).toBe(404);
    expect((await json(res)).error.code).toBe("not_found");
  });

  it("400s for a malformed id instead of hitting the database", async () => {
    let called = false;
    const res = await makeApp({
      partners: repo({ getLogo: async () => ((called = true), null) }),
    }).request("/v1/partners/not-a-uuid/logo");
    expect(res.status).toBe(400);
    expect((await json(res)).error.code).toBe("validation_failed");
    expect(called).toBe(false);
  });

  it("502s without leaking storage details when R2 fails", async () => {
    const res = await makeApp({
      partners: repo({
        getLogo: async () => {
          throw new Error("AccessDenied: bucket orion-private key r2-secret");
        },
      }),
    }).request(`/v1/partners/${ID}/logo`);
    expect(res.status).toBe(502);
    const body = await json(res);
    expect(body.error.code).toBe("service_unavailable");
    expect(JSON.stringify(body)).not.toMatch(/AccessDenied|r2-secret|bucket/);
  });
});
