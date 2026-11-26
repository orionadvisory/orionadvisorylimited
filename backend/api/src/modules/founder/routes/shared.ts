import { ErrorResponseSchema } from "@orion/contracts";
import type { Context } from "hono";
import type { z } from "zod";
import { ApiError } from "../../../lib/errors";
import { parseJsonLoose, type Llm } from "../../../lib/llm";
import type { AiLimits } from "../../../lib/rate-limit";
import type { Storage } from "../../../lib/storage";
import type { FounderRepo } from "../repo";

export type FounderDeps = { repo: FounderRepo; llm: Llm; storage: Storage; limits: AiLimits };

export const json = <T>(schema: T) => ({ "application/json": { schema } });
export const errorResponse = (description: string) => ({ description, content: json(ErrorResponseSchema) });

/** The signed-in user's id. Routes using this must also declare `middleware: [requireUser]`. */
export function currentUserId(c: Context): string {
  const session = c.get("session");
  if (!session) throw new ApiError(401, "unauthorized", "Sign in required");
  return session.user.id;
}

function tooMany(retryAfterSeconds: number, message: string): ApiError {
  return new ApiError(429, "rate_limited", message, { retryAfterSeconds });
}

/** Per-user cap on LLM-backed calls. */
export function enforceUserAiLimit(deps: FounderDeps, userId: string) {
  const retry = deps.limits.perUser.hit(userId);
  if (retry) throw tooMany(retry, "You've reached the hourly limit for AI requests. Please try again later.");
}

/** Guest (signed-out) health checks: per client IP and a global ceiling. */
export function enforceGuestAiLimit(deps: FounderDeps, c: Context) {
  const ip =
    c.req.header("x-orion-client-ip") ?? c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const retry = deps.limits.guestScoringPerIp.hit(ip) || deps.limits.guestScoringGlobal.hit("all");
  if (retry) throw tooMany(retry, "Too many health checks right now. Please try again later.");
}

/**
 * Ask the model for JSON and validate it. Provider failures and malformed output both
 * surface as a 502 with a friendly message; raw model output is logged, never returned.
 */
export async function completeJson<S extends z.ZodType>(
  llm: Llm,
  system: string,
  user: string,
  schema: S,
  failureMessage: string,
): Promise<z.infer<S>> {
  let raw: string;
  try {
    raw = await llm.complete(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.4, maxTokens: 4000 },
    );
  } catch (err) {
    console.error(JSON.stringify({ level: "error", msg: "llm request failed", err: String(err) }));
    throw new ApiError(502, "service_unavailable", failureMessage);
  }

  let parsed: unknown;
  try {
    parsed = parseJsonLoose(raw);
  } catch {
    console.error(JSON.stringify({ level: "error", msg: "llm returned non-JSON", sample: raw.slice(0, 300) }));
    throw new ApiError(502, "service_unavailable", failureMessage);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error(JSON.stringify({ level: "error", msg: "llm JSON failed validation", issues: result.error.issues.slice(0, 5) }));
    throw new ApiError(502, "service_unavailable", failureMessage);
  }
  return result.data;
}
