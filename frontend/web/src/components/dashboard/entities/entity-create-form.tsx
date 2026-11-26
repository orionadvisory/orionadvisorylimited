"use client";

import { useState, useTransition } from "react";
import { Archive, Building2, Loader2, Plus, X } from "lucide-react";
import { createEntity, archiveEntity } from "@/app/actions/entities";

const inputClass = "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-mist/60 focus:border-brand focus:ring-4 focus:ring-brand/10";

export function EntityCreateForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await createEntity({ name: String(formData.get("name") || ""), legalType: String(formData.get("legalType") || ""), jurisdiction: String(formData.get("jurisdiction") || ""), state: String(formData.get("state") || ""), registrationNumber: String(formData.get("registrationNumber") || ""), role: String(formData.get("role") || "") });
      if ("error" in result) setError(result.error ?? "Unable to add this entity"); else setOpen(false);
    });
  }
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand"><Plus className="h-4 w-4" />Add an entity</button>;
  return <form action={submit} className="w-full rounded-bento border border-brand/15 bg-brand-soft p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-ink">Add an entity</h2><p className="mt-1 text-xs text-mist">Only the essentials for now. Complete the profile later.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close form" className="rounded-full p-2 text-mist hover:bg-white"><X className="h-4 w-4" /></button></div>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className="text-xs font-medium text-ink-soft">Registered name<input className={`${inputClass} mt-2`} name="name" required maxLength={255} placeholder="Acme Nigeria Limited" /></label>
      <label className="text-xs font-medium text-ink-soft">Legal type<input className={`${inputClass} mt-2`} name="legalType" required maxLength={255} placeholder="Private company limited by shares" /></label>
      <label className="text-xs font-medium text-ink-soft">Jurisdiction<input className={`${inputClass} mt-2`} name="jurisdiction" required maxLength={255} placeholder="Nigeria" /></label>
      <label className="text-xs font-medium text-ink-soft">State / region<input className={`${inputClass} mt-2`} name="state" maxLength={255} placeholder="Lagos" /></label>
      <label className="text-xs font-medium text-ink-soft">Registration number<input className={`${inputClass} mt-2`} name="registrationNumber" maxLength={255} placeholder="RC 1234567" /></label>
      <label className="text-xs font-medium text-ink-soft">Role<select className={`${inputClass} mt-2`} name="role" defaultValue="operating"><option value="operating">Operating company</option><option value="holding">Holding company</option><option value="ip_holder">IP holder</option><option value="fund">Fund</option><option value="gp">General partner</option><option value="adviser">Adviser / manager</option></select></label>
    </div>
    {error && <p role="alert" className="mt-4 text-sm text-ember-deep">{error}</p>}
    <button disabled={pending} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}{pending ? "Adding…" : "Add to workspace"}</button>
  </form>;
}

export function ArchiveEntityButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} onClick={() => { if (window.confirm(`Archive ${name}? Its history will be retained.`)) startTransition(async () => { await archiveEntity(id); }); }} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-mist hover:border-ember/30 hover:text-ember-deep disabled:opacity-50"><Archive className="h-3.5 w-3.5" />{pending ? "Archiving…" : "Archive"}</button>;
}
