import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  CreateEntityBodySchema,
  EntityIdParamSchema,
  EntitySchema,
  UpdateEntityBodySchema,
} from "@orion/contracts";
import { ApiError } from "../../../lib/errors";
import { requireUser } from "../../../middleware/session";
import { currentUserId, errorResponse, json, type FounderDeps } from "./shared";

const listRoute = createRoute({
  method: "get",
  path: "/v1/entities",
  tags: ["entities"],
  summary: "List entities in the caller's workspace",
  middleware: [requireUser] as const,
  request: { query: z.object({ includeArchived: z.enum(["true", "false"]).optional() }) },
  responses: {
    200: { description: "Workspace entities", content: json(z.object({ data: z.array(EntitySchema) })) },
    401: errorResponse("Not signed in"),
  },
});

const createEntityRoute = createRoute({
  method: "post",
  path: "/v1/entities",
  tags: ["entities"],
  summary: "Add an entity to the caller's workspace",
  middleware: [requireUser] as const,
  request: { body: { content: json(CreateEntityBodySchema), required: true } },
  responses: {
    201: { description: "Entity created", content: json(z.object({ data: EntitySchema })) },
    400: errorResponse("Invalid entity details"),
    401: errorResponse("Not signed in"),
  },
});

const updateRoute = createRoute({
  method: "patch",
  path: "/v1/entities/{id}",
  tags: ["entities"],
  summary: "Update or archive a workspace entity",
  middleware: [requireUser] as const,
  request: {
    params: EntityIdParamSchema,
    body: { content: json(UpdateEntityBodySchema), required: true },
  },
  responses: {
    200: { description: "Entity updated", content: json(z.object({ data: EntitySchema })) },
    400: errorResponse("Invalid entity details"),
    401: errorResponse("Not signed in"),
    404: errorResponse("Entity not found (or outside this workspace)"),
  },
});

export function entityRoutes(deps: FounderDeps) {
  return new OpenAPIHono()
    .openapi(listRoute, async (c) => {
      const { includeArchived } = c.req.valid("query");
      c.header("Cache-Control", "no-store");
      return c.json({ data: await deps.repo.listEntities(currentUserId(c), includeArchived === "true") }, 200);
    })
    .openapi(createEntityRoute, async (c) => {
      const data = await deps.repo.createEntity(currentUserId(c), c.req.valid("json"));
      return c.json({ data }, 201);
    })
    .openapi(updateRoute, async (c) => {
      const data = await deps.repo.updateEntity(currentUserId(c), c.req.valid("param").id, c.req.valid("json"));
      if (!data) throw new ApiError(404, "not_found", "Entity not found");
      return c.json({ data }, 200);
    });
}
