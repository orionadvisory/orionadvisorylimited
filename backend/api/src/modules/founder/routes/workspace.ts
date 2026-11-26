import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  AddMemberBodySchema,
  MemberIdParamSchema,
  UpdateMemberBodySchema,
  WorkspaceAccessSchema,
  WorkspaceMemberSchema,
} from "@orion/contracts";
import { ApiError } from "../../../lib/errors";
import { requireUser } from "../../../middleware/session";
import { currentUserId, errorResponse, json, type FounderDeps } from "./shared";

const accessRoute = createRoute({
  method: "get",
  path: "/v1/workspace",
  tags: ["workspace"],
  summary: "The caller's role, entity scope and permissions in their workspace",
  middleware: [requireUser] as const,
  responses: {
    200: { description: "Workspace access", content: json(z.object({ data: WorkspaceAccessSchema.nullable() })) },
    401: errorResponse("Not signed in"),
  },
});

const listRoute = createRoute({
  method: "get",
  path: "/v1/workspace/members",
  tags: ["workspace"],
  summary: "List workspace members",
  middleware: [requireUser] as const,
  responses: {
    200: { description: "Members", content: json(z.object({ data: z.array(WorkspaceMemberSchema) })) },
    401: errorResponse("Not signed in"),
    403: errorResponse("Role cannot manage members"),
    409: errorResponse("No workspace yet"),
  },
});

const addRoute = createRoute({
  method: "post",
  path: "/v1/workspace/members",
  tags: ["workspace"],
  summary: "Add an existing ORION user to the workspace",
  middleware: [requireUser] as const,
  request: { body: { content: json(AddMemberBodySchema), required: true } },
  responses: {
    201: { description: "Member added", content: json(z.object({ data: WorkspaceMemberSchema })) },
    400: errorResponse("Invalid role or entity scope"),
    401: errorResponse("Not signed in"),
    403: errorResponse("Role cannot manage members"),
    404: errorResponse("No account with that email"),
    409: errorResponse("Already a member, or no workspace yet"),
  },
});

const updateRoute = createRoute({
  method: "patch",
  path: "/v1/workspace/members/{id}",
  tags: ["workspace"],
  summary: "Change a member's role or entity scope",
  middleware: [requireUser] as const,
  request: { params: MemberIdParamSchema, body: { content: json(UpdateMemberBodySchema), required: true } },
  responses: {
    200: { description: "Member updated", content: json(z.object({ data: WorkspaceMemberSchema })) },
    400: errorResponse("Invalid role or entity scope"),
    401: errorResponse("Not signed in"),
    403: errorResponse("Role cannot make this change"),
    404: errorResponse("Member not found"),
    409: errorResponse("Would leave the workspace without an owner"),
  },
});

const removeRoute = createRoute({
  method: "delete",
  path: "/v1/workspace/members/{id}",
  tags: ["workspace"],
  summary: "Remove a member from the workspace",
  middleware: [requireUser] as const,
  request: { params: MemberIdParamSchema },
  responses: {
    200: { description: "Member removed", content: json(z.object({ ok: z.literal(true) })) },
    401: errorResponse("Not signed in"),
    403: errorResponse("Role cannot make this change"),
    404: errorResponse("Member not found"),
    409: errorResponse("Would leave the workspace without an owner"),
  },
});

export function workspaceRoutes(deps: FounderDeps) {
  return new OpenAPIHono()
    .openapi(accessRoute, async (c) => {
      c.header("Cache-Control", "no-store");
      return c.json({ data: await deps.repo.getWorkspaceAccess(currentUserId(c)) }, 200);
    })
    .openapi(listRoute, async (c) => {
      c.header("Cache-Control", "no-store");
      return c.json({ data: await deps.repo.listMembers(currentUserId(c)) }, 200);
    })
    .openapi(addRoute, async (c) => {
      const data = await deps.repo.addMember(currentUserId(c), c.req.valid("json"));
      return c.json({ data }, 201);
    })
    .openapi(updateRoute, async (c) => {
      const data = await deps.repo.updateMember(currentUserId(c), c.req.valid("param").id, c.req.valid("json"));
      if (!data) throw new ApiError(404, "not_found", "Member not found");
      return c.json({ data }, 200);
    })
    .openapi(removeRoute, async (c) => {
      const removed = await deps.repo.removeMember(currentUserId(c), c.req.valid("param").id);
      if (!removed) throw new ApiError(404, "not_found", "Member not found");
      return c.json({ ok: true as const }, 200);
    });
}
