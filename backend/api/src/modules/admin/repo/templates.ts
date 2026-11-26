import { asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { audit, getDb, iso, isoOrNull, offsetFor, PAGE_SIZE, pageOf, schema } from "./shared";

type TemplateInput = { name: string; description: string | null };
type SectionInput = { title: string; description: string | null; orderIndex: number };
type QuestionInput = {
  questionKey: string;
  prompt: string;
  description: string | null;
  inputType: string;
  options: unknown;
  domain: string | null;
  required: boolean;
  weight: number;
  orderIndex: number;
};
type RuleInput = {
  name: string;
  description: string | null;
  condition: unknown;
  severity: "critical" | "high" | "medium" | "low" | "info";
  resolutionPath: "self_serve" | "document_generation" | "expert_referral";
  recommendationTitle: string;
  recommendationDescription: string;
  priority: number;
};

const withDates = <T extends { createdAt: Date; updatedAt: Date }>(
  r: T,
): Omit<T, "createdAt" | "updatedAt"> & { createdAt: string; updatedAt: string } => ({
  ...r,
  createdAt: iso(r.createdAt),
  updatedAt: iso(r.updatedAt),
});

async function templateIdForSection(sectionId: string) {
  const db = await getDb();
  const { assessmentTemplateSections: s } = await schema();
  const [row] = await db.select({ templateId: s.templateId }).from(s).where(eq(s.id, sectionId)).limit(1);
  return row?.templateId ?? null;
}

async function templateExists(templateId: string) {
  const db = await getDb();
  const { assessmentTemplates: t } = await schema();
  const [row] = await db.select({ id: t.id }).from(t).where(eq(t.id, templateId)).limit(1);
  return !!row;
}

export const templatesRepo = {
  async listTemplates(query: string | undefined, page: number) {
    const db = await getDb();
    const { assessmentTemplates: t, assessmentTemplateSections: s, assessmentTemplateQuestions: q, assessmentTemplateRules: r } =
      await schema();
    const search = query?.trim();
    const where = search
      ? or(ilike(t.name, `%${search}%`), ilike(t.description, `%${search}%`), sql`${t.status}::text ilike ${`%${search}%`}`)
      : undefined;
    const [[{ count }], items] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(t).where(where),
      db
        .select({
          id: t.id,
          name: t.name,
          description: t.description,
          status: t.status,
          version: t.version,
          publishedAt: t.publishedAt,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          createdByUserId: t.createdByUserId,
          sectionCount: sql<number>`count(distinct ${s.id})::int`,
          questionCount: sql<number>`count(distinct ${q.id})::int`,
          ruleCount: sql<number>`count(distinct ${r.id})::int`,
        })
        .from(t)
        .leftJoin(s, eq(s.templateId, t.id))
        .leftJoin(q, eq(q.sectionId, s.id))
        .leftJoin(r, eq(r.templateId, t.id))
        .where(where)
        .groupBy(t.id)
        .orderBy(desc(t.updatedAt))
        .limit(PAGE_SIZE)
        .offset(offsetFor(page)),
    ]);
    return pageOf(
      items.map((i) => ({ ...withDates(i), publishedAt: isoOrNull(i.publishedAt) })),
      count,
      page,
    );
  },

  async templateStatusCounts() {
    const db = await getDb();
    const { assessmentTemplates: t } = await schema();
    const rows = await db.select({ status: t.status, count: sql<number>`count(*)::int` }).from(t).groupBy(t.status);
    const result = { draft: 0, published: 0, archived: 0 };
    for (const r of rows) result[r.status] = r.count;
    return result;
  },

  async templateOptions() {
    const db = await getDb();
    const { assessmentTemplates: t } = await schema();
    return db.select({ id: t.id, name: t.name }).from(t).orderBy(asc(t.name));
  },

  async getTemplateDetail(templateId: string) {
    const db = await getDb();
    const { assessmentTemplates: t, assessmentTemplateSections: s, assessmentTemplateQuestions: q, assessmentTemplateRules: r } =
      await schema();
    const [template] = await db.select().from(t).where(eq(t.id, templateId)).limit(1);
    if (!template) return null;
    const sections = await db.select().from(s).where(eq(s.templateId, templateId)).orderBy(asc(s.orderIndex), asc(s.createdAt));
    const sectionIds = sections.map((x) => x.id);
    const questions = sectionIds.length
      ? await db.select().from(q).where(inArray(q.sectionId, sectionIds)).orderBy(asc(q.orderIndex), asc(q.createdAt))
      : [];
    const rules = await db.select().from(r).where(eq(r.templateId, templateId)).orderBy(asc(r.priority), asc(r.createdAt));
    return {
      template: { ...withDates(template), publishedAt: isoOrNull(template.publishedAt) },
      sections: sections.map(withDates),
      questions: questions.map(withDates),
      rules: rules.map(withDates),
    };
  },

  // ─── Templates ─────────────────────────────────────────

  async createTemplate(adminUserId: string, input: TemplateInput) {
    const db = await getDb();
    const { assessmentTemplates: t } = await schema();
    const [row] = await db
      .insert(t)
      .values({ name: input.name, description: input.description, createdByUserId: adminUserId })
      .returning({ id: t.id });
    await audit({ adminUserId, action: "admin_assessment_template_created", entityType: "assessment_template", entityId: row.id, details: { name: input.name } });
    return row.id;
  },

  /** False if the template doesn't exist. */
  async updateTemplate(adminUserId: string, templateId: string, input: TemplateInput) {
    const db = await getDb();
    const { assessmentTemplates: t } = await schema();
    const [existing] = await db.select({ name: t.name, description: t.description }).from(t).where(eq(t.id, templateId)).limit(1);
    if (!existing) return false;
    await db.update(t).set({ name: input.name, description: input.description, updatedAt: new Date() }).where(eq(t.id, templateId));
    await audit({
      adminUserId,
      action: "admin_assessment_template_updated",
      entityType: "assessment_template",
      entityId: templateId,
      details: { previousName: existing.name, newName: input.name, previousDescription: existing.description, newDescription: input.description },
    });
    return true;
  },

  async setTemplateStatus(adminUserId: string, templateId: string, status: "published" | "archived") {
    const db = await getDb();
    const { assessmentTemplates: t } = await schema();
    const [existing] = await db.select({ status: t.status }).from(t).where(eq(t.id, templateId)).limit(1);
    if (!existing) return false;
    if (existing.status === status) return true;
    await db
      .update(t)
      .set(
        status === "published"
          ? { status, publishedAt: new Date(), updatedAt: new Date(), version: sql`${t.version} + 1` }
          : { status, updatedAt: new Date() },
      )
      .where(eq(t.id, templateId));
    await audit({
      adminUserId,
      action: status === "published" ? "admin_assessment_template_published" : "admin_assessment_template_archived",
      entityType: "assessment_template",
      entityId: templateId,
      details: { previousStatus: existing.status, newStatus: status },
    });
    return true;
  },

  async deleteTemplate(adminUserId: string, templateId: string): Promise<"ok" | "not_found" | "published"> {
    const db = await getDb();
    const { assessmentTemplates: t } = await schema();
    const [existing] = await db.select({ status: t.status }).from(t).where(eq(t.id, templateId)).limit(1);
    if (!existing) return "not_found";
    if (existing.status === "published") return "published";
    await db.delete(t).where(eq(t.id, templateId));
    await audit({ adminUserId, action: "admin_assessment_template_deleted", entityType: "assessment_template", entityId: templateId });
    return "ok";
  },

  // ─── Sections ──────────────────────────────────────────

  /** Null if the template doesn't exist. */
  async createSection(adminUserId: string, templateId: string, input: SectionInput) {
    if (!(await templateExists(templateId))) return null;
    const db = await getDb();
    const { assessmentTemplateSections: s } = await schema();
    const [row] = await db.insert(s).values({ templateId, ...input }).returning({ id: s.id });
    await audit({
      adminUserId,
      action: "admin_assessment_section_created",
      entityType: "assessment_section",
      entityId: row.id,
      details: { templateId, title: input.title, orderIndex: input.orderIndex },
    });
    return row.id;
  },

  /** Returns the owning template id, or null if the section doesn't exist. */
  async updateSection(adminUserId: string, sectionId: string, input: SectionInput) {
    const db = await getDb();
    const { assessmentTemplateSections: s } = await schema();
    const [existing] = await db.select().from(s).where(eq(s.id, sectionId)).limit(1);
    if (!existing) return null;
    await db.update(s).set({ ...input, updatedAt: new Date() }).where(eq(s.id, sectionId));
    await audit({
      adminUserId,
      action: "admin_assessment_section_updated",
      entityType: "assessment_section",
      entityId: sectionId,
      details: {
        templateId: existing.templateId,
        previousTitle: existing.title,
        newTitle: input.title,
        previousOrderIndex: existing.orderIndex,
        newOrderIndex: input.orderIndex,
      },
    });
    return existing.templateId;
  },

  async deleteSection(adminUserId: string, sectionId: string) {
    const templateId = await templateIdForSection(sectionId);
    if (!templateId) return null;
    const db = await getDb();
    const { assessmentTemplateSections: s } = await schema();
    await db.delete(s).where(eq(s.id, sectionId));
    await audit({ adminUserId, action: "admin_assessment_section_deleted", entityType: "assessment_section", entityId: sectionId, details: { templateId } });
    return templateId;
  },

  // ─── Questions ─────────────────────────────────────────

  /** Null if the section doesn't exist. */
  async createQuestion(adminUserId: string, sectionId: string, input: QuestionInput) {
    const templateId = await templateIdForSection(sectionId);
    if (!templateId) return null;
    const db = await getDb();
    const { assessmentTemplateQuestions: q } = await schema();
    const [row] = await db.insert(q).values({ sectionId, ...input }).returning({ id: q.id });
    await audit({
      adminUserId,
      action: "admin_assessment_question_created",
      entityType: "assessment_question",
      entityId: row.id,
      details: { templateId, sectionId, questionKey: input.questionKey },
    });
    return { id: row.id, templateId };
  },

  async updateQuestion(adminUserId: string, questionId: string, input: QuestionInput) {
    const db = await getDb();
    const { assessmentTemplateQuestions: q } = await schema();
    const [existing] = await db.select({ sectionId: q.sectionId, questionKey: q.questionKey }).from(q).where(eq(q.id, questionId)).limit(1);
    if (!existing) return null;
    const templateId = await templateIdForSection(existing.sectionId);
    if (!templateId) return null;
    await db.update(q).set({ ...input, updatedAt: new Date() }).where(eq(q.id, questionId));
    await audit({
      adminUserId,
      action: "admin_assessment_question_updated",
      entityType: "assessment_question",
      entityId: questionId,
      details: { templateId, previousQuestionKey: existing.questionKey, newQuestionKey: input.questionKey },
    });
    return templateId;
  },

  async deleteQuestion(adminUserId: string, questionId: string) {
    const db = await getDb();
    const { assessmentTemplateQuestions: q } = await schema();
    const [existing] = await db.select({ sectionId: q.sectionId }).from(q).where(eq(q.id, questionId)).limit(1);
    if (!existing) return null;
    const templateId = await templateIdForSection(existing.sectionId);
    if (!templateId) return null;
    await db.delete(q).where(eq(q.id, questionId));
    await audit({ adminUserId, action: "admin_assessment_question_deleted", entityType: "assessment_question", entityId: questionId, details: { templateId } });
    return templateId;
  },

  // ─── Rules ─────────────────────────────────────────────

  /** Null if the template doesn't exist. */
  async createRule(adminUserId: string, templateId: string, input: RuleInput) {
    if (!(await templateExists(templateId))) return null;
    const db = await getDb();
    const { assessmentTemplateRules: r } = await schema();
    const [row] = await db.insert(r).values({ templateId, ...input }).returning({ id: r.id });
    await audit({ adminUserId, action: "admin_assessment_rule_created", entityType: "assessment_rule", entityId: row.id, details: { templateId, name: input.name } });
    return row.id;
  },

  async updateRule(adminUserId: string, ruleId: string, input: RuleInput) {
    const db = await getDb();
    const { assessmentTemplateRules: r } = await schema();
    const [existing] = await db.select({ templateId: r.templateId }).from(r).where(eq(r.id, ruleId)).limit(1);
    if (!existing) return null;
    await db.update(r).set({ ...input, updatedAt: new Date() }).where(eq(r.id, ruleId));
    await audit({
      adminUserId,
      action: "admin_assessment_rule_updated",
      entityType: "assessment_rule",
      entityId: ruleId,
      details: { templateId: existing.templateId, name: input.name },
    });
    return existing.templateId;
  },

  async deleteRule(adminUserId: string, ruleId: string) {
    const db = await getDb();
    const { assessmentTemplateRules: r } = await schema();
    const [existing] = await db.select({ templateId: r.templateId }).from(r).where(eq(r.id, ruleId)).limit(1);
    if (!existing) return null;
    await db.delete(r).where(eq(r.id, ruleId));
    await audit({ adminUserId, action: "admin_assessment_rule_deleted", entityType: "assessment_rule", entityId: ruleId, details: { templateId: existing.templateId } });
    return existing.templateId;
  },
};
