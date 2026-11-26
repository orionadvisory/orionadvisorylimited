import { z } from "@hono/zod-openapi";
import { UserRoleSchema, UserStatusSchema } from "./auth";

/** Admin console contracts. Timestamps are ISO strings on the wire. */

const iso = z.string();
const isoOrNull = z.string().nullable();
const trimmed = (max: number) => z.string().trim().min(1).max(max);
const optionalText = z
  .string()
  .trim()
  .max(10_000)
  .optional()
  .transform((v) => (v ? v : null));

export const TemplateStatusSchema = z.enum(["draft", "published", "archived"]);
export const SeveritySchema = z.enum(["critical", "high", "medium", "low", "info"]);
export const ResolutionPathSchema = z.enum(["self_serve", "document_generation", "expert_referral"]);

export const AdminPageQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
});

export const IdParamSchema = z.object({ id: z.uuid().openapi({ param: { name: "id", in: "path" } }) });

const paginated = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().int(),
    page: z.number().int(),
    perPage: z.number().int(),
    totalPages: z.number().int(),
  });

// ─── Users ───────────────────────────────────────────────

export const AdminUserStatsSchema = z
  .object({ total: z.number(), active: z.number(), suspended: z.number(), admins: z.number(), members: z.number() })
  .openapi("AdminUserStats");

export const AdminUserSchema = z
  .object({
    id: z.uuid(),
    name: z.string().nullable(),
    email: z.string(),
    role: UserRoleSchema,
    status: UserStatusSchema,
    createdAt: iso,
  })
  .openapi("AdminUser");
export const AdminUserPageSchema = paginated(AdminUserSchema).openapi("AdminUserPage");

export const UpdateUserRoleBodySchema = z.object({ role: UserRoleSchema }).openapi("UpdateUserRoleBody");
export const UpdateUserStatusBodySchema = z.object({ status: UserStatusSchema }).openapi("UpdateUserStatusBody");

// ─── Templates ───────────────────────────────────────────

export const AdminTemplateListItemSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    description: z.string().nullable(),
    status: TemplateStatusSchema,
    version: z.number().int(),
    publishedAt: isoOrNull,
    createdAt: iso,
    updatedAt: iso,
    createdByUserId: z.uuid(),
    sectionCount: z.number().int(),
    questionCount: z.number().int(),
    ruleCount: z.number().int(),
  })
  .openapi("AdminTemplateListItem");
export const AdminTemplatePageSchema = paginated(AdminTemplateListItemSchema).openapi("AdminTemplatePage");

export const TemplateStatusCountsSchema = z
  .object({ draft: z.number(), published: z.number(), archived: z.number() })
  .openapi("TemplateStatusCounts");

export const TemplateOptionSchema = z.object({ id: z.uuid(), name: z.string() }).openapi("TemplateOption");

const SectionRow = z.object({
  id: z.uuid(),
  templateId: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  orderIndex: z.number().int(),
  createdAt: iso,
  updatedAt: iso,
});
const QuestionRow = z.object({
  id: z.uuid(),
  sectionId: z.uuid(),
  questionKey: z.string(),
  prompt: z.string(),
  description: z.string().nullable(),
  inputType: z.string(),
  options: z.unknown(),
  domain: z.string().nullable(),
  required: z.boolean(),
  weight: z.number().int(),
  orderIndex: z.number().int(),
  createdAt: iso,
  updatedAt: iso,
});
const RuleRow = z.object({
  id: z.uuid(),
  templateId: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  condition: z.unknown(),
  severity: SeveritySchema,
  resolutionPath: ResolutionPathSchema,
  recommendationTitle: z.string(),
  recommendationDescription: z.string(),
  priority: z.number().int(),
  createdAt: iso,
  updatedAt: iso,
});

export const AdminTemplateDetailSchema = z
  .object({
    template: z.object({
      id: z.uuid(),
      name: z.string(),
      description: z.string().nullable(),
      status: TemplateStatusSchema,
      version: z.number().int(),
      createdByUserId: z.uuid(),
      publishedAt: isoOrNull,
      createdAt: iso,
      updatedAt: iso,
    }),
    sections: z.array(SectionRow),
    questions: z.array(QuestionRow),
    rules: z.array(RuleRow),
  })
  .openapi("AdminTemplateDetail");

