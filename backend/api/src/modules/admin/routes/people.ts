import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  AdminPageQuerySchema,
  AdminPartnerSchema,
  AdminSubmissionDetailSchema,
  AdminSubmissionPageSchema,
  AdminUserPageSchema,
  AdminUserStatsSchema,
  AuditEventSchema,
  IdParamSchema,
  ReorderPartnersBodySchema,
  SubmissionQuerySchema,
  UpdateUserRoleBodySchema,
  UpdateUserStatusBodySchema,
} from "@orion/contracts";
import { bodyLimit } from "hono/body-limit";
import { randomUUID } from "node:crypto";
import { ApiError } from "../../../lib/errors";
import { adminErrors, adminId, dataOf, errorResponse, json, notFound, type AdminDeps } from "./shared";

const r = createRoute;
const okBody = dataOf(z.object({ ok: z.literal(true), id: z.uuid().optional() }));
const MAX_LOGO_BYTES = 3 * 1024 * 1024;

// ─── Users ───────────────────────────────────────────────
const userStats = r({ method: "get", path: "/v1/admin/users/stats", tags: ["admin: users"], responses: { 200: { description: "Stats", content: dataOf(AdminUserStatsSchema) }, ...adminErrors } });
const listUsers = r({ method: "get", path: "/v1/admin/users", tags: ["admin: users"], request: { query: AdminPageQuerySchema }, responses: { 200: { description: "Page", content: dataOf(AdminUserPageSchema) }, ...adminErrors } });
const setRole = r({ method: "patch", path: "/v1/admin/users/{id}/role", tags: ["admin: users"], request: { params: IdParamSchema, body: { content: json(UpdateUserRoleBodySchema), required: true } }, responses: { 200: { description: "Updated", content: dataOf(z.object({ changed: z.boolean() })) }, 404: errorResponse("Not found"), ...adminErrors } });
const setStatus = r({ method: "patch", path: "/v1/admin/users/{id}/status", tags: ["admin: users"], request: { params: IdParamSchema, body: { content: json(UpdateUserStatusBodySchema), required: true } }, responses: { 200: { description: "Updated", content: dataOf(z.object({ changed: z.boolean() })) }, 404: errorResponse("Not found"), ...adminErrors } });

// ─── Submissions & audit ─────────────────────────────────
const listSubmissions = r({ method: "get", path: "/v1/admin/submissions", tags: ["admin: assessments"], request: { query: SubmissionQuerySchema }, responses: { 200: { description: "Page", content: dataOf(AdminSubmissionPageSchema) }, ...adminErrors } });
const submissionDetail = r({ method: "get", path: "/v1/admin/submissions/{id}", tags: ["admin: assessments"], request: { params: IdParamSchema }, responses: { 200: { description: "Detail", content: dataOf(AdminSubmissionDetailSchema) }, 404: errorResponse("Not found"), ...adminErrors } });
const auditFeed = r({ method: "get", path: "/v1/admin/audit", tags: ["admin: audit"], request: { query: z.object({ limit: z.coerce.number().int().min(1).max(200).default(20) }) }, responses: { 200: { description: "Recent admin actions", content: dataOf(z.array(AuditEventSchema)) }, ...adminErrors } });
const uploadDownload = r({ method: "get", path: "/v1/admin/uploads/{id}/download", tags: ["admin: assessments"], request: { params: IdParamSchema }, responses: { 302: { description: "Redirect to signed URL" }, 404: errorResponse("Not found"), ...adminErrors } });

// ─── Partners ────────────────────────────────────────────
const listPartners = r({ method: "get", path: "/v1/admin/partners", tags: ["admin: partners"], responses: { 200: { description: "Partners", content: dataOf(z.object({ partners: z.array(AdminPartnerSchema) })) }, ...adminErrors } });
const createPartner = r({
  method: "post",
  path: "/v1/admin/partners",
  tags: ["admin: partners"],
  summary: "Add a partner (multipart/form-data: name, logo image ≤ 3 MB)",
  middleware: [bodyLimit({ maxSize: MAX_LOGO_BYTES + 64 * 1024, onError: () => { throw new ApiError(400, "bad_request", "Logo too large (max 3 MB)"); } })] as const,
  responses: { 201: { description: "Created", content: okBody }, ...adminErrors },
});
const reorderPartners = r({ method: "patch", path: "/v1/admin/partners", tags: ["admin: partners"], request: { body: { content: json(ReorderPartnersBodySchema), required: true } }, responses: { 200: { description: "Reordered", content: okBody }, ...adminErrors } });
const deletePartner = r({ method: "delete", path: "/v1/admin/partners/{id}", tags: ["admin: partners"], request: { params: IdParamSchema }, responses: { 200: { description: "Deleted", content: okBody }, 404: errorResponse("Not found"), ...adminErrors } });

