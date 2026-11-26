import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { BootstrapAdminBodySchema } from "@orion/contracts";
import { ApiError } from "../../../lib/errors";
import { hashPassword } from "../../auth/password";
import { dataOf, errorResponse, json, type AdminDeps } from "./shared";

const statusRoute = createRoute({
  method: "get",
  path: "/v1/bootstrap/admin",
  tags: ["admin: bootstrap"],
  summary: "Whether an admin account exists yet (public)",
  responses: { 200: { description: "Status", content: dataOf(z.object({ hasAdmin: z.boolean() })) } },
});

const createFirstAdminRoute = createRoute({
  method: "post",
  path: "/v1/bootstrap/admin",
  tags: ["admin: bootstrap"],
  summary: "Create the first admin. Locked permanently once any admin exists (public)",
  request: { body: { content: json(BootstrapAdminBodySchema), required: true } },
  responses: {
    201: { description: "Created", content: dataOf(z.object({ ok: z.literal(true) })) },
    400: errorResponse("Invalid input"),
    409: errorResponse("An admin already exists, or the email is taken"),
  },
});

export function bootstrapRoutes({ repo }: AdminDeps) {
  return new OpenAPIHono()
    .openapi(statusRoute, async (c) => c.json({ data: { hasAdmin: await repo.hasAdmin() } }, 200))
    .openapi(createFirstAdminRoute, async (c) => {
      if (await repo.hasAdmin()) {
        throw new ApiError(409, "conflict", "An admin account already exists. This page is locked.");
      }
      const { name, email, password } = c.req.valid("json");
      const result = await repo.createFirstAdmin({ name, email, passwordHash: await hashPassword(password) });
      if (result === "email_taken") throw new ApiError(409, "conflict", "An account with this email already exists.");
      return c.json({ data: { ok: true as const } }, 201);
    });
}
