import { z } from "@hono/zod-openapi";

export const AssessmentSectionSchema = z
  .object({
    id: z.uuid(),
    title: z.string(),
    description: z.string().nullable(),
    orderIndex: z.number().int(),
  })
  .openapi("AssessmentSection");
export type AssessmentSection = z.infer<typeof AssessmentSectionSchema>;

export const AssessmentQuestionSchema = z
  .object({
    id: z.uuid(),
    sectionId: z.uuid(),
    questionKey: z.string(),
    prompt: z.string(),
    description: z.string().nullable(),
    inputType: z.string(),
    options: z.record(z.string(), z.unknown()).nullable(),
    domain: z.string().nullable(),
    required: z.boolean(),
    weight: z.number().int(),
    orderIndex: z.number().int(),
  })
  .openapi("AssessmentQuestion");
export type AssessmentQuestion = z.infer<typeof AssessmentQuestionSchema>;

export const PublishedAssessmentSchema = z
  .object({
    template: z.object({
      id: z.uuid(),
      name: z.string(),
      description: z.string().nullable(),
    }),
    sections: z.array(AssessmentSectionSchema),
    questions: z.array(AssessmentQuestionSchema),
  })
  .openapi("PublishedAssessment");
export type PublishedAssessment = z.infer<typeof PublishedAssessmentSchema>;

export const PublishedAssessmentResponseSchema = z
  .object({ data: PublishedAssessmentSchema })
  .openapi("PublishedAssessmentResponse");
