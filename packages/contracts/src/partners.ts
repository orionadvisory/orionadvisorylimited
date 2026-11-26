import { z } from "@hono/zod-openapi";

export const PartnerIdParamSchema = z.object({
  id: z.uuid().openapi({ param: { name: "id", in: "path" } }),
});

export const PartnerSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    /** Path on the API origin that serves this partner's logo, e.g. `/v1/partners/:id/logo`. */
    logoPath: z.string(),
  })
  .openapi("Partner");
export type Partner = z.infer<typeof PartnerSchema>;

export const PartnerListResponseSchema = z.object({ data: z.array(PartnerSchema) }).openapi("PartnerList");
export type PartnerListResponse = z.infer<typeof PartnerListResponseSchema>;
