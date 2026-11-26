import { OpenAPIHono } from "@hono/zod-openapi";
import { assessmentFlowRoutes } from "./assessments";
import { chatRoutes } from "./chat";
import { documentsRoutes } from "./documents";
import { healthCheckRoutes } from "./health-check";
import { entityRoutes } from "./entities";
import { complianceRoutes } from "./compliance";
import { workspaceRoutes } from "./workspace";
import { meRoutes } from "./me";
import type { FounderDeps } from "./shared";

export type { FounderDeps } from "./shared";

/** Every founder-facing endpoint (dashboard, issues, referrals, assessments, health check, documents, chat). */
export function founderRoutes(deps: FounderDeps) {
  return new OpenAPIHono()
    .route("/", meRoutes(deps))
    .route("/", entityRoutes(deps))
    .route("/", complianceRoutes(deps))
    .route("/", workspaceRoutes(deps))
    .route("/", assessmentFlowRoutes(deps))
    .route("/", healthCheckRoutes(deps))
    .route("/", documentsRoutes(deps))
    .route("/", chatRoutes(deps));
}
