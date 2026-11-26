import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { CreateReferralBodySchema, DashboardSchema, IssueSchema, ReferralSchema } from "@orion/contracts";
import { ApiError } from "../../../lib/errors";
import { requireUser } from "../../../middleware/session";
import { currentUserId, errorResponse, json, type FounderDeps } from "./shared";

const dashboardRoute = createRoute({
  method: "get",
  path: "/v1/me/dashboard",
  tags: ["founder"],
  summary: "Everything the founder dashboard shows",
  middleware: [requireUser] as const,
  responses: {
    200: { description: "Dashboard", content: json(z.object({ data: DashboardSchema })) },
    401: errorResponse("Not signed in"),
    404: errorResponse("User no longer exists"),
  },
});

const issuesRoute = createRoute({
  method: "get",
  path: "/v1/issues",
  tags: ["founder"],
  summary: "The founder's legal issues",
  middleware: [requireUser] as const,
  responses: {
    200: { description: "Issues", content: json(z.object({ data: z.array(IssueSchema) })) },
    401: errorResponse("Not signed in"),
  },
});

const listReferralsRoute = createRoute({
  method: "get",
  path: "/v1/referrals",
  tags: ["founder"],
  summary: "The founder's expert referrals",
  middleware: [requireUser] as const,
  responses: {
    200: { description: "Referrals", content: json(z.object({ data: z.array(ReferralSchema) })) },
    401: errorResponse("Not signed in"),
  },
});

const createReferralRoute = createRoute({
  method: "post",
  path: "/v1/referrals",
  tags: ["founder"],
  summary: "Request expert help for one of your issues",
  middleware: [requireUser] as const,
  request: { body: { content: json(CreateReferralBodySchema), required: true } },
  responses: {
    201: { description: "Referral created", content: json(z.object({ data: z.object({ referralId: z.uuid() }) })) },
    400: errorResponse("Invalid body"),
    401: errorResponse("Not signed in"),
    404: errorResponse("Issue not found (or not yours)"),
  },
});

export function meRoutes(deps: FounderDeps) {
  return new OpenAPIHono()
    .openapi(dashboardRoute, async (c) => {
      const data = await deps.repo.getDashboard(currentUserId(c));
      if (!data) throw new ApiError(404, "not_found", "Account not found");
      c.header("Cache-Control", "no-store");
      return c.json({ data }, 200);
    })
    .openapi(issuesRoute, async (c) => c.json({ data: await deps.repo.listIssues(currentUserId(c)) }, 200))
    .openapi(listReferralsRoute, async (c) => c.json({ data: await deps.repo.listReferrals(currentUserId(c)) }, 200))
    .openapi(createReferralRoute, async (c) => {
      const userId = currentUserId(c);
      const { issueId, issueSummary } = c.req.valid("json");
      // Ownership check: you can only refer your own startup's issues.
      const issue = await deps.repo.findIssueForUser(issueId, userId);
      if (!issue) throw new ApiError(404, "not_found", "Issue not found");
      const referralId = await deps.repo.createReferral({
        userId,
        issueId,
        startupId: issue.startupId,
        issueSummary,
        issueTitle: issue.title,
      });
      return c.json({ data: { referralId } }, 201);
    });
}
