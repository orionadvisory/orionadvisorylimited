import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { CreateObligationBodySchema, ObligationIdParamSchema, ObligationSchema, UpdateObligationBodySchema } from "@orion/contracts";
import { ApiError } from "../../../lib/errors";
import { requireUser } from "../../../middleware/session";
import { currentUserId, errorResponse, json, type FounderDeps } from "./shared";

const listRoute = createRoute({ method: "get", path: "/v1/obligations", tags: ["compliance"], summary: "List the workspace compliance calendar", middleware: [requireUser] as const,
  responses: { 200: { description: "Compliance obligations", content: json(z.object({ data: z.array(ObligationSchema) })) }, 401: errorResponse("Not signed in") } });
const createObligationRoute = createRoute({ method: "post", path: "/v1/obligations", tags: ["compliance"], summary: "Add a user-managed obligation or deadline", middleware: [requireUser] as const,
  request: { body: { content: json(CreateObligationBodySchema), required: true } }, responses: { 201: { description: "Obligation created", content: json(z.object({ data: ObligationSchema })) }, 400: errorResponse("Invalid obligation"), 401: errorResponse("Not signed in"), 404: errorResponse("Entity not found") } });
const updateRoute = createRoute({ method: "patch", path: "/v1/obligations/{id}", tags: ["compliance"], summary: "Update deadline or preparation status", middleware: [requireUser] as const,
  request: { params: ObligationIdParamSchema, body: { content: json(UpdateObligationBodySchema), required: true } }, responses: { 200: { description: "Obligation updated", content: json(z.object({ data: ObligationSchema })) }, 400: errorResponse("Invalid update"), 401: errorResponse("Not signed in"), 404: errorResponse("Obligation not found") } });

export function complianceRoutes(deps: FounderDeps) {
  return new OpenAPIHono().openapi(listRoute, async (c) => { c.header("Cache-Control", "no-store"); return c.json({ data: await deps.repo.listObligations(currentUserId(c)) }, 200); })
    .openapi(createObligationRoute, async (c) => { const data = await deps.repo.createObligation(currentUserId(c), c.req.valid("json")); if (!data) throw new ApiError(404, "not_found", "Entity not found"); return c.json({ data }, 201); })
    .openapi(updateRoute, async (c) => { const data = await deps.repo.updateObligation(currentUserId(c), c.req.valid("param").id, c.req.valid("json")); if (!data) throw new ApiError(404, "not_found", "Obligation not found"); return c.json({ data }, 200); });
}