export const TemplateBodySchema = z
  .object({ name: trimmed(255), description: optionalText })
  .openapi("TemplateBody");

export const SectionBodySchema = z
  .object({ title: trimmed(255), description: optionalText, orderIndex: z.number().int().min(0).max(10_000).default(0) })
  .openapi("SectionBody");

/** `options` is free-form JSON (choices etc.); null when the question has none. */
export const QuestionBodySchema = z
  .object({
    questionKey: trimmed(255),
    prompt: z.string().trim().min(1).max(5000),
    description: optionalText,
    inputType: z.string().trim().min(1).max(50).default("text"),
    options: z.unknown().nullable().default(null),
    domain: z
      .string()
      .trim()
      .max(255)
      .optional()
      .transform((v) => (v ? v : null)),
    required: z.boolean().default(true),
    weight: z.number().int().min(0).max(1000).default(1),
    orderIndex: z.number().int().min(0).max(10_000).default(0),
  })
  .openapi("QuestionBody");

export const RuleBodySchema = z
  .object({
    name: trimmed(255),
    description: optionalText,
    condition: z.unknown().refine((v) => v !== null && v !== undefined, "Condition must be valid JSON."),
    severity: SeveritySchema,
    resolutionPath: ResolutionPathSchema,
    recommendationTitle: trimmed(500),
    recommendationDescription: z.string().trim().min(1).max(10_000),
    priority: z.number().int().min(0).max(10_000).default(0),
  })
  .openapi("RuleBody");

/** Mutations report which template changed so the admin app can revalidate its pages. */
export const MutationResultSchema = z
  .object({ id: z.uuid().optional(), templateId: z.uuid().nullable() })
  .openapi("AdminMutationResult");

// ─── Submissions & audit ─────────────────────────────────

const SubmissionRow = z.object({
  id: z.uuid(),
  status: z.string(),
  overallScore: z.number().nullable(),
  riskLevel: z.string().nullable(),
  completedAt: isoOrNull,
  createdAt: iso,
  startupName: z.string().nullable(),
  startupId: z.uuid().nullable(),
  userName: z.string().nullable(),
  userEmail: z.string().nullable(),
  templateName: z.string().nullable(),
  templateId: z.uuid().nullable(),
});
export const AdminSubmissionPageSchema = paginated(SubmissionRow).openapi("AdminSubmissionPage");
export const SubmissionQuerySchema = z.object({
  templateId: z.uuid().optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
});

export const AdminSubmissionDetailSchema = z
  .object({
    assessment: SubmissionRow,
    responses: z.array(
      z.object({
        id: z.uuid(),
        questionId: z.string(),
        questionText: z.string(),
        answer: z.unknown(),
        domain: z.string().nullable(),
        createdAt: iso,
      }),
    ),
    uploads: z.array(
      z.object({
        id: z.uuid(),
        name: z.string(),
        storageKey: z.string(),
        mimeType: z.string(),
        fileSize: z.number().nullable(),
        questionKey: z.string().nullable(),
        domain: z.string().nullable(),
        createdAt: iso,
      }),
    ),
  })
  .openapi("AdminSubmissionDetail");

export const AuditEventSchema = z
  .object({
    id: z.uuid(),
    action: z.string(),
    entityType: z.string(),
    entityId: z.string().nullable(),
    details: z.unknown(),
    createdAt: iso,
    actorEmail: z.string().nullable(),
  })
  .openapi("AuditEvent");

// ─── Partners ────────────────────────────────────────────

export const AdminPartnerSchema = z
  .object({ id: z.uuid(), name: z.string(), orderIndex: z.number().int(), createdAt: iso })
  .openapi("AdminPartner");
export const ReorderPartnersBodySchema = z
  .object({ orderedIds: z.array(z.uuid()).max(500) })
  .openapi("ReorderPartnersBody");

// ─── Bootstrap (first admin) ─────────────────────────────

export const BootstrapAdminBodySchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(255),
    email: z.string().trim().toLowerCase().max(255).email("Please enter a valid email address."),
    password: z.string().trim().min(8, "Password must be at least 8 characters.").max(72),
  })
  .openapi("BootstrapAdminBody");
