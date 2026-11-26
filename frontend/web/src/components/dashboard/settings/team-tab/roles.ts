import type { WorkspaceRole } from "@orion/contracts";

/** Plain-English role descriptions (PRD §18). Mirrors the API permission policy. */
export const ROLES: { value: WorkspaceRole; label: string; description: string }[] = [
  { value: "owner", label: "Owner", description: "Full administration, including other owners" },
  { value: "administrator", label: "Administrator", description: "Entities, team members and settings" },
  { value: "compliance_manager", label: "Compliance manager", description: "Adds, dates and updates obligations" },
  { value: "contributor", label: "Contributor", description: "Moves tasks forward and uploads evidence" },
  { value: "reviewer", label: "Reviewer", description: "Reviews and progresses tasks; approvals coming later" },
  { value: "viewer", label: "Viewer", description: "Read-only access" },
  { value: "external_adviser", label: "External adviser", description: "Selected entities only, e.g. a local accountant" },
];

export const roleLabel = (role: WorkspaceRole) => ROLES.find((r) => r.value === role)?.label ?? role;

/** Owners and administrators always see every entity. */
export const isFullScopeRole = (role: WorkspaceRole) => role === "owner" || role === "administrator";
/** External advisers must be limited to selected entities. */
export const isScopedOnlyRole = (role: WorkspaceRole) => role === "external_adviser";

/** Only owners may grant the owner role. */
export const assignableRoles = (actorRole: WorkspaceRole) =>
  ROLES.filter((r) => r.value !== "owner" || actorRole === "owner");

export type EntityOption = { id: string; name: string; jurisdiction: string };
