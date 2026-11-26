"use client";

import { Check } from "lucide-react";
import { cn } from "@orion/ui/utils";

const base =
  "group focus-ring flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm leading-snug transition-all duration-200";
const idle = "border-line bg-white text-ink-soft hover:border-line-strong hover:shadow-bento";
const active = "border-brand bg-brand-soft font-medium text-ink ring-2 ring-brand/20";

/** Single-select bento tile with a filled brand radio. */
export function OptionTile({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onClick} className={cn(base, selected ? active : idle)}>
      <span
        aria-hidden="true"
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
          selected ? "border-brand bg-brand" : "border-line-strong bg-white group-hover:border-mist"
        )}
      >
        {selected && <span className="size-2 rounded-full bg-white" />}
      </span>
      <span className="min-w-0">{label}</span>
    </button>
  );
}

/** Multi-select tile with a rounded check box and optional secondary line. */
export function CheckTile({
  checked,
  label,
  description,
  onClick,
}: {
  checked: boolean;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onClick}
      className={cn(base, "items-start", checked ? active : idle)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-px grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors",
          checked ? "border-brand bg-brand text-white" : "border-line-strong bg-white group-hover:border-mist"
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className="min-w-0">
        <span className="block font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-xs font-normal leading-5 text-mist">{description}</span>}
      </span>
    </button>
  );
}

/** Labelled group of single-select tiles. */
export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T | undefined;
  onSelect: (value: T) => void;
}) {
  const twoUp = options.length >= 4 && options.every((o) => o.label.length <= 36);
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-ink">{label}</legend>
      <div role="radiogroup" aria-label={label} className={cn("grid gap-2.5", twoUp && "sm:grid-cols-2")}>
        {options.map((opt) => (
          <OptionTile key={opt.value} selected={value === opt.value} label={opt.label} onClick={() => onSelect(opt.value)} />
        ))}
      </div>
    </fieldset>
  );
}
