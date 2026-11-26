import { createRoute, z } from "@hono/zod-openapi";
import { describe, expect, it } from "vitest";
import { ApiError } from "../src/lib/errors";
import { ALLOWED, json, makeApp } from "./helpers";

describe("system routes", () => {
  it("GET /healthz returns ok with version", async () => {
    const res = await makeApp().request("/healthz");
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body).toMatchObject({ status: "ok", version: "test-sha" });
    expect(typeof body.uptimeSeconds).toBe("number");
  });

  it("GET /readyz is 200 when the database answers", async () => {
    const res = await makeApp({ dbOk: true }).request("/readyz");
    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ status: "ready", checks: { database: "ok" } });
  });

  it("GET /readyz is 503 when the database is down", async () => {
    const res = await makeApp({ dbOk: false }).request("/readyz");
    expect(res.status).toBe(503);
    expect(await json(res)).toEqual({ status: "degraded", checks: { database: "error" } });
  });
});

describe("error envelope", () => {
  it("unknown routes return a 404 envelope with a request id", async () => {
    const res = await makeApp().request("/v1/nope");
    expect(res.status).toBe(404);
    const body = await json(res);
    expect(body.error.code).toBe("not_found");
    expect(body.error.requestId).toBe(res.headers.get("X-Request-Id"));
  });

  it("ApiError maps to its status and code", async () => {
    const app = makeApp();
    app.get("/test/conflict", () => {
      throw new ApiError(409, "conflict", "Already exists", { field: "email" });
    });
    const res = await app.request("/test/conflict");
    expect(res.status).toBe(409);
    expect((await json(res)).error).toMatchObject({ code: "conflict", message: "Already exists", details: { field: "email" } });
  });

  it("unexpected errors return 500 without leaking the message", async () => {
    const app = makeApp();
    app.get("/test/boom", () => {
      throw new Error("secret connection string leaked");
    });
    const res = await app.request("/test/boom");
    expect(res.status).toBe(500);
    const body = await json(res);
    expect(body.error.code).toBe("internal_error");
    expect(JSON.stringify(body)).not.toContain("secret");
  });

  it("request validation failures return 400 validation_failed", async () => {
    const app = makeApp();
    const route = createRoute({
      method: "get",
      path: "/test/validate",
      request: { query: z.object({ n: z.coerce.number().int().min(1) }) },
      responses: { 200: { description: "ok" } },
    });
    app.openapi(route, (c) => c.json({ n: c.req.valid("query").n }, 200));
    const res = await app.request("/test/validate?n=0");
    expect(res.status).toBe(400);
    const body = await json(res);
    expect(body.error.code).toBe("validation_failed");
    expect(body.error.details[0].path).toBe("n");
  });
});

describe("CORS", () => {
  it("allows listed origins with credentials", async () => {
    const res = await makeApp().request("/healthz", { headers: { Origin: ALLOWED } });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(ALLOWED);
    expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
  });

  it("does not reflect unlisted origins", async () => {
    const res = await makeApp().request("/healthz", { headers: { Origin: "https://evil.example" } });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});

describe("OpenAPI document", () => {
  it("is served outside production", async () => {
    const res = await makeApp().request("/v1/openapi.json");
    expect(res.status).toBe(200);
    const doc = await json(res);
    expect(Object.keys(doc.paths)).toEqual(expect.arrayContaining(["/healthz", "/readyz"]));
  });

  it("is hidden in production", async () => {
    const res = await makeApp({ nodeEnv: "production" }).request("/v1/openapi.json");
    expect(res.status).toBe(404);
  });
});

describe("typed client", () => {
  it("calls /healthz with inferred response types", async () => {
    const { createApiClient } = await import("../src/client");
    const app = makeApp();
    const client = createApiClient("http://api.test", {
      fetch: ((input: string | URL | Request, init?: RequestInit) => app.request(input, init)) as typeof fetch,
    });
    const res = await client.healthz.$get();
    expect(res.status).toBe(200);
    const body = await res.json();
    // `body.version` is typed as string via the route schema — this line fails typecheck if inference breaks.
    const version: string = body.version;
    expect(version).toBe("test-sha");
  });
});

describe("security headers", () => {
  it("allows same-site embedding of API resources and sets nosniff", async () => {
    const res = await makeApp().request("/healthz");
    expect(res.headers.get("Cross-Origin-Resource-Policy")).toBe("same-site");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });
});
