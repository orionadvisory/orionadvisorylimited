"use client";

import { useState, useTransition } from "react";
import type { WorkspaceRole } from "@orion/contracts";
import { Loader2, UserPlus } from "lucide-react";
import { addMember } from "@/app/actions/workspace";
import { EntityScopePicker } from "./entity-scope-picker";
import { assignableRoles, isScopedOnlyRole, type EntityOption } from "./roles";

const control =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

export function AddMemberForm({ actorRole, entities }: { actorRole: WorkspaceRole; entities: EntityOption[] }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("viewer");
  const [entityIds, setEntityIds] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const changeRole = (next: WorkspaceRole) => {
    setRole(next);
    if (isScopedOnlyRole(next) && entityIds === null) setEntityIds([]);
  };
  const scopeMissing = (isScopedOnlyRole(role) || entityIds !== null) && (entityIds?.length ?? 0) === 0;

  const submit = () => {
    setError("");
    startTransition(async () => {
      const result = await addMember({ email, role, entityIds });
      if ("error" in result) {
        setError(result.error ?? "Unable to add this member");
        return;
      }
      setEmail("");
      setRole("viewer");
      setEntityIds(null);
    });
  };

  return (
    <form action={submit} className="space-y-5 rounded-bento border border-brand/15 bg-brand-soft p-5 sm:p-6">
      <div>
        <h3 className="font-semibold text-ink">Add a team member</h3>
        <p className="mt-1 text-xs text-mist">They need an ORION account with this email. Email invitations are coming later.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-medium text-ink-soft">
          Email
          <input type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className={`${control} mt-2`} placeholder="accountant@firm.ng" />
        </label>
        <label className="text-xs font-medium text-ink-soft">
          Role
          <select value={role} onChange={(e) => changeRole(e.target.value as WorkspaceRole)} className={`${control} mt-2`}>
            {assignableRoles(actorRole).map((r) => (
              <option key={r.value} value={r.value}>{r.label} — {r.description}</option>
            ))}
          </select>
        </label>
      </div>
      <EntityScopePicker role={role} entities={entities} value={entityIds} onChange={setEntityIds} />
      {error && <p role="alert" className="text-sm text-ember-deep">{error}</p>}
      <button
        disabled={pending || !email || scopeMissing}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        {pending ? "Adding…" : "Add member"}
      </button>
    </form>
  );
}
