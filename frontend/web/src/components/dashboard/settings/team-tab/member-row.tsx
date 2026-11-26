"use client";

import { useState, useTransition } from "react";
import type { WorkspaceMemberDto, WorkspaceRole } from "@orion/contracts";
import { Chip } from "@orion/ui/components/ui/chip";
import { Loader2, Pencil, UserMinus, X } from "lucide-react";
import { removeMember, updateMember } from "@/app/actions/workspace";
import { EntityScopePicker } from "./entity-scope-picker";
import { assignableRoles, isScopedOnlyRole, roleLabel, type EntityOption } from "./roles";

const control =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

export function MemberRow({
  member,
  actorRole,
  isSelf,
  entities,
}: {
  member: WorkspaceMemberDto;
  actorRole: WorkspaceRole;
  isSelf: boolean;
  entities: EntityOption[];
}) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState<WorkspaceRole>(member.role);
  const [entityIds, setEntityIds] = useState<string[] | null>(member.entityScope === "selected" ? member.entityIds : null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  // Mirrors the API rule: only owners change or remove owners.
  const canManage = member.role !== "owner" || actorRole === "owner";
  const scopeNames = entities.filter((e) => member.entityIds.includes(e.id)).map((e) => e.name);
  const scopeMissing = (isScopedOnlyRole(role) || entityIds !== null) && (entityIds?.length ?? 0) === 0;

  const run = (action: () => Promise<{ error?: string } | { success: true }>, after?: () => void) => {
    setError("");
    startTransition(async () => {
      const result = await action();
      if ("error" in result && result.error) setError(result.error);
      else after?.();
    });
  };

  const save = () => run(() => updateMember(member.id, { role, entityIds }), () => setEditing(false));
  const remove = () => {
    if (window.confirm(`Remove ${member.name || member.email} from this workspace?`)) run(() => removeMember(member.id));
  };

  return (
    <article className="px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink">{member.name || member.email}</h3>
            <Chip tone={member.role === "owner" ? "ink" : "teal"}>{roleLabel(member.role)}</Chip>
            {isSelf && <Chip>You</Chip>}
          </div>
          <p className="mt-1 text-sm text-ink-soft">{member.email}</p>
          <p className="mt-2 text-xs text-mist">
            {member.entityScope === "all" ? "All entities" : scopeNames.length ? `Only: ${scopeNames.join(", ")}` : "No entities selected"}
          </p>
        </div>
        {canManage && !editing && (
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-brand/30 hover:text-brand">
              <Pencil className="h-3.5 w-3.5" />Edit
            </button>
            {!isSelf && (
              <button type="button" disabled={pending} onClick={remove} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-mist hover:border-ember/30 hover:text-ember-deep disabled:opacity-50">
                <UserMinus className="h-3.5 w-3.5" />Remove
              </button>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="mt-4 space-y-4 rounded-2xl border border-line bg-canvas/60 p-4">
          <label className="block text-xs font-medium text-ink-soft">
            Role
            <select
              value={role}
              onChange={(e) => {
                const next = e.target.value as WorkspaceRole;
                setRole(next);
                if (isScopedOnlyRole(next) && entityIds === null) setEntityIds([]);
              }}
              className={`${control} mt-2`}
            >
              {assignableRoles(actorRole).map((r) => (
                <option key={r.value} value={r.value}>{r.label} — {r.description}</option>
              ))}
            </select>
          </label>
          <EntityScopePicker role={role} entities={entities} value={entityIds} onChange={setEntityIds} />
          <div className="flex gap-2">
            <button type="button" disabled={pending || scopeMissing} onClick={save} className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}Save changes
            </button>
            <button type="button" onClick={() => setEditing(false)} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs text-ink-soft">
              <X className="h-3.5 w-3.5" />Cancel
            </button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-ember-deep">{error}</p>}
    </article>
  );
}
