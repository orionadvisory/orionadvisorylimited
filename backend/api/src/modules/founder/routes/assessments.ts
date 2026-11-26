import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { DraftPayloadSchema, DraftSchema, StartAssessmentBodySchema, TemplateIdParamSchema } from "@orion/contracts";
import { requireUser } from "../../../middleware/session";
import { currentUserId, errorResponse, json, type FounderDeps } from "./shared";

const getDraftRoute = createRoute({
  method: "get",
  path: "/v1/assessments/{templateId}/draft",
  tags: ["assessments"],
  summary: "Your saved progress on an assessment (null if none)",
  middleware: [requireUser] as const,
  request: { params: TemplateIdParamSchema },
  responses: {
    200: { description: "Draft or null", content: json(z.object({ data: DraftSchema.nullable() })) },
    401: errorResponse("Not signed in"),
  },
});

const saveDraftRoute = createRoute({
  method: "put",
  path: "/v1/assessments/{templateId}/draft",
  tags: ["assessments"],
  summary: "Save progress on an assessment",
  middleware: [requireUser] as const,
  request: { params: TemplateIdParamSchema, body: { content: json(DraftPayloadSchema), required: true } },
  responses: {
    200: { description: "Saved", content: json(z.object({ data: z.object({ updatedAt: z.string() }) })) },
    400: errorResponse("Invalid body"),
    401: errorResponse("Not signed in"),
  },
});

const clearDraftRoute = createRoute({
  method: "delete",
  path: "/v1/assessments/{templateId}/draft",
  tags: ["assessments"],
  summary: "Discard saved progress",
  middleware: [requireUser] as const,
  request: { params: TemplateIdParamSchema },
  responses: { 204: { description: "Cleared" }, 401: errorResponse("Not signed in") },
});

const startRoute = createRoute({
  method: "post",
  path: "/v1/assessments/start",
  tags: ["assessments"],
  summary: "Create or resume an in-progress assessment",
  middleware: [requireUser] as const,
  request: { body: { content: json(StartAssessmentBodySchema), required: true } },
  responses: {
    200: { description: "Assessment id", content: json(z.object({ data: z.object({ assessmentId: z.uuid() }) })) },
    400: errorResponse("Invalid body"),
    401: errorResponse("Not signed in"),
  },
});

export function assessmentFlowRoutes(deps: FounderDeps) {
  return new OpenAPIHono()
    .openapi(getDraftRoute, async (c) => {
      const { templateId } = c.req.valid("param");
      return c.json({ data: await deps.repo.getDraft(currentUserId(c), templateId) }, 200);
    })
    .openapi(saveDraftRoute, async (c) => {
      const { templateId } = c.req.valid("param");
      const updatedAt = await deps.repo.saveDraft(currentUserId(c), templateId, c.req.valid("json"));
      return c.json({ data: { updatedAt: updatedAt.toISOString() } }, 200);
    })
    .openapi(clearDraftRoute, async (c) => {
      const { templateId } = c.req.valid("param");
      await deps.repo.clearDraft(currentUserId(c), templateId);
      return c.body(null, 204);
    })
    .openapi(startRoute, async (c) => {
      const { templateId } = c.req.valid("json");
      const assessmentId = await deps.repo.startAssessment(currentUserId(c), templateId);
      return c.json({ data: { assessmentId } }, 200);
    });
}
