import { z } from "@hono/zod-openapi";

/**
 * Shared wire formats for every Orion API response.
 * Success: `{ data, meta? }`. Failure: `{ error: { code, message, details? } }`.
 */

export const ErrorCodeSchema = z.enum([
  "bad_request",
  "validation_failed",
  "unauthorized",
  "forbidden",
  "not_found",
  "conflict",
  "rate_limited",
  "internal_error",
  "service_unavailable",
]);
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export const ErrorResponseSchema = z
  .object({
    error: z.object({
      code: ErrorCodeSchema,
      message: z.string(),
      details: z.unknown().optional(),
      requestId: z.string().optional(),
    }),
  })
  .openapi("ErrorResponse");
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const PageMetaSchema = z
  .object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
  })
  .openapi("PageMeta");
export type PageMeta = z.infer<typeof PageMetaSchema>;

export const PageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PageQuery = z.infer<typeof PageQuerySchema>;

/** Wrap an item schema in the `{ data }` success envelope. */
export function dataEnvelope<T extends z.ZodType>(item: T) {
  return z.object({ data: item });
}

/** Wrap an item schema in the paginated `{ data: T[], meta }` envelope. */
export function pageEnvelope<T extends z.ZodType>(item: T) {
  return z.object({ data: z.array(item), meta: PageMetaSchema });
}
