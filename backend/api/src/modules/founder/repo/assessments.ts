import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { createStartupRow, findStartup, getDb, getOrCreateStartup, normalizers, schema, toStage } from "./shared";
import type { FounderRepo } from "./types";

type AssessmentsRepo = Pick<
  FounderRepo,
  | "getDraft"
  | "saveDraft"
  | "clearDraft"
  | "getOrCreateStartup"
  | "startAssessment"
  | "getTemplateBundle"
  | "findUploadForUser"
  | "completeOnboarding"
  | "userExists"
  | "persistGuestCheck"
  | "getReevaluationContext"
  | "saveReevaluation"
>;

type IssueInput = {
  title: string;
  description: string;
  domain: string;
  severity: string;
  resolutionPath: string;
  recommendation?: { title: string; description: string };
};

/** Insert issues (+ their recommendations) for an assessment, normalising AI enums. */
async function insertIssues(assessmentId: string, startupId: string, issues: IssueInput[]) {
  if (issues.length === 0) return;
  const db = await getDb();
  const { legalIssues, recommendations } = await schema();
  const n = await normalizers();
  for (const issue of issues) {
    const severity = n.severity(issue.severity);
    const resolutionPath = n.resolutionPath(issue.resolutionPath);
    const [row] = await db
      .insert(legalIssues)
      .values({
        assessmentId,
        startupId,
        title: issue.title,
        description: issue.description,
        domain: issue.domain,
        severity,
        resolutionPath,
      })
      .returning({ id: legalIssues.id });
    if (issue.recommendation) {
      await db.insert(recommendations).values({
        issueId: row.id,
        title: issue.recommendation.title,
        description: issue.recommendation.description,
        actionType: resolutionPath,
        priority: n.priority(severity),
      });
    }
  }
}

