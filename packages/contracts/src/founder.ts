import { z } from "@hono/zod-openapi";

/** Founder-facing contracts (dashboard, issues, referrals, assessments, documents, chat). */

const iso = z.string(); // ISO-8601 timestamps on the wire; frontends convert to Date where they need one.

// ─── Dashboard ───────────────────────────────────────────

export const DashboardSchema = z
  .object({
    user: z.object({
      id: z.uuid(),
      name: z.string(),
      email: z.string(),
      role: z.enum(["member", "admin"]),
      status: z.enum(["active", "suspended"]),
    }),
    startup: z
      .object({
        id: z.uuid(),
        name: z.string(),
        stage: z.string().nullable(),
        structure: z.string().nullable(),
        primaryJurisdiction: z.string().nullable(),
        riskScore: z.number().nullable(),
      })
      .nullable(),
    stats: z.object({
      documentCount: z.number().int(),
      issueCount: z.number().int(),
      resolvedCount: z.number().int(),
      criticalCount: z.number().int(),
    }),
    issues: z.array(
      z.object({ id: z.uuid(), title: z.string(), severity: z.string(), domain: z.string(), isResolved: z.boolean() }),
    ),
    recentDocs: z.array(
      z.object({
        id: z.uuid(),
        name: z.string(),
        type: z.string(),
        status: z.string(),
        source: z.enum(["generated", "uploaded"]),
        createdAt: iso,
      }),
    ),
    healthCheck: z
      .object({
        overallScore: z.number(),
        riskLevel: z.string(),
        summary: z.string(),
        domainScores: z.record(z.string(), z.object({ score: z.number(), issues: z.number() })),
        priorityActions: z.array(z.string()),
        completedAt: iso,
      })
      .nullable(),
  })
  .openapi("Dashboard");
export type DashboardDto = z.infer<typeof DashboardSchema>;

// ─── Issues & referrals ──────────────────────────────────

export const IssueSchema = z
  .object({
    id: z.uuid(),
    title: z.string(),
    description: z.string(),
    domain: z.string(),
    severity: z.string(),
    resolutionPath: z.string(),
    isResolved: z.boolean(),
  })
  .openapi("Issue");
export type IssueDto = z.infer<typeof IssueSchema>;

export const ReferralSchema = z
  .object({
    id: z.uuid(),
    status: z.string(),
    issueSummary: z.string().nullable(),
    providerNotes: z.string().nullable(),
    createdAt: iso,
    updatedAt: iso,
    issueTitle: z.string(),
    issueSeverity: z.string(),
    issueDomain: z.string(),
  })
  .openapi("Referral");
export type ReferralDto = z.infer<typeof ReferralSchema>;

export const CreateReferralBodySchema = z
  .object({
    issueId: z.uuid(),
    issueSummary: z.string().trim().min(1).max(5000),
  })
  .openapi("CreateReferralBody");

// ─── ORION 2 entities ──────────────────────────────────

export const EntityStatusSchema = z.enum(["active", "archived"]);

export const EntitySchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    tradingName: z.string().nullable(),
    legalType: z.string(),
    jurisdiction: z.string(),
    state: z.string().nullable(),
    registrationNumber: z.string().nullable(),
    registeredAddress: z.string().nullable(),
    industry: z.string().nullable(),
    financialYearEnd: z.string().nullable(),
    taxId: z.string().nullable(),
    role: z.string().nullable(),
    status: EntityStatusSchema,
    incorporatedAt: iso.nullable(),
    createdAt: iso,
    updatedAt: iso,
  })
  .openapi("Entity");
export type EntityDto = z.infer<typeof EntitySchema>;

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();

export const CreateEntityBodySchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    tradingName: optionalText(255),
    legalType: z.string().trim().min(1).max(255),
    jurisdiction: z.string().trim().min(1).max(255),
    state: optionalText(255),
    registrationNumber: optionalText(255),
    registeredAddress: optionalText(2000),
    industry: optionalText(255),
    financialYearEnd: z.string().regex(/^\d{2}-\d{2}$/).nullable().optional(),
    taxId: optionalText(255),
    role: optionalText(255),
    incorporatedAt: z.iso.datetime().nullable().optional(),
  })
  .openapi("CreateEntityBody");
