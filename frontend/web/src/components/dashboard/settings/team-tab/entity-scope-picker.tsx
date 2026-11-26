"use client";

import type { WorkspaceRole } from "@orion/contracts";
import { isFullScopeRole, isScopedOnlyRole, type EntityOption } from "./roles";

/**
 * Choose which entities a member can see. `value === null` means every entity.
 * Full-scope roles skip the choice; scoped-only roles must pick at least one entity.
 */
export function EntityScopePicker({
  role,
  entities,
  value,
  onChange,
}: {
  role: WorkspaceRole;
  entities: EntityOption[];
  value: string[] | null;
  onChange: (next: string[] | null) => void;
}) {
  if (isFullScopeRole(role)) {
    return <p className="text-xs text-mist">This role always has access to every entity.</p>;
  }
  const scopedOnly = isScopedOnlyRole(role);
  const selecting = scopedOnly || value !== null;
  const selected = value ?? [];

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-mist">Entity access</legend>
      {!scopedOnly && (
        <div className="flex flex-wrap gap-4 text-sm text-ink-soft">
          <label className="inline-flex items-center gap-2">
            <input type="radio" checked={!selecting} onChange={() => onChange(null)} className="accent-brand" />
            All entities
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="radio" checked={selecting} onChange={() => onChange([])} className="accent-brand" />
            Selected entities only
          </label>
        </div>
      )}
      {selecting &&
        (entities.length === 0 ? (
          <p className="text-xs text-ember-deep">Add an entity first, then limit access to it.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {entities.map((entity) => (
              <label key={entity.id} className="flex items-center gap-2 rounded-2xl border border-line bg-white px-3 py-2 text-sm text-ink">
                <input type="checkbox" checked={selected.includes(entity.id)} onChange={() => toggle(entity.id)} />
                <span className="min-w-0 truncate">{entity.name}</span>
                <span className="ml-auto shrink-0 text-xs text-mist">{entity.jurisdiction}</span>
              </label>
            ))}
          </div>
        ))}
      {scopedOnly && <p className="text-xs text-mist">External advisers can only see the entities you select.</p>}
    </fieldset>
  );
}
