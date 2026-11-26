import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { HealthSchema, ReadinessSchema } from "@orion/contracts";

const startedAt = Date.now();

const healthRoute = createRoute({
  method: "get",
  path: "/healthz",
  tags: ["system"],
  summary: "Liveness probe",
  responses: {
    200: { description: "Process is up", content: { "application/json": { schema: HealthSchema } } },
  },
});

const readyRoute = createRoute({
  method: "get",
  path: "/readyz",
  tags: ["system"],
  summary: "Readiness probe (checks dependencies)",
  responses: {
    200: { description: "Ready", content: { "application/json": { schema: ReadinessSchema } } },
    503: { description: "Degraded", content: { "application/json": { schema: ReadinessSchema } } },
  },
});

export function systemRoutes(deps: { version: string; checkDb: () => Promise<boolean> }) {
  return new OpenAPIHono()
    .openapi(healthRoute, (c) =>
      c.json(
        {
          status: "ok" as const,
          version: deps.version,
          uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
        },
        200,
      ),
    )
    .openapi(readyRoute, async (c) => {
      const dbOk = await deps.checkDb();
      const body = {
        status: dbOk ? ("ready" as const) : ("degraded" as const),
        checks: { database: dbOk ? ("ok" as const) : ("error" as const) },
      };
      return dbOk ? c.json(body, 200) : c.json(body, 503);
    });
}
