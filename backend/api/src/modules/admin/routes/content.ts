import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  AdminPageQuerySchema,
  AdminTemplateDetailSchema,
  AdminTemplatePageSchema,
  IdParamSchema,
  QuestionBodySchema,
  RuleBodySchema,
  SectionBodySchema,
  TemplateBodySchema,
  TemplateOptionSchema,
  TemplateStatusCountsSchema,
} from "@orion/contracts";
import { ApiError } from "../../../lib/errors";
import { adminErrors, adminId, dataOf, errorResponse, json, mutationOk, notFound, type AdminDeps } from "./shared";

const tags = ["admin: assessments"];
const body = <T>(schema: T) => ({ body: { content: json(schema), required: true } });
const r = createRoute;

// ─── Reads ───────────────────────────────────────────────
const listTemplates = r({ method: "get", path: "/v1/admin/templates", tags, request: { query: AdminPageQuerySchema }, responses: { 200: { description: "Page", content: dataOf(AdminTemplatePageSchema) }, ...adminErrors } });
const statusCounts = r({ method: "get", path: "/v1/admin/templates/status-counts", tags, responses: { 200: { description: "Counts", content: dataOf(TemplateStatusCountsSchema) }, ...adminErrors } });
const options = r({ method: "get", path: "/v1/admin/templates/options", tags, summary: "All templates (id, name) for filters", responses: { 200: { description: "Options", content: dataOf(z.array(TemplateOptionSchema)) }, ...adminErrors } });
const detail = r({ method: "get", path: "/v1/admin/templates/{id}", tags, request: { params: IdParamSchema }, responses: { 200: { description: "Template with sections, questions and rules", content: dataOf(AdminTemplateDetailSchema) }, 404: errorResponse("Not found"), ...adminErrors } });
const submissionCount = r({ method: "get", path: "/v1/admin/templates/{id}/submission-count", tags, request: { params: IdParamSchema }, responses: { 200: { description: "Count", content: dataOf(z.object({ count: z.number().int() })) }, ...adminErrors } });

// ─── Template mutations ──────────────────────────────────
const createTemplate = r({ method: "post", path: "/v1/admin/templates", tags, request: body(TemplateBodySchema), responses: { 201: mutationOk, ...adminErrors } });
const updateTemplate = r({ method: "patch", path: "/v1/admin/templates/{id}", tags, request: { params: IdParamSchema, ...body(TemplateBodySchema) }, responses: { 200: mutationOk, 404: errorResponse("Not found"), ...adminErrors } });
const publishTemplate = r({ method: "post", path: "/v1/admin/templates/{id}/publish", tags, request: { params: IdParamSchema }, responses: { 200: mutationOk, 404: errorResponse("Not found"), ...adminErrors } });
const archiveTemplate = r({ method: "post", path: "/v1/admin/templates/{id}/archive", tags, request: { params: IdParamSchema }, responses: { 200: mutationOk, 404: errorResponse("Not found"), ...adminErrors } });
const deleteTemplate = r({ method: "delete", path: "/v1/admin/templates/{id}", tags, request: { params: IdParamSchema }, responses: { 200: mutationOk, 404: errorResponse("Not found"), 409: errorResponse("Published templates can't be deleted"), ...adminErrors } });

// ─── Sections / questions / rules ────────────────────────
const createSection = r({ method: "post", path: "/v1/admin/templates/{id}/sections", tags, request: { params: IdParamSchema, ...body(SectionBodySchema) }, responses: { 201: mutationOk, 404: errorResponse("Template not found"), ...adminErrors } });
const updateSection = r({ method: "patch", path: "/v1/admin/sections/{id}", tags, request: { params: IdParamSchema, ...body(SectionBodySchema) }, responses: { 200: mutationOk, 404: errorResponse("Not found"), ...adminErrors } });
const deleteSection = r({ method: "delete", path: "/v1/admin/sections/{id}", tags, request: { params: IdParamSchema }, responses: { 200: mutationOk, 404: errorResponse("Not found"), ...adminErrors } });
const createQuestion = r({ method: "post", path: "/v1/admin/sections/{id}/questions", tags, request: { params: IdParamSchema, ...body(QuestionBodySchema) }, responses: { 201: mutationOk, 404: errorResponse("Section not found"), ...adminErrors } });
const updateQuestion = r({ method: "patch", path: "/v1/admin/questions/{id}", tags, request: { params: IdParamSchema, ...body(QuestionBodySchema) }, responses: { 200: mutationOk, 404: errorResponse("Not found"), ...adminErrors } });
const deleteQuestion = r({ method: "delete", path: "/v1/admin/questions/{id}", tags, request: { params: IdParamSchema }, responses: { 200: mutationOk, 404: errorResponse("Not found"), ...adminErrors } });
const createRule = r({ method: "post", path: "/v1/admin/templates/{id}/rules", tags, request: { params: IdParamSchema, ...body(RuleBodySchema) }, responses: { 201: mutationOk, 404: errorResponse("Template not found"), ...adminErrors } });
const updateRule = r({ method: "patch", path: "/v1/admin/rules/{id}", tags, request: { params: IdParamSchema, ...body(RuleBodySchema) }, responses: { 200: mutationOk, 404: errorResponse("Not found"), ...adminErrors } });
const deleteRule = r({ method: "delete", path: "/v1/admin/rules/{id}", tags, request: { params: IdParamSchema }, responses: { 200: mutationOk, 404: errorResponse("Not found"), ...adminErrors } });

