import type { WorkspacePermission, WorkspaceRole } from "@orion/contracts";
import { ApiError } from "../../lib/errors";

/**
 * Workspace role → permissions (PRD §18). Entity scope is applied separately:
 * a permission only ever covers the entities the member can see.
 */
const ROLE_PERMISSIONS: Record<WorkspaceRole, readonly WorkspacePermission[]> = {
  owner: ["entity:read", "entity:manage", "obligation:read", "obligation:manage", "obligation:progress", "members:manage"],
  administrator: ["entity:read", "entity:manage", "obligation:read", "obligation:manage", "obligation:progress", "members:manage"],
  compliance_manager: ["entity:read", "obligation:read", "obligation:manage", "obligation:progress"],
  contributor: ["entity:read", "obligation:read", "obligation:progress"],
  reviewer: ["entity:read", "obligation:read", "obligation:progress"],
  viewer: ["entity:read", "obligation:read"],
  external_adviser: ["entity:read", "obligation:read", "obligation:progress"],
};

/** Roles that always see the whole workspace; their entity scope cannot be narrowed. */
export const FULL_SCOPE_ROLES: ReadonlySet<WorkspaceRole> = new Set(["owner", "administrator"]);
/** Roles that must be limited to explicitly selected entities. */
export const SCOPED_ONLY_ROLES: ReadonlySet<WorkspaceRole> = new Set(["external_adviser"]);

export function permissionsFor(role: WorkspaceRole): WorkspacePermission[] {
  return [...ROLE_PERMISSIONS[role]];
}

export function can(role: WorkspaceRole, permission: WorkspacePermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function requirePermission(role: WorkspaceRole, permission: WorkspacePermission): void {
  if (!can(role, permission)) {
    throw new ApiError(403, "forbidden", "Your role in this workspace does not allow this action");
  }
}

/** `entityIds === null` means every entity in the workspace. */
export function inScope(entityIds: readonly string[] | null, entityId: string): boolean {
  return entityIds === null || entityIds.includes(entityId);
}

/**
 * Normalise a requested entity scope for a role: full-scope roles always get every
 * entity; scoped-only roles must name at least one entity.
 */
export function scopeForRole(role: WorkspaceRole, entityIds: string[] | null | undefined): string[] | null {
  if (FULL_SCOPE_ROLES.has(role)) return null;
  const selected = entityIds ? [...new Set(entityIds)] : null;
  if (SCOPED_ONLY_ROLES.has(role) && !selected) {
    throw new ApiError(400, "bad_request", "External advisers must be limited to at least one selected entity");
  }
  if (selected && selected.length === 0) {
    throw new ApiError(400, "bad_request", "Select at least one entity, or give access to all entities");
  }
  return selected;
}

/**
 * Who may change a membership. Only owners can grant, change or remove the owner role;
 * administrators manage everyone else.
 */
export function assertCanManageMember(actorRole: WorkspaceRole, targetRole: WorkspaceRole, newRole?: WorkspaceRole): void {
  requirePermission(actorRole, "members:manage");
  if ((targetRole === "owner" || newRole === "owner") && actorRole !== "owner") {
    throw new ApiError(403, "forbidden", "Only an owner can grant, change or remove the owner role");
  }
}
