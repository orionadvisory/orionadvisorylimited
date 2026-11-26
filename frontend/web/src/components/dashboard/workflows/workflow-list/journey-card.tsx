import { Compass } from "lucide-react";
import { BentoCard, IconChip } from "@orion/ui/components/ui/bento-card";
import type { Workflow } from "@/lib/data/workflows";

/** The page's single dark anchor: overall journey progress + the step that's up next. */
export function JourneyCard({ workflows, className }: { workflows: Workflow[]; className?: string }) {
  const steps = workflows.flatMap((w) => w.steps);
  const done = steps.filter((s) => s.status === "completed").length;
  const total = steps.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const activeWf = workflows.find((w) => w.status === "in_progress");
  const upNext = activeWf?.steps.find((s) => s.status === "in_progress");
  const available = workflows.filter((w) => w.status !== "locked").length;
  const inProgress = workflows.filter((w) => w.status === "in_progress").length;

  return (
    <BentoCard as="aside" variant="ink" aria-labelledby="journey-title" className={className}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <IconChip tone="on-ink">
            <Compass />
          </IconChip>
          <div>
            <h2 id="journey-title" className="text-base font-semibold tracking-tight text-[#f4efe6]">
              Your journey
            </h2>
            <p className="text-xs text-[#b9c4bf]">{pct}% of all steps complete</p>
          </div>
        </div>
        <p className="font-display text-5xl leading-none tracking-tight text-[#f4efe6] tabular-nums">
          {done}
          <span className="text-[#7f918a]">/{total}</span>
          <span className="sr-only"> steps complete</span>
        </p>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div className="h-full rounded-full bg-aurora transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>

      {upNext && activeWf && (
        <div className="mt-6 rounded-bento-sm bg-white/[0.05] p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-aurora">Up next</p>
          <p className="mt-2 font-display text-2xl leading-tight text-[#f4efe6]">{upNext.title}</p>
          <p className="mt-1 text-xs text-[#b9c4bf]">{activeWf.title}</p>
        </div>
      )}

      <p className="mt-5 border-t border-white/[0.06] pt-4 text-xs text-[#b9c4bf]">
        {available} workflows available · {inProgress} in progress
      </p>
    </BentoCard>
  );
}
