import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  CompleteOnboardingBodySchema,
  HealthCheckResultSchema,
  PersistGuestCheckBodySchema,
  ScoreHealthCheckBodySchema,
} from "@orion/contracts";
import { ApiError } from "../../../lib/errors";
import { requireUser } from "../../../middleware/session";
import {
  ASSESSMENT_SYSTEM_PROMPT,
  REEVALUATION_SYSTEM_PROMPT,
  buildAssessmentBrief,
  buildAssessmentPrompt,
} from "../prompts";
import type { TemplateBundle } from "../repo";
import {
  completeJson,
  currentUserId,
  enforceGuestAiLimit,
  enforceUserAiLimit,
  errorResponse,
  json,
  type FounderDeps,
} from "./shared";

const ASSESSMENT_FAILED = "The AI assessment could not be generated. Please try again.";

const scoreRoute = createRoute({
  method: "post",
  path: "/v1/health-check",
  tags: ["health-check"],
  summary: "Score a completed questionnaire with the AI (works signed in or as a guest; does not save)",
  request: { body: { content: json(ScoreHealthCheckBodySchema), required: true } },
  responses: {
    200: { description: "Assessment result", content: json(z.object({ data: HealthCheckResultSchema })) },
    400: errorResponse("Invalid body"),
    404: errorResponse("Template not found"),
    429: errorResponse("Rate limited"),
    502: errorResponse("AI unavailable"),
  },
});

const persistRoute = createRoute({
  method: "post",
  path: "/v1/health-check/persist",
  tags: ["health-check"],
  summary: "Save a guest health-check result to the signed-in account",
  middleware: [requireUser] as const,
  request: { body: { content: json(PersistGuestCheckBodySchema), required: true } },
  responses: {
    201: {
      description: "Saved",
      content: json(z.object({ data: z.object({ assessmentId: z.uuid(), startupId: z.uuid() }) })),
    },
    400: errorResponse("Invalid body"),
    401: errorResponse("Not signed in"),
    404: errorResponse("Account no longer exists"),
  },
});

const ReevaluationResultSchema = HealthCheckResultSchema.and(
  z.object({ scoreChange: z.number().optional(), commentary: z.string().optional() }).passthrough(),
);

const reevaluateRoute = createRoute({
  method: "post",
  path: "/v1/health-check/reevaluate",
  tags: ["health-check"],
  summary: "Re-score legal health after the founder has taken action",
  middleware: [requireUser] as const,
  responses: {
    200: { description: "New score", content: json(z.object({ data: z.record(z.string(), z.unknown()) })) },
    401: errorResponse("Not signed in"),
    404: errorResponse("Nothing to re-evaluate yet"),
    429: errorResponse("Rate limited"),
    502: errorResponse("AI unavailable"),
  },
});

const onboardingRoute = createRoute({
  method: "post",
  path: "/v1/onboarding/complete",
  tags: ["health-check"],
  summary: "Save the onboarding assessment result and mark onboarding complete",
  middleware: [requireUser] as const,
  request: { body: { content: json(CompleteOnboardingBodySchema), required: true } },
  responses: {
    200: { description: "Saved", content: json(z.object({ data: z.object({ assessmentId: z.uuid() }) })) },
    400: errorResponse("Invalid body"),
    401: errorResponse("Not signed in"),
  },
});

/**
 * Text of documents attached to answers (keys ending `__file`). Files are resolved by
 * uploadId against the caller's own uploads; a client-supplied storage key is never used,
 * so nobody can pull someone else's file into their assessment. Guests can't attach files.
 */
async function attachedDocuments(
  deps: FounderDeps,
  userId: string | null,
  answers: Record<string, string | string[]>,
  bundle: TemplateBundle,
): Promise<string> {
  const entries = Object.entries(answers).filter(([k, v]) => k.endsWith("__file") && typeof v === "string" && v);
  if (!userId || entries.length === 0) return "";

  let context = `\n═══════════════════════════════════════\nUPLOADED DOCUMENTS\n═══════════════════════════════════════\n`;
  for (const [key, value] of entries) {
    try {
      const { uploadId } = JSON.parse(value as string) as { uploadId?: string };
      if (!uploadId) continue;
      const upload = await deps.repo.findUploadForUser(uploadId, userId);
      if (!upload) continue;
      const parentKey = key.replace("__file", "");
      const question = bundle.questions.find((q) => q.questionKey === parentKey);
      const text = await deps.storage.extractText(await deps.storage.getBuffer(upload.storageKey), upload.name);
      context += `\nDocument for: "${question?.prompt ?? parentKey}"\nFile: ${upload.name}\nContent:\n${text}\n\n`;
    } catch (err) {
      console.error(JSON.stringify({ level: "warn", msg: "attached document skipped", key, err: String(err) }));
    }
  }
  return context;
}

