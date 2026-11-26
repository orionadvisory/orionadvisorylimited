import { OpenAPIHono } from "@hono/zod-openapi";
import { requireRole } from "../../../middleware/session";
import { bootstrapRoutes } from "./bootstrap";
import { contentRoutes } from "./content";
import { peopleRoutes } from "./people";
import type { AdminDeps } from "./shared";

export type { AdminDeps } from "./shared";
export { bootstrapRoutes };

/**
 * The admin console API. One gate covers everything under /v1/admin: an active admin
 * session (suspended users never have a session, so "active" is implied).
 * Scoped to the path — never "*" — so it can't leak onto other routes when mounted.
 */
export function adminRoutes(deps: AdminDeps) {
  const app = new OpenAPIHono();
  app.use("/v1/admin/*", requireRole("admin"));
  return app.route("/", contentRoutes(deps)).route("/", peopleRoutes(deps));
}