export function contentRoutes({ repo }: AdminDeps) {
  const done = (templateId: string | null, id?: string) => ({ data: { ...(id ? { id } : {}), templateId } });

  return new OpenAPIHono()
    .openapi(listTemplates, async (c) => {
      const { q, page } = c.req.valid("query");
      return c.json({ data: await repo.listTemplates(q, page) }, 200);
    })
    .openapi(statusCounts, async (c) => c.json({ data: await repo.templateStatusCounts() }, 200))
    .openapi(options, async (c) => c.json({ data: await repo.templateOptions() }, 200))
    .openapi(detail, async (c) => {
      const found = await repo.getTemplateDetail(c.req.valid("param").id);
      if (!found) throw notFound("Template not found.");
      return c.json({ data: found }, 200);
    })
    .openapi(submissionCount, async (c) => c.json({ data: { count: await repo.submissionCount(c.req.valid("param").id) } }, 200))

    .openapi(createTemplate, async (c) => {
      const id = await repo.createTemplate(adminId(c), c.req.valid("json"));
      return c.json(done(id, id), 201);
    })
    .openapi(updateTemplate, async (c) => {
      const { id } = c.req.valid("param");
      if (!(await repo.updateTemplate(adminId(c), id, c.req.valid("json")))) throw notFound("Template not found.");
      return c.json(done(id), 200);
    })
    .openapi(publishTemplate, async (c) => {
      const { id } = c.req.valid("param");
      if (!(await repo.setTemplateStatus(adminId(c), id, "published"))) throw notFound("Template not found.");
      return c.json(done(id), 200);
    })
    .openapi(archiveTemplate, async (c) => {
      const { id } = c.req.valid("param");
      if (!(await repo.setTemplateStatus(adminId(c), id, "archived"))) throw notFound("Template not found.");
      return c.json(done(id), 200);
    })
    .openapi(deleteTemplate, async (c) => {
      const { id } = c.req.valid("param");
      const result = await repo.deleteTemplate(adminId(c), id);
      if (result === "not_found") throw notFound("Template not found.");
      if (result === "published") throw new ApiError(409, "conflict", "Published templates cannot be deleted. Archive first.");
      return c.json(done(null), 200);
    })

    .openapi(createSection, async (c) => {
      const { id: templateId } = c.req.valid("param");
      const id = await repo.createSection(adminId(c), templateId, c.req.valid("json"));
      if (!id) throw notFound("Template not found.");
      return c.json(done(templateId, id), 201);
    })
    .openapi(updateSection, async (c) => {
      const templateId = await repo.updateSection(adminId(c), c.req.valid("param").id, c.req.valid("json"));
      if (!templateId) throw notFound("Section not found.");
      return c.json(done(templateId), 200);
    })
    .openapi(deleteSection, async (c) => {
      const templateId = await repo.deleteSection(adminId(c), c.req.valid("param").id);
      if (!templateId) throw notFound("Section not found.");
      return c.json(done(templateId), 200);
    })
    .openapi(createQuestion, async (c) => {
      const created = await repo.createQuestion(adminId(c), c.req.valid("param").id, c.req.valid("json"));
      if (!created) throw notFound("Section not found.");
      return c.json(done(created.templateId, created.id), 201);
    })
    .openapi(updateQuestion, async (c) => {
      const templateId = await repo.updateQuestion(adminId(c), c.req.valid("param").id, c.req.valid("json"));
      if (!templateId) throw notFound("Question not found.");
      return c.json(done(templateId), 200);
    })
    .openapi(deleteQuestion, async (c) => {
      const templateId = await repo.deleteQuestion(adminId(c), c.req.valid("param").id);
      if (!templateId) throw notFound("Question not found.");
      return c.json(done(templateId), 200);
    })
    .openapi(createRule, async (c) => {
      const { id: templateId } = c.req.valid("param");
      const id = await repo.createRule(adminId(c), templateId, c.req.valid("json"));
      if (!id) throw notFound("Template not found.");
      return c.json(done(templateId, id), 201);
    })
    .openapi(updateRule, async (c) => {
      const templateId = await repo.updateRule(adminId(c), c.req.valid("param").id, c.req.valid("json"));
      if (!templateId) throw notFound("Rule not found.");
      return c.json(done(templateId), 200);
    })
    .openapi(deleteRule, async (c) => {
      const templateId = await repo.deleteRule(adminId(c), c.req.valid("param").id);
      if (!templateId) throw notFound("Rule not found.");
      return c.json(done(templateId), 200);
    });
}
