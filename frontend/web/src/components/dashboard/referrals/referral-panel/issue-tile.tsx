import { Check } from "lucide-react";
import { Chip } from "@orion/ui/components/ui/chip";
import { cn } from "@orion/ui/utils";
import { domainLabel, severityOf, type Issue } from "./referral-model";

/** Selectable bento tile for one issue in the expert-help picker. */
export function IssueTile({
  issue,
  selected,
  onSelect,
}: {
  issue: Issue;
  selected: boolean;
  onSelect: () => void;
}) {
  const sev = severityOf(issue.severity);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "focus-ring group relative flex h-full w-full flex-col rounded-bento-sm border p-4 text-left transition-all duration-200",
        selected
          ? "border-brand bg-brand-soft ring-4 ring-brand/10"
          : "border-line bg-white hover:-translate-y-0.5 hover:border-line-strong hover:shadow-bento motion-reduce:hover:translate-y-0"
      )}
    >
      <span className="flex items-center gap-2 pr-8">
        <Chip tone={sev.tone} className={sev.className}>
          {sev.label}
        </Chip>
        <span className="truncate font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mist">
          {domainLabel(issue.domain)}
        </span>
      </span>
      <span className="mt-3 line-clamp-2 text-sm font-medium leading-5 text-ink">{issue.title}</span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-3 top-3 grid size-6 place-items-center rounded-full border transition-colors",
          selected ? "border-brand bg-brand text-white" : "border-line-strong bg-white text-transparent"
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    </button>
  );
}
