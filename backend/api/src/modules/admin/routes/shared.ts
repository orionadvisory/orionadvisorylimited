import { ErrorResponseSchema, MutationResultSchema } from "@orion/contracts";
import { z } from "@hono/zod-openapi";
import type { Context } from "hono";
import { ApiError } from "../../../lib/errors";
import type { Storage } from "../../../lib/storage";
import type { AdminRepo } from "../repo";

export type AdminDeps = { repo: AdminRepo; storage: Storage };

export const json = <T>(schema: T) => ({ "application/json": { schema } });
export const errorResponse = (description: string) => ({ description, content: json(ErrorResponseSchema) });
export const dataOf = <T extends z.ZodType>(schema: T) => json(z.object({ data: schema }));

export const mutationOk = { description: "Done", content: dataOf(MutationResultSchema) };
export const adminErrors = {
  400: errorResponse("Invalid input"),
  401: errorResponse("Not signed in"),
  403: errorResponse("Admins only"),
};

/** The acting admin. All /v1/admin routes sit behind requireRole("admin"). */
export function adminId(c: Context): string {
  const session = c.get("session");
  if (!session) throw new ApiError(401, "unauthorized", "Sign in required");
  return session.user.id;
}

export const notFound = (message: string) => new ApiError(404, "not_found", message);
