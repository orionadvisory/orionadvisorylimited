import { z } from "@hono/zod-openapi";

export const HealthSchema = z
  .object({
    status: z.literal("ok"),
    version: z.string(),
    uptimeSeconds: z.number(),
  })
  .openapi("Health");
export type Health = z.infer<typeof HealthSchema>;

export const ReadinessSchema = z
  .object({
    status: z.enum(["ready", "degraded"]),
    checks: z.object({
      database: z.enum(["ok", "error"]),
    }),
  })
  .openapi("Readiness");
export type Readiness = z.infer<typeof ReadinessSchema>;
