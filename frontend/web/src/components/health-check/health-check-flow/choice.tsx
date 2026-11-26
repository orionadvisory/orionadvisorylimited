import { Check } from "lucide-react";
import { cn } from "@orion/ui/utils";

/** Single-select option tile. */
export function OptionButton({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "focus-ring flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all",
        selected
          ? "border-brand bg-brand-soft font-medium text-ink shadow-[0_0_0_3px_rgb(15_118_110/0.08)]"
          : "border-line bg-white text-ink-soft hover:border-line-strong hover:bg-canvas/60"
      )}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
          selected ? "border-brand bg-brand text-white" : "border-line-strong bg-white"
        )}
      >
        {selected && <Check className="size-3" strokeWidth={3} />}
      </span>
    </button>
  );
}

/** Checkbox-style toggle row (whole row is the hit target). */
export function ToggleRow({
  checked,
  onToggle,
  title,
  description,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        "focus-ring flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
        checked
          ? "border-brand/40 bg-brand-soft"
          : "border-line bg-white hover:border-line-strong hover:bg-canvas/60"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
          checked ? "border-brand bg-brand text-white" : "border-line-strong bg-white"
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-xs leading-5 text-mist">{description}</span>}
      </span>
    </button>
  );
}

/** Labelled group of choices. */
export function ChoiceGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold tracking-tight text-ink">{label}</legend>
      {children}
    </fieldset>
  );
}