export function peopleRoutes({ repo, storage }: AdminDeps) {
  return new OpenAPIHono()
    .openapi(userStats, async (c) => c.json({ data: await repo.userStats() }, 200))
    .openapi(listUsers, async (c) => {
      const { q, page } = c.req.valid("query");
      return c.json({ data: await repo.listUsers(q, page) }, 200);
    })
    .openapi(setRole, async (c) => {
      const { id } = c.req.valid("param");
      const me = adminId(c);
      const { role } = c.req.valid("json");
      if (id === me && role !== "admin") throw new ApiError(400, "bad_request", "You cannot remove your own admin role.");
      const result = await repo.setUserRole(me, id, role);
      if (!result) throw notFound("User not found.");
      return c.json({ data: result }, 200);
    })
    .openapi(setStatus, async (c) => {
      const { id } = c.req.valid("param");
      const me = adminId(c);
      const { status } = c.req.valid("json");
      if (id === me && status === "suspended") throw new ApiError(400, "bad_request", "You cannot suspend your own admin account.");
      const result = await repo.setUserStatus(me, id, status);
      if (!result) throw notFound("User not found.");
      return c.json({ data: result }, 200);
    })

    .openapi(listSubmissions, async (c) => {
      const { templateId, page } = c.req.valid("query");
      return c.json({ data: await repo.listSubmissions(templateId, page) }, 200);
    })
    .openapi(submissionDetail, async (c) => {
      const found = await repo.getSubmission(c.req.valid("param").id);
      if (!found) throw notFound("Submission not found.");
      return c.json({ data: found }, 200);
    })
    .openapi(auditFeed, async (c) => c.json({ data: await repo.recentAuditEvents(c.req.valid("query").limit) }, 200))
    .openapi(uploadDownload, async (c) => {
      const key = await repo.findUploadStorageKey(c.req.valid("param").id);
      if (!key) throw notFound("Upload not found.");
      return c.redirect(await storage.signedUrl(key, 300), 302);
    })

    .openapi(listPartners, async (c) => c.json({ data: { partners: await repo.listPartners() } }, 200))
    .openapi(createPartner, async (c) => {
      const form = await c.req.parseBody();
      const name = typeof form.name === "string" ? form.name.trim().slice(0, 255) : "";
      const file = form.logo;
      if (!name) throw new ApiError(400, "bad_request", "Name is required");
      if (!(file instanceof File)) throw new ApiError(400, "bad_request", "Logo is required");
      if (!file.type.startsWith("image/")) throw new ApiError(400, "bad_request", "Logo must be an image");
      if (file.size > MAX_LOGO_BYTES) throw new ApiError(400, "bad_request", "Logo too large (max 3 MB)");

      const id = randomUUID();
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const storageKey = `partners/${id}/logo.${ext}`;
      try {
        await storage.put(storageKey, new Uint8Array(await file.arrayBuffer()), file.type);
      } catch (err) {
        console.error(JSON.stringify({ level: "error", msg: "partner logo upload failed", err: String(err) }));
        throw new ApiError(502, "service_unavailable", "Failed to upload logo");
      }
      await repo.createPartner(adminId(c), { id, name, storageKey, contentType: file.type });
      return c.json({ data: { ok: true as const, id } }, 201);
    })
    .openapi(reorderPartners, async (c) => {
      await repo.reorderPartners(adminId(c), c.req.valid("json").orderedIds);
      return c.json({ data: { ok: true as const } }, 200);
    })
    .openapi(deletePartner, async (c) => {
      const key = await repo.deletePartner(adminId(c), c.req.valid("param").id);
      if (!key) throw notFound("Not found");
      // Best effort: the row is gone either way; an orphaned object is harmless.
      await storage.delete(key).catch((err) =>
        console.error(JSON.stringify({ level: "warn", msg: "partner logo delete failed", err: String(err) })),
      );
      return c.json({ data: { ok: true as const } }, 200);
    });
}
