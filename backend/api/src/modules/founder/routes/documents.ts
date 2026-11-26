import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { DocumentIdParamSchema, DocumentListItemSchema, GenerateDocumentBodySchema } from "@orion/contracts";
import { bodyLimit } from "hono/body-limit";
import { randomUUID } from "node:crypto";
import { ApiError } from "../../../lib/errors";
import { safeFileName } from "../../../lib/storage";
import { requireUser } from "../../../middleware/session";
import { DOCUMENT_SYSTEM_PROMPT, buildDocumentPrompt } from "../prompts";
import { currentUserId, enforceUserAiLimit, errorResponse, json, type FounderDeps } from "./shared";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/png",
  "image/jpeg",
]);

const listRoute = createRoute({
  method: "get",
  path: "/v1/documents",
  tags: ["documents"],
  summary: "Generated and uploaded documents, newest first",
  middleware: [requireUser] as const,
  responses: {
    200: { description: "Documents", content: json(z.object({ data: z.array(DocumentListItemSchema) })) },
    401: errorResponse("Not signed in"),
  },
});

const recommendedRoute = createRoute({
  method: "get",
  path: "/v1/documents/recommended",
  tags: ["documents"],
  summary: "Open issues that a document template can resolve, plus prefill data",
  middleware: [requireUser] as const,
  responses: {
    200: {
      description: "Recommendations",
      content: json(
        z.object({
          data: z.object({
            recommended: z.array(
              z.object({
                issueId: z.uuid(),
                issueTitle: z.string(),
                severity: z.string(),
                templateId: z.string(),
                templateName: z.string(),
              }),
            ),
            startup: z
              .object({ name: z.string(), jurisdiction: z.string().nullable(), stage: z.string().nullable() })
              .nullable(),
          }),
        }),
      ),
    },
    401: errorResponse("Not signed in"),
  },
});

const generateRoute = createRoute({
  method: "post",
  path: "/v1/documents/generate",
  tags: ["documents"],
  summary: "Generate a legal document from a template with the AI",
  middleware: [requireUser] as const,
  request: { body: { content: json(GenerateDocumentBodySchema), required: true } },
  responses: {
    201: {
      description: "Generated",
      content: json(
        z.object({
          data: z.object({ id: z.uuid(), name: z.string(), content: z.string(), type: z.string(), createdAt: z.string() }),
        }),
      ),
    },
    400: errorResponse("Missing required field"),
    401: errorResponse("Not signed in"),
    404: errorResponse("Unknown template"),
    429: errorResponse("Rate limited"),
    502: errorResponse("AI unavailable"),
  },
});

// Multipart body is parsed by hand (File objects), so it isn't declared as a zod body.
const uploadRoute = createRoute({
  method: "post",
  path: "/v1/documents/upload",
  tags: ["documents"],
  summary: "Upload a file (multipart/form-data: file, domain?, assessmentId?, questionKey?) — max 10 MB",
  middleware: [requireUser, bodyLimit({ maxSize: MAX_UPLOAD_BYTES + 64 * 1024, onError: () => {
    throw new ApiError(400, "bad_request", "File too large (max 10 MB)");
  } })] as const,
  responses: {
    201: {
      description: "Uploaded",
      content: json(z.object({ data: z.object({ uploadId: z.uuid(), storageKey: z.string(), fileName: z.string() }) })),
    },
    400: errorResponse("Missing, too large or disallowed file"),
    401: errorResponse("Not signed in"),
  },
});

const downloadRoute = createRoute({
  method: "get",
  path: "/v1/documents/{id}/download",
  tags: ["documents"],
  summary: "Download a generated document (redirects to a short-lived signed URL)",
  middleware: [requireUser] as const,
  request: { params: DocumentIdParamSchema },
  responses: {
    200: { description: "Markdown content", content: { "text/markdown": { schema: z.string() } } },
    302: { description: "Redirect to signed storage URL" },
    401: errorResponse("Not signed in"),
    404: errorResponse("Not found"),
  },
});

const optionalString = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 255) : null);