export type CreateEntityBodyDto = z.infer<typeof CreateEntityBodySchema>;

export const UpdateEntityBodySchema = CreateEntityBodySchema.partial()
  .extend({ status: EntityStatusSchema.optional() })
  .refine((value) => Object.keys(value).length > 0, { message: "At least one field is required" })
  .openapi("UpdateEntityBody");
export type UpdateEntityBodyDto = z.infer<typeof UpdateEntityBodySchema>;

export const EntityIdParamSchema = z.object({
  id: z.uuid().openapi({ param: { name: "id", in: "path" } }),
});

// ─── ORION 2 compliance obligations ────────────────────

export const ObligationStatusSchema = z.enum([
  "needs_confirmation", "upcoming", "in_progress", "awaiting_documents",
  "ready_for_filing", "submitted", "completed", "overdue", "not_applicable",
]);
export const DateStatusSchema = z.enum(["confirmed", "pending_confirmation"]);

export const ObligationSchema = z.object({
  id: z.uuid(), entityId: z.uuid(), entityName: z.string(), ruleId: z.uuid().nullable(),
  title: z.string(), regulator: z.string().nullable(), category: z.string(),
  status: ObligationStatusSchema, dueAt: iso.nullable(), dateStatus: DateStatusSchema,
  explanation: z.string().nullable(), source: z.enum(["user", "rule", "event"]),
  completedAt: iso.nullable(), createdAt: iso, updatedAt: iso,
}).openapi("ComplianceObligation");
export type ObligationDto = z.infer<typeof ObligationSchema>;

export const CreateObligationBodySchema = z.object({
  entityId: z.uuid(), title: z.string().trim().min(1).max(500),
  regulator: optionalText(255), category: z.string().trim().min(1).max(100),
  dueAt: z.iso.datetime().nullable().optional(), explanation: optionalText(5000),
}).openapi("CreateObligationBody");
export type CreateObligationBodyDto = z.infer<typeof CreateObligationBodySchema>;

export const UpdateObligationBodySchema = z.object({
  status: ObligationStatusSchema.optional(), dueAt: z.iso.datetime().nullable().optional(),
  dateStatus: DateStatusSchema.optional(), explanation: optionalText(5000),
}).refine((value) => Object.keys(value).length > 0, { message: "At least one field is required" }).openapi("UpdateObligationBody");
export type UpdateObligationBodyDto = z.infer<typeof UpdateObligationBodySchema>;

export const ObligationIdParamSchema = z.object({ id: z.uuid().openapi({ param: { name: "id", in: "path" } }) });

// ─── ORION 2 workspace team access ─────────────────────

export const WorkspaceRoleSchema = z.enum([
  "owner", "administrator", "compliance_manager", "contributor", "reviewer", "viewer", "external_adviser",
]);
export type WorkspaceRole = z.infer<typeof WorkspaceRoleSchema>;

export const WorkspacePermissionSchema = z.enum([
  "entity:read", "entity:manage", "obligation:read", "obligation:manage", "obligation:progress", "members:manage",
]);
export type WorkspacePermission = z.infer<typeof WorkspacePermissionSchema>;

export const EntityScopeSchema = z.enum(["all", "selected"]);

export const WorkspaceAccessSchema = z.object({
  workspaceId: z.uuid(), workspaceName: z.string(), role: WorkspaceRoleSchema,
  entityScope: EntityScopeSchema, entityIds: z.array(z.uuid()).nullable(),
  permissions: z.array(WorkspacePermissionSchema),
}).openapi("WorkspaceAccess");
export type WorkspaceAccessDto = z.infer<typeof WorkspaceAccessSchema>;

export const WorkspaceMemberSchema = z.object({
  id: z.uuid(), userId: z.uuid(), name: z.string().nullable(), email: z.string(),
  role: WorkspaceRoleSchema, entityScope: EntityScopeSchema, entityIds: z.array(z.uuid()),
  createdAt: iso,
}).openapi("WorkspaceMember");
export type WorkspaceMemberDto = z.infer<typeof WorkspaceMemberSchema>;

/** `entityIds` omitted or null = access to every entity; an array = only those entities. */
export const AddMemberBodySchema = z.object({
  email: z.string().trim().toLowerCase().max(255).email(),
  role: WorkspaceRoleSchema,
  entityIds: z.array(z.uuid()).max(500).nullable().optional(),
}).openapi("AddMemberBody");
export type AddMemberBodyDto = z.infer<typeof AddMemberBodySchema>;