export const assessmentsRepo: AssessmentsRepo = {
  async getDraft(userId, templateId) {
    const db = await getDb();
    const { assessmentDrafts } = await schema();
    const [draft] = await db
      .select()
      .from(assessmentDrafts)
      .where(and(eq(assessmentDrafts.userId, userId), eq(assessmentDrafts.templateId, templateId)))
      .limit(1);
    if (!draft) return null;
    return {
      answers: draft.answers,
      currentSectionIdx: draft.currentSectionIdx,
      completedSectionIds: draft.completedSectionIds,
      updatedAt: draft.updatedAt.toISOString(),
    };
  },

  async saveDraft(userId, templateId, payload) {
    const db = await getDb();
    const { assessmentDrafts } = await schema();
    const now = new Date();
    const values = {
      answers: payload.answers,
      currentSectionIdx: payload.currentSectionIdx,
      completedSectionIds: payload.completedSectionIds,
      updatedAt: now,
    };
    await db
      .insert(assessmentDrafts)
      .values({ userId, templateId, ...values })
      .onConflictDoUpdate({ target: [assessmentDrafts.userId, assessmentDrafts.templateId], set: values });
    return now;
  },

  async clearDraft(userId, templateId) {
    const db = await getDb();
    const { assessmentDrafts } = await schema();
    await db
      .delete(assessmentDrafts)
      .where(and(eq(assessmentDrafts.userId, userId), eq(assessmentDrafts.templateId, templateId)));
  },

  getOrCreateStartup: (userId) => getOrCreateStartup(userId),

  async startAssessment(userId, templateId) {
    const startup = await getOrCreateStartup(userId);
    const db = await getDb();
    const { assessments } = await schema();
    const [existing] = await db
      .select({ id: assessments.id })
      .from(assessments)
      .where(
        and(
          eq(assessments.startupId, startup.id),
          eq(assessments.templateId, templateId),
          eq(assessments.status, "in_progress"),
        ),
      )
      .limit(1);
    if (existing) return existing.id;
    const [created] = await db
      .insert(assessments)
      .values({ startupId: startup.id, templateId, status: "in_progress" })
      .returning({ id: assessments.id });
    return created.id;
  },

  async getTemplateBundle(templateId) {
    const db = await getDb();
    const { assessmentTemplates, assessmentTemplateSections, assessmentTemplateQuestions } = await schema();
    const [template] = await db
      .select({ id: assessmentTemplates.id, name: assessmentTemplates.name })
      .from(assessmentTemplates)
      .where(eq(assessmentTemplates.id, templateId))
      .limit(1);
    if (!template) return null;
    const sections = await db
      .select({ id: assessmentTemplateSections.id, title: assessmentTemplateSections.title })
      .from(assessmentTemplateSections)
      .where(eq(assessmentTemplateSections.templateId, templateId))
      .orderBy(asc(assessmentTemplateSections.orderIndex));
    const sectionIds = sections.map((s) => s.id);
    const questions = sectionIds.length
      ? await db
          .select({
            id: assessmentTemplateQuestions.id,
            sectionId: assessmentTemplateQuestions.sectionId,
            questionKey: assessmentTemplateQuestions.questionKey,
            prompt: assessmentTemplateQuestions.prompt,
            domain: assessmentTemplateQuestions.domain,
          })
          .from(assessmentTemplateQuestions)
          .where(inArray(assessmentTemplateQuestions.sectionId, sectionIds))
          .orderBy(asc(assessmentTemplateQuestions.orderIndex))
      : [];
    return { template, sections, questions };
  },

  async findUploadForUser(uploadId, userId) {
    const db = await getDb();
    const { uploads } = await schema();
    const [row] = await db
      .select({ storageKey: uploads.storageKey, name: uploads.name })
      .from(uploads)
      .where(and(eq(uploads.id, uploadId), eq(uploads.userId, userId)))
      .limit(1);
    return row ?? null;
  },

  async completeOnboarding({ userId, templateId, startupName, answers, result }) {
    const db = await getDb();
    const { startups, assessments, assessmentAnswers, assessmentResponses, users } = await schema();
    const n = await normalizers();

    const startup = await getOrCreateStartup(userId, startupName);
    await db
      .update(startups)
      .set({ name: startupName, riskScore: result.overallScore, updatedAt: new Date() })
      .where(eq(startups.id, startup.id));

    // Finalise the in-progress assessment from /assessments/start, or create a completed one.
    const [draft] = await db
      .select({ id: assessments.id })
      .from(assessments)
      .where(
        and(
          eq(assessments.startupId, startup.id),
          eq(assessments.templateId, templateId),
          eq(assessments.status, "in_progress"),
        ),
      )
      .limit(1);
    const values = {
      status: "completed" as const,
      overallScore: result.overallScore,
      riskLevel: n.severity(result.riskLevel),
      completedAt: new Date(),
    };
    const [assessment] = draft
      ? await db.update(assessments).set(values).where(eq(assessments.id, draft.id)).returning({ id: assessments.id })
      : await db
          .insert(assessments)
          .values({ startupId: startup.id, templateId, ...values })
          .returning({ id: assessments.id });

    await db.insert(assessmentAnswers).values({ userId, assessmentId: assessment.id, rawAnswers: answers, aiAnalysis: result });

    const responses = Object.entries(answers).map(([key, value]) => ({
      assessmentId: assessment.id,
      questionId: key,
      questionText: key,
      answer: typeof value === "string" ? value : JSON.stringify(value),
      domain: "general",
    }));
    if (responses.length > 0) await db.insert(assessmentResponses).values(responses);

    await insertIssues(assessment.id, startup.id, result.issues);

    await db.update(users).set({ onboardingCompleted: true, updatedAt: new Date() }).where(eq(users.id, userId));
    return assessment.id;
  },

  async userExists(userId) {
    const db = await getDb();
    const { users } = await schema();
    const [row] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
    return !!row;
  },

  async persistGuestCheck(userId, result) {
    const db = await getDb();
    const { startups, assessments, assessmentResponses } = await schema();
    const n = await normalizers();

    let startup = await findStartup(userId);
    if (!startup) {
      const id = await createStartupRow({
        userId,
        name: "My Startup",
        stage: toStage(result.profile?.stage),
        primaryJurisdiction: typeof result.profile?.jurisdiction === "string" ? result.profile.jurisdiction : null,
        riskScore: result.overallScore,
      });
      startup = { id, name: "My Startup", stage: null, structure: null, primaryJurisdiction: null, riskScore: null };
    }

    const completedAt = new Date(result.completedAt);
    const [assessment] = await db
      .insert(assessments)
      .values({
        startupId: startup.id,
        status: "completed",
        overallScore: result.overallScore,
        riskLevel: n.severity(result.riskLevel),
        completedAt: Number.isNaN(completedAt.getTime()) ? new Date() : completedAt,
      })
      .returning({ id: assessments.id });

    await db.insert(assessmentResponses).values([
      {
        assessmentId: assessment.id,
        questionId: "profile",
        questionText: "Startup Profile",
        answer: JSON.stringify(result.profile),
        domain: "incorporation",
      },
      {
        assessmentId: assessment.id,
        questionId: "documents_held",
        questionText: "Documents the startup already has",
        answer: JSON.stringify(result.documentsHeld),
        domain: "general",
      },
    ]);

    await insertIssues(assessment.id, startup.id, result.issues);
    await db.update(startups).set({ riskScore: result.overallScore, updatedAt: new Date() }).where(eq(startups.id, startup.id));
    return { assessmentId: assessment.id, startupId: startup.id };
  },

  async getReevaluationContext(userId) {
    const startup = await findStartup(userId);
    if (!startup) return "no_startup";
    const db = await getDb();
    const { assessments, assessmentResponses, documents, legalIssues } = await schema();

    const [last] = await db
      .select({ id: assessments.id, overallScore: assessments.overallScore })
      .from(assessments)
      .where(eq(assessments.startupId, startup.id))
      .orderBy(desc(assessments.createdAt))
      .limit(1);
    if (!last) return "no_assessment";

    const responses = await db
      .select({ questionId: assessmentResponses.questionId, answer: assessmentResponses.answer })
      .from(assessmentResponses)
      .where(eq(assessmentResponses.assessmentId, last.id));
    const profileRow = responses.find((r) => r.questionId === "profile");
    if (!profileRow) return "no_profile";
    const docsRow = responses.find((r) => r.questionId === "documents_held");

    const [generated, open] = await Promise.all([
      db.select({ name: documents.name }).from(documents).where(eq(documents.startupId, startup.id)),
      db
        .select({ id: legalIssues.id })
        .from(legalIssues)
        .where(and(eq(legalIssues.startupId, startup.id), eq(legalIssues.isResolved, false))),
    ]);

    return {
      startupId: startup.id,
      previousScore: last.overallScore ?? 0,
      profile: JSON.parse(String(profileRow.answer)) as Record<string, unknown>,
      docsHeld: docsRow ? (JSON.parse(String(docsRow.answer)) as string[]) : [],
      generatedDocNames: generated.map((d) => d.name),
      previousIssueCount: open.length,
    };
  },

  async saveReevaluation(ctx, result) {
    const db = await getDb();
    const { assessments, assessmentResponses, legalIssues, startups } = await schema();
    const n = await normalizers();

    // Issues the AI no longer reports are considered resolved.
    const open = await db
      .select({ id: legalIssues.id, title: legalIssues.title })
      .from(legalIssues)
      .where(and(eq(legalIssues.startupId, ctx.startupId), eq(legalIssues.isResolved, false)));
    const stillOpen = new Set(result.issues.map((i) => i.title.toLowerCase()));
    const resolvedIds = open.filter((i) => !stillOpen.has(i.title.toLowerCase())).map((i) => i.id);
    if (resolvedIds.length > 0) {
      await db.update(legalIssues).set({ isResolved: true, resolvedAt: new Date() }).where(inArray(legalIssues.id, resolvedIds));
    }

    const [assessment] = await db
      .insert(assessments)
      .values({
        startupId: ctx.startupId,
        status: "completed",
        overallScore: result.overallScore,
        riskLevel: n.severity(result.riskLevel),
        completedAt: new Date(),
      })
      .returning({ id: assessments.id });

    await db.insert(assessmentResponses).values([
      { assessmentId: assessment.id, questionId: "profile", questionText: "Startup Profile", answer: JSON.stringify(ctx.profile), domain: "incorporation" },
      { assessmentId: assessment.id, questionId: "documents_held", questionText: "Documents the startup already has", answer: JSON.stringify(ctx.docsHeld), domain: "general" },
      { assessmentId: assessment.id, questionId: "generated_documents", questionText: "Documents generated on platform", answer: JSON.stringify(ctx.generatedDocNames), domain: "general" },
    ]);

    await insertIssues(assessment.id, ctx.startupId, result.issues);
    await db.update(startups).set({ riskScore: result.overallScore, updatedAt: new Date() }).where(eq(startups.id, ctx.startupId));
  },
};
