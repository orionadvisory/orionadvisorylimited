"use client";

import { useState, useTransition } from "react";
import { CalendarPlus, Loader2, Plus, X } from "lucide-react";
import { createObligation } from "@/app/actions/compliance";

const field =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";

const CATEGORIES = [
  { value: "corporate", label: "Corporate" },
  { value: "tax", label: "Tax" },
  { value: "licensing", label: "Licensing" },
  { value: "data_protection", label: "Data protection" },
  { value: "securities", label: "Securities" },
  { value: "custom", label: "Custom" },
];

export function ObligationForm({ entities }: { entities: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-brand">
        <Plus className="h-4 w-4" />Add obligation
      </button>
    );
  }

  const submit = (form: FormData) =>
    startTransition(async () => {
      setError("");
      const result = await createObligation({
        entityId: String(form.get("entityId")),
        title: String(form.get("title")),
        regulator: String(form.get("regulator") || ""),
        category: String(form.get("category")),
        dueAt: String(form.get("dueAt") || ""),
        explanation: String(form.get("explanation") || ""),
      });
      if ("error" in result) setError(result.error ?? "Unable to add obligation");
      else setOpen(false);
    });

  return (
    <form action={submit} className="rounded-bento border border-brand/15 bg-brand-soft p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-ink">Add an obligation</h2>
          <p className="mt-1 text-xs text-mist">Leave the date empty when it has not been verified.</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close form" className="rounded-full p-2 text-mist hover:bg-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-medium text-ink-soft">
          Entity
          <select name="entityId" required className={`${field} mt-2`}>
            <option value="">Select entity</option>
            {entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-ink-soft">
          Obligation
          <input name="title" required maxLength={500} className={`${field} mt-2`} placeholder="CAC annual return" />
        </label>
        <label className="text-xs font-medium text-ink-soft">
          Category
          <select name="category" className={`${field} mt-2`}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-ink-soft">
          Regulator
          <input name="regulator" maxLength={255} className={`${field} mt-2`} placeholder="CAC, IRS, Delaware Division…" />
        </label>
        <label className="text-xs font-medium text-ink-soft">
          Confirmed due date <span className="text-mist">(optional)</span>
          <input type="date" name="dueAt" className={`${field} mt-2`} />
        </label>
        <label className="text-xs font-medium text-ink-soft">
          Why this may apply
          <input name="explanation" maxLength={5000} className={`${field} mt-2`} placeholder="Plain-English context" />
        </label>
      </div>

      {entities.length === 0 && <p className="mt-4 text-sm text-ember-deep">Add an entity before creating an obligation.</p>}
      {error && <p role="alert" className="mt-4 text-sm text-ember-deep">{error}</p>}
      <button disabled={pending || entities.length === 0} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
        {pending ? "Adding…" : "Add to calendar"}
      </button>
    </form>
  );
}
