"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { BentoCard, IconChip } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { cn } from "@orion/ui/utils";
import type { DocumentTemplate } from "@orion/core/documents/templates";
import { categoryFor } from "./template-gallery";

const fieldClass =
  "w-full rounded-2xl border bg-white/80 px-4 py-3.5 text-[0.95rem] text-ink shadow-[0_1px_0_rgba(12,26,23,0.03)] outline-none transition-all placeholder:text-mist/50 hover:border-line-strong focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10";

/** Template details form, styled like the auth forms (mono labels, rounded-2xl inputs, pill CTA). */
export function InputForm({
  template,
  onBack,
  onGenerate,
  prefill,
  error,
}: {
  template: DocumentTemplate;
  onBack: () => void;
  onGenerate: (fields: Record<string, string>) => void;
  prefill?: Record<string, string>;
  error?: string;
}) {
  const [fields, setFields] = useState<Record<string, string>>(prefill || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const meta = categoryFor(template.category);
  const Icon = meta.icon;
  const requiredCount = template.fields.filter((f) => f.required).length;
  const filledCount = template.fields.filter((f) => f.required && fields[f.id]?.trim()).length;

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    for (const field of template.fields) {
      if (field.required && !fields[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} is required`;
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onGenerate(fields);
  };

  const update = (id: string, value: string) => {
    setFields((p) => ({ ...p, [id]: value }));
    setErrors((p) => ({ ...p, [id]: "" }));
  };

  return (
    <BentoCard padding="lg" className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to templates"
            className="focus-ring grid size-10 shrink-0 place-items-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:border-ink hover:bg-ink hover:text-cloud"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-brand">{meta.label}</p>
            <h2 className="mt-1 font-display text-3xl leading-[1.05] tracking-tight text-ink sm:text-4xl">
              {template.name}
            </h2>
            <p className="mt-2 text-sm text-mist">Fill in the details and Orion will draft it for you.</p>
          </div>
        </div>
        <IconChip tone={meta.tone} size="lg" className="hidden sm:inline-flex">
          <Icon />
        </IconChip>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-2xl border border-ember/20 bg-ember-soft px-4 py-3 text-sm text-ember-deep">
          {error}
        </p>
      )}

      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {template.fields.map((field) => (
          <label key={field.id} className={cn("block min-w-0", field.type === "textarea" && "sm:col-span-2")}>
            <span className="mb-2 flex items-center gap-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-mist">
              {field.label}
              {field.required && <span className="text-ember">*</span>}
            </span>
            {field.type === "text" && (
              <input
                type="text"
                value={fields[field.id] || ""}
                onChange={(e) => update(field.id, e.target.value)}
                placeholder={field.placeholder}
                aria-invalid={!!errors[field.id]}
                className={cn(fieldClass, errors[field.id] ? "border-ember/50" : "border-line")}
              />
            )}
            {field.type === "date" && (
              <input
                type="date"
                value={fields[field.id] || ""}
                onChange={(e) => update(field.id, e.target.value)}
                aria-invalid={!!errors[field.id]}
                className={cn(fieldClass, errors[field.id] ? "border-ember/50" : "border-line")}
              />
            )}
            {field.type === "select" && (
              <span className="relative block">
                <select
                  value={fields[field.id] || ""}
                  onChange={(e) => update(field.id, e.target.value)}
                  aria-invalid={!!errors[field.id]}
                  className={cn(fieldClass, "appearance-none pr-11", errors[field.id] ? "border-ember/50" : "border-line")}
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute inset-y-0 right-4 my-auto size-4 text-mist"
                  aria-hidden="true"
                />
              </span>
            )}
            {field.type === "textarea" && (
              <textarea
                value={fields[field.id] || ""}
                onChange={(e) => update(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                aria-invalid={!!errors[field.id]}
                className={cn(fieldClass, "resize-none", errors[field.id] ? "border-ember/50" : "border-line")}
              />
            )}
            {errors[field.id] && <span className="mt-1.5 block text-xs text-ember-deep">{errors[field.id]}</span>}
          </label>
        ))}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Chip tone={filledCount === requiredCount ? "teal" : "neutral"}>
          {filledCount}/{requiredCount} required fields
        </Chip>
        <button
          type="button"
          onClick={handleSubmit}
          className="focus-ring group flex w-full items-center justify-between gap-4 rounded-full bg-ink py-2 pl-6 pr-2 font-medium text-cloud shadow-[0_18px_40px_-14px_rgba(12,26,23,0.55)] transition-colors hover:bg-brand sm:w-auto"
        >
          <span>Generate document</span>
          <span className="grid size-10 place-items-center rounded-full bg-cloud text-brand transition-transform duration-500 group-hover:-rotate-45">
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </button>
      </div>
    </BentoCard>
  );
}
