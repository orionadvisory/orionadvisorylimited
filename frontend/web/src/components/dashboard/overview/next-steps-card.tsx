import Link from "next/link";
import { Check, ListChecks, ShieldAlert, Sparkles } from "lucide-react";
import { ArrowButton } from "@orion/ui/components/ui/arrow-button";
import { BentoCard, IconChip } from "@orion/ui/components/ui/bento-card";
import { cn } from "@orion/ui/utils";
import type { NextStepsModel } from "./overview-model";

interface NextStepsCardProps {
  model: NextStepsModel;
  hasHealthCheck: boolean;
  className?: string;
}

/** The page's single dark anchor: "Next steps n/m" checklist. */
export function NextStepsCard({ model, hasHealthCheck, className }: NextStepsCardProps) {
  const { visible, done, total, hiddenCount } = model;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <BentoCard as="section" variant="ink" aria-labelledby="next-steps-title" className={className}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <IconChip tone="on-ink">
            <ListChecks />
          </IconChip>
          <div>
            <h2 id="next-steps-title" className="text-base font-semibold tracking-tight text-[#f4efe6]">
              Next steps
            </h2>
            <p className="text-xs text-[#b9c4bf]">
              {total > 0 ? `${pct}% complete` : "Your legal checklist"}
            </p>
          </div>
        </div>
        {total > 0 && (
          <p className="font-display text-5xl leading-none tracking-tight text-[#f4efe6] tabular-nums">
            {done}
            <span className="text-[#7f918a]">/{total}</span>
            <span className="sr-only"> steps complete</span>
          </p>
        )}
      </div>

      {total > 0 && (
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div className="h-full rounded-full bg-aurora" style={{ width: `${pct}%` }} />
        </div>
      )}

      {visible.length === 0 ? (
        <div className="mt-6 rounded-bento-sm bg-white/[0.05] p-5">
          <p className="text-sm font-medium text-[#f4efe6]">
            {hasHealthCheck ? "You're all caught up." : "No checklist yet."}
          </p>
          <p className="mt-1 text-sm leading-6 text-[#b9c4bf]">
            {hasHealthCheck
              ? "New actions will appear here after your next health check."
              : "Take the legal health check and we'll turn the results into a step-by-step plan."}
          </p>
          {!hasHealthCheck && (
            <Link
              href="/health-check"
              className="focus-ring mt-4 inline-flex items-center rounded-full bg-aurora px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-white focus-visible:outline-aurora"
            >
              Start health check
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-white/[0.06]">
          {visible.map((step) => (
            <li key={step.id} className="flex items-center gap-3 py-3">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  step.done ? "bg-white/[0.06] text-[#7f918a]" : "bg-white/[0.1] text-[#f4efe6]"
                )}
                aria-hidden="true"
              >
                {step.kind === "action" ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "line-clamp-2 text-sm",
                    step.done ? "text-[#8fa19a] line-through decoration-[#8fa19a]/60" : "text-[#f4efe6]"
                  )}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#8fa19a]">{step.meta}</p>
              </div>
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  step.done ? "bg-aurora text-ink" : "border border-white/20"
                )}
              >
                {step.done && <Check className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={3} />}
                <span className="sr-only">{step.done ? "Completed" : "To do"}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {visible.length > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
          <p className="text-xs text-[#b9c4bf]">
            {hiddenCount > 0 ? `+${hiddenCount} more in your plan` : "Work through these with Orion AI"}
          </p>
          <ArrowButton
            href="/dashboard/ai"
            label="Work through next steps with the AI assistant"
            tone="brand"
            linkComponent={Link}
          />
        </div>
      )}
    </BentoCard>
  );
}
