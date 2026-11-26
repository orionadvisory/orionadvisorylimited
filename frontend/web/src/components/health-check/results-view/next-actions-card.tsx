import { ArrowUpRight, ListChecks } from "lucide-react";
import { BentoCard, IconChip } from "@orion/ui/components/ui/bento-card";

/** The page's dark anchor: the top recommendations, numbered, with a single CTA. */
export function NextActionsCard({
  actions,
  onAction,
  className,
}: {
  actions: string[];
  onAction: () => void;
  className?: string;
}) {
  return (
    <BentoCard
      as="section"
      variant="ink"
      padding="lg"
      aria-labelledby="next-actions-title"
      className={`flex flex-col print:border print:border-line print:bg-white print:shadow-none print:**:text-ink! ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <IconChip tone="on-ink">
            <ListChecks />
          </IconChip>
          <div>
            <h2 id="next-actions-title" className="text-base font-semibold tracking-tight">
              What to do next
            </h2>
            <p className="text-xs text-[#b9c4bf]">Priority actions, most urgent first</p>
          </div>
        </div>
        {actions.length > 0 && (
          <p className="font-display text-5xl leading-none tracking-tight tabular-nums">
            {actions.length}
            <span className="sr-only"> actions</span>
          </p>
        )}
      </div>

      {actions.length === 0 ? (
        <p className="mt-6 rounded-bento-sm bg-white/[0.05] p-5 text-sm leading-6 text-[#b9c4bf]">
          Nothing urgent — keep your documents current and re-check as you grow.
        </p>
      ) : (
        <ol className="mt-5 divide-y divide-white/[0.06]">
          {actions.map((action, i) => (
            <li key={i} className="flex items-start gap-3 py-3.5">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-aurora font-mono text-[0.7rem] font-semibold text-ink">
                {i + 1}
              </span>
              <p className="min-w-0 flex-1 text-sm leading-6 text-[#f4efe6]">{action}</p>
              <ArrowUpRight className="mt-1 size-4 shrink-0 text-[#7f918a]" aria-hidden="true" />
            </li>
          ))}
        </ol>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4 print:hidden">
        <p className="text-xs text-[#b9c4bf]">Fix these with documents, AI guidance and experts</p>
        <button
          type="button"
          onClick={onAction}
          className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-full bg-aurora px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-white"
        >
          Start fixing
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </BentoCard>
  );
}
