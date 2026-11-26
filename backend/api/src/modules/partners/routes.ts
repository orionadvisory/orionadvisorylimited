import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ErrorResponseSchema, PartnerIdParamSchema, PartnerListResponseSchema } from "@orion/contracts";
import { ApiError } from "../../lib/errors";
import type { PartnersRepo } from "./repo";

const listRoute = createRoute({
  method: "get",
  path: "/v1/partners",
  tags: ["partners"],
  summary: "List partner organisations (public)",
  responses: {
    200: { description: "Partners in display order", content: { "application/json": { schema: PartnerListResponseSchema } } },
  },
});

const logoRoute = createRoute({
  method: "get",
  path: "/v1/partners/{id}/logo",
  tags: ["partners"],
  summary: "Partner logo image (public, long-cached)",
  request: { params: PartnerIdParamSchema },
  responses: {
    200: { description: "Logo image bytes", content: { "image/*": { schema: { type: "string", format: "binary" } } } },
    400: { description: "Invalid id", content: { "application/json": { schema: ErrorResponseSchema } } },
    404: { description: "Unknown partner", content: { "application/json": { schema: ErrorResponseSchema } } },
    502: { description: "Logo storage unavailable", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});

export function partnersRoutes(repo: PartnersRepo) {
  return new OpenAPIHono()
    .openapi(listRoute, async (c) => {
      const rows = await repo.list();
      c.header("Cache-Control", "public, max-age=60");
      return c.json({ data: rows.map((p) => ({ ...p, logoPath: `/v1/partners/${p.id}/logo` })) }, 200);
    })
    .openapi(logoRoute, async (c) => {
      const { id } = c.req.valid("param");

      let logo;
      try {
        logo = await repo.getLogo(id);
      } catch (err) {
        // Log the storage detail server-side only; the client gets a generic 502.
        console.error(JSON.stringify({ level: "error", msg: "partner logo fetch failed", partnerId: id, err: String(err) }));
        throw new ApiError(502, "service_unavailable", "Logo storage unavailable");
      }
      if (!logo) throw new ApiError(404, "not_found", "Partner not found");

      return c.body(logo.bytes, 200, {
        "Content-Type": logo.contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      });
    });
}