export const UpdateMemberBodySchema = z.object({
  role: WorkspaceRoleSchema.optional(),
  entityIds: z.array(z.uuid()).max(500).nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, { message: "At least one field is required" }).openapi("UpdateMemberBody");
export type UpdateMemberBodyDto = z.infer<typeof UpdateMemberBodySchema>;

export const MemberIdParamSchema = z.object({ id: z.uuid().openapi({ param: { name: "id", in: "path" } }) });

// ─── Assessment drafts & start ───────────────────────────

const AnswerValue = z.union([z.string(), z.array(z.string())]);
export const AnswersSchema = z.record(z.string(), AnswerValue);

export const DraftPayloadSchema = z
  .object({
    answers: AnswersSchema,
    currentSectionIdx: z.number().int().min(0),
    completedSectionIds: z.array(z.string()),
  })
  .openapi("DraftPayload");
export type DraftPayloadDto = z.infer<typeof DraftPayloadSchema>;

export const DraftSchema = DraftPayloadSchema.extend({ updatedAt: iso }).openapi("Draft");
export type DraftDto = z.infer<typeof DraftSchema>;

export const TemplateIdParamSchema = z.object({
  templateId: z.uuid().openapi({ param: { name: "templateId", in: "path" } }),
});

export const StartAssessmentBodySchema = z.object({ templateId: z.uuid() }).openapi("StartAssessmentBody");

// ─── Health check results (AI output: core fields required, extras passed through) ──

export const HealthCheckIssueSchema = z
  .object({
    title: z.string(),
    description: z.string().default(""),
    domain: z.string().default("general"),
    severity: z.string().default("medium"),
    resolutionPath: z.string().default("self_serve"),
    recommendation: z.object({ title: z.string(), description: z.string() }).optional(),
  })
  .passthrough();

export const HealthCheckResultSchema = z
  .object({
    overallScore: z.number().min(0).max(100),
    riskLevel: z.string(),
    summary: z.string().default(""),
    domainScores: z.record(z.string(), z.object({ score: z.number(), issues: z.number() })).default({}),
    issues: z.array(HealthCheckIssueSchema).default([]),
    priorityActions: z.array(z.string()).default([]),
  })
  .passthrough()
  .openapi("HealthCheckResult");
export type HealthCheckResultDto = z.infer<typeof HealthCheckResultSchema>;

export const ScoreHealthCheckBodySchema = z
  .object({ templateId: z.uuid(), answers: AnswersSchema })
  .openapi("ScoreHealthCheckBody");

export const CompleteOnboardingBodySchema = z
  .object({ templateId: z.uuid(), answers: AnswersSchema, result: HealthCheckResultSchema })
  .openapi("CompleteOnboardingBody");

/** The original guest health-check result (profile + documents held) saved after signup. */
export const PersistGuestCheckBodySchema = z
  .object({
    result: HealthCheckResultSchema.and(
      z
        .object({
          completedAt: z.string(),
          profile: z.record(z.string(), z.unknown()).default({}),
          documentsHeld: z.array(z.string()).default([]),
        })
        .passthrough(),
    ),
  })
  .openapi("PersistGuestCheckBody");

// ─── Documents ───────────────────────────────────────────

export const DocumentListItemSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    type: z.string(),
    status: z.string(),
    content: z.string().nullable(),
    source: z.enum(["generated", "uploaded"]),
    createdAt: iso,
  })
  .openapi("DocumentListItem");

export const GenerateDocumentBodySchema = z
  .object({
    templateId: z.string().min(1).max(100),
    fields: z.record(z.string(), z.string().max(5000)),
  })
  .openapi("GenerateDocumentBody");

export const DocumentIdParamSchema = z.object({
  id: z.uuid().openapi({ param: { name: "id", in: "path" } }),
});

// ─── Chat ────────────────────────────────────────────────

export const ChatBodySchema = z
  .object({
    message: z.string().trim().min(1).max(4000),
    /** Ignored unless it is the caller's own startup. */
    startupId: z.uuid().optional(),
  })
  .openapi("ChatBody");
