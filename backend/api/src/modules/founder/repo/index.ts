import { assessmentsRepo } from "./assessments";
import { chatRepo } from "./chat";
import { dashboardRepo } from "./dashboard";
import { documentsRepo } from "./documents";
import { entitiesRepo } from "./entities";
import { complianceRepo } from "./compliance";
import { workspaceRepo } from "./workspace";
import type { FounderRepo } from "./types";

export type * from "./types";

/** Drizzle-backed implementation of every founder-side database operation. */
export const founderRepo: FounderRepo = {
  ...dashboardRepo,
  ...assessmentsRepo,
  ...documentsRepo,
  ...chatRepo,
  ...entitiesRepo,
  ...complianceRepo,
  ...workspaceRepo,
};
