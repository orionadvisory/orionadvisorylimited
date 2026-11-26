import type { PublishedAssessment } from "@orion/contracts";
import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../lib/db";

export interface AssessmentsRepo {
  /** The published Legal Health Check template with its sections and questions, or null if none is published. */
  getPublished(): Promise<PublishedAssessment | null>;
}

export const assessmentsRepo: AssessmentsRepo = {
  async getPublished() {
    const db = await getDb();
    const { assessmentTemplates, assessmentTemplateSections, assessmentTemplateQuestions } = await import(
      "@orion/db/schema"
    );

    const [template] = await db
      .select()
      .from(assessmentTemplates)
      .where(eq(assessmentTemplates.status, "published"))
      .orderBy(asc(assessmentTemplates.createdAt))
      .limit(1);
    if (!template) return null;

    const sections = await db
      .select()
      .from(assessmentTemplateSections)
      .where(eq(assessmentTemplateSections.templateId, template.id))
      .orderBy(asc(assessmentTemplateSections.orderIndex), asc(assessmentTemplateSections.createdAt));

    const sectionIds = sections.map((s) => s.id);
    const questions = sectionIds.length
      ? await db
          .select()
          .from(assessmentTemplateQuestions)
          .where(inArray(assessmentTemplateQuestions.sectionId, sectionIds))
          .orderBy(asc(assessmentTemplateQuestions.orderIndex), asc(assessmentTemplateQuestions.createdAt))
      : [];

    return {
      template: { id: template.id, name: template.name, description: template.description },
      sections: sections.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        orderIndex: s.orderIndex,
      })),
      questions: questions.map((q) => ({
        id: q.id,
        sectionId: q.sectionId,
        questionKey: q.questionKey,
        prompt: q.prompt,
        description: q.description,
        inputType: q.inputType,
        options: q.options as Record<string, unknown> | null,
        domain: q.domain,
        required: q.required,
        weight: q.weight,
        orderIndex: q.orderIndex,
      })),
    };
  },
};
