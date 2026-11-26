import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ErrorResponseSchema, PublishedAssessmentResponseSchema } from "@orion/contracts";
import { ApiError } from "../../lib/errors";
import type { AssessmentsRepo } from "./repo";

const publishedRoute = createRoute({
  method: "get",
  path: "/v1/assessments/published",
  tags: ["assessments"],
  summary: "The published Legal Health Check (public)",
  responses: {
    200: {
      description: "Template with ordered sections and questions",
      content: { "application/json": { schema: PublishedAssessmentResponseSchema } },
    },
    404: { description: "No template is published", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});

export function assessmentsRoutes(repo: AssessmentsRepo) {
  return new OpenAPIHono().openapi(publishedRoute, async (c) => {
    const published = await repo.getPublished();
    if (!published) throw new ApiError(404, "not_found", "No assessment is published");
    return c.json({ data: published }, 200);
  });
}