export function documentsRoutes(deps: FounderDeps) {
  return new OpenAPIHono()
    .openapi(listRoute, async (c) => {
      const docs = await deps.repo.listDocuments(currentUserId(c));
      return c.json({ data: docs.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() })) }, 200);
    })
    .openapi(recommendedRoute, async (c) => {
      const { startup, issues } = await deps.repo.listDocGenerationIssues(currentUserId(c));
      const { matchIssueToTemplate } = await import("@orion/core/documents/templates");
      const recommended = issues.flatMap((issue) => {
        const template = matchIssueToTemplate(issue.title);
        return template
          ? [{ issueId: issue.id, issueTitle: issue.title, severity: issue.severity, templateId: template.id, templateName: template.name }]
          : [];
      });
      return c.json({ data: { recommended, startup } }, 200);
    })
    .openapi(generateRoute, async (c) => {
      const userId = currentUserId(c);
      const { templateId, fields } = c.req.valid("json");
      const { getTemplate } = await import("@orion/core/documents/templates");
      const template = getTemplate(templateId);
      if (!template) throw new ApiError(404, "not_found", "Template not found");
      for (const field of template.fields) {
        if (field.required && !fields[field.id]) throw new ApiError(400, "bad_request", `${field.label} is required`);
      }
      enforceUserAiLimit(deps, userId);

      const fieldSummary = template.fields.map((f) => `${f.label}: ${fields[f.id] || "Not provided"}`).join("\n");
      let content: string;
      try {
        content = await deps.llm.complete(
          [
            { role: "system", content: DOCUMENT_SYSTEM_PROMPT },
            { role: "user", content: buildDocumentPrompt(template.promptInstructions, fieldSummary) },
          ],
          { temperature: 0.3, maxTokens: 4000 },
        );
      } catch (err) {
        console.error(JSON.stringify({ level: "error", msg: "document generation failed", err: String(err) }));
        throw new ApiError(502, "service_unavailable", "Failed to generate document. Please try again.");
      }

      const startup = await deps.repo.getOrCreateStartup(userId);
      const id = randomUUID();
      const storageKey = `${startup.id}/generated/${id}/${safeFileName(template.type)}.md`;
      await deps.storage.put(storageKey, content, "text/markdown");
      const doc = await deps.repo.createGeneratedDocument({
        id,
        userId,
        startupId: startup.id,
        name: `${template.name} — ${fields[template.fields[0]?.id ?? ""] || "Draft"}`,
        type: template.type,
        templateId: template.id,
        templateName: template.name,
        fields,
        content,
        storageKey,
      });
      return c.json({ data: { id: doc.id, name: doc.name, content, type: doc.type, createdAt: doc.createdAt.toISOString() } }, 201);
    })
    .openapi(uploadRoute, async (c) => {
      const userId = currentUserId(c);
      const contentType = c.req.header("content-type") ?? "";
      if (!contentType.includes("multipart/form-data")) {
        throw new ApiError(400, "bad_request", "Expected multipart/form-data with a `file` field");
      }
      const form = await c.req.parseBody();
      const file = form.file;
      if (!(file instanceof File)) throw new ApiError(400, "bad_request", "No file provided");
      if (!ALLOWED_UPLOAD_TYPES.has(file.type)) throw new ApiError(400, "bad_request", `File type not allowed: ${file.type || "unknown"}`);
      if (file.size > MAX_UPLOAD_BYTES) throw new ApiError(400, "bad_request", "File too large (max 10 MB)");

      const assessmentId = optionalString(form.assessmentId);
      if (assessmentId && !/^[0-9a-f-]{36}$/i.test(assessmentId)) throw new ApiError(400, "bad_request", "Invalid assessmentId");
      const questionKey = optionalString(form.questionKey);
      const domain = optionalString(form.domain);

      const startup = await deps.repo.getOrCreateStartup(userId);
      const uploadId = randomUUID();
      const name = safeFileName(file.name);
      const storageKey = assessmentId
        ? `${startup.id}/assessments/${assessmentId}/${safeFileName(questionKey ?? "general")}/${name}`
        : `${startup.id}/uploads/${uploadId}/${name}`;

      await deps.storage.put(storageKey, new Uint8Array(await file.arrayBuffer()), file.type);
      await deps.repo.createUpload({
        id: uploadId,
        userId,
        startupId: startup.id,
        name: file.name.slice(0, 255),
        storageKey,
        mimeType: file.type,
        fileSize: file.size,
        domain,
        assessmentId,
        questionKey,
      });
      return c.json({ data: { uploadId, storageKey, fileName: file.name } }, 201);
    })
    .openapi(downloadRoute, async (c) => {
      const { id } = c.req.valid("param");
      // Not-yours and doesn't-exist look identical, so ids can't be probed.
      const doc = await deps.repo.findDocumentForUser(id, currentUserId(c));
      if (!doc) throw new ApiError(404, "not_found", "Document not found");
      if (doc.storageKey) return c.redirect(await deps.storage.signedUrl(doc.storageKey, 300), 302);
      if (doc.content) {
        return c.body(doc.content, 200, {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${safeFileName(doc.name)}.md"`,
        });
      }
      throw new ApiError(404, "not_found", "No content available");
    });
}