export function healthCheckRoutes(deps: FounderDeps) {
  return new OpenAPIHono()
    .openapi(scoreRoute, async (c) => {
      const userId = c.get("session")?.user.id ?? null;
      if (userId) enforceUserAiLimit(deps, userId);
      else enforceGuestAiLimit(deps, c);

      const { templateId, answers } = c.req.valid("json");
      if (Object.keys(answers).length === 0) throw new ApiError(400, "bad_request", "answers are required");

      const bundle = await deps.repo.getTemplateBundle(templateId);
      if (!bundle) throw new ApiError(404, "not_found", "Template not found");

      const { brief, domains } = buildAssessmentBrief(bundle, answers);
      const files = await attachedDocuments(deps, userId, answers, bundle);
      const result = await completeJson(
        deps.llm,
        ASSESSMENT_SYSTEM_PROMPT,
        buildAssessmentPrompt(brief, files, domains),
        HealthCheckResultSchema,
        ASSESSMENT_FAILED,
      );

      return c.json(
        {
          data: {
            ...result,
            completedAt: new Date().toISOString(),
            templateId,
            answeredQuestions: Object.keys(answers).length,
            totalQuestions: bundle.questions.length,
          },
        },
        200,
      );
    })
    .openapi(persistRoute, async (c) => {
      const userId = currentUserId(c);
      if (!(await deps.repo.userExists(userId))) {
        throw new ApiError(404, "not_found", "Your account no longer exists. Please sign up again.");
      }
      const { result } = c.req.valid("json");
      return c.json({ data: await deps.repo.persistGuestCheck(userId, result) }, 201);
    })
    .openapi(reevaluateRoute, async (c) => {
      const userId = currentUserId(c);
      const ctx = await deps.repo.getReevaluationContext(userId);
      if (ctx === "no_startup") throw new ApiError(404, "not_found", "No startup found");
      if (ctx === "no_assessment") throw new ApiError(404, "not_found", "No previous assessment found");
      if (ctx === "no_profile") throw new ApiError(404, "not_found", "No profile data found");
      enforceUserAiLimit(deps, userId);

      const { buildReevaluationPrompt } = await import("@orion/core/health-check/scoring");
      const prompt = buildReevaluationPrompt(
        ctx.profile as unknown as Parameters<typeof buildReevaluationPrompt>[0],
        ctx.docsHeld,
        ctx.generatedDocNames,
        ctx.previousScore,
        ctx.previousIssueCount,
      );
      const result = await completeJson(
        deps.llm,
        REEVALUATION_SYSTEM_PROMPT,
        prompt,
        ReevaluationResultSchema,
        "The re-evaluation could not be generated. Please try again.",
      );
      await deps.repo.saveReevaluation(ctx, result);

      return c.json(
        {
          data: {
            overallScore: result.overallScore,
            previousScore: ctx.previousScore,
            scoreChange: result.scoreChange ?? result.overallScore - ctx.previousScore,
            riskLevel: result.riskLevel,
            commentary: result.commentary || result.summary,
            summary: result.summary,
            domainScores: result.domainScores,
            issues: result.issues,
            priorityActions: result.priorityActions,
            generatedDocCount: ctx.generatedDocNames.length,
          },
        },
        200,
      );
    })
    .openapi(onboardingRoute, async (c) => {
      const userId = currentUserId(c);
      const { templateId, answers, result } = c.req.valid("json");
      const rawName = answers.__startup_name;
      const startupName = typeof rawName === "string" && rawName.trim() ? rawName.trim().slice(0, 255) : "My Startup";
      const assessmentId = await deps.repo.completeOnboarding({ userId, templateId, startupName, answers, result });
      return c.json({ data: { assessmentId } }, 200);
    });
}
