import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { ArrowRight, ChevronDown, Lock } from "lucide-react";
import { cn } from "@orion/ui/utils";

const labelClass = "mb-2 block font-mono text-[0.68rem] uppercase tracking-[0.18em] text-mist";
const controlClass =
  "w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-[0.95rem] text-ink shadow-[0_1px_0_rgba(12,26,23,0.03)] outline-none transition-all placeholder:text-mist/50 hover:border-line-strong focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10";

/** Auth-form style input with a mono label; read-only fields render muted with a lock. */
export function SettingsField({
  label,
  hint,
  readOnly,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className={labelClass}>{label}</span>
      <span className="relative block">
        <input
          {...props}
          readOnly={readOnly}
          className={cn(
            controlClass,
            readOnly &&
              "cursor-not-allowed border-line bg-canvas pr-10 text-mist hover:border-line focus:border-line focus:ring-0"
          )}
        />
        {readOnly && (
          <Lock
            className="pointer-events-none absolute inset-y-0 right-4 my-auto size-3.5 text-mist"
            aria-hidden="true"
          />
        )}
      </span>
      {hint && <span className="mt-1.5 block text-xs text-mist">{hint}</span>}
    </label>
  );
}

export function SettingsSelect({
  label,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className={cn("block", className)}>
      <span className={labelClass}>{label}</span>
      <span className="relative block">
        <select {...props} className={cn(controlClass, "appearance-none pr-10")}>
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute inset-y-0 right-4 my-auto size-4 text-mist"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}

/** Pill primary button with the round arrow chip, matching the auth submit. */
export function SaveButton({ children = "Save Changes" }: { children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className="focus-ring group inline-flex items-center gap-4 rounded-full bg-ink py-1.5 pl-5 pr-1.5 text-sm font-medium text-cloud shadow-[0_18px_40px_-14px_rgba(12,26,23,0.55)] transition-colors hover:bg-brand"
    >
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-cloud text-brand transition-transform duration-500 group-hover:-rotate-45">
        <ArrowRight className="size-4" aria-hidden="true" />
      </span>
    </button>
  );
}
