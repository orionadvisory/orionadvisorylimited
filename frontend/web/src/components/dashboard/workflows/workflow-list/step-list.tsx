import { Check } from "lucide-react";
import { Chip } from "@orion/ui/components/ui/chip";
import { cn } from "@orion/ui/utils";
import type { WorkflowStep } from "@/lib/data/workflows";

/** Segmented progress meter — one pill per step. */
export function StepMeter({ steps, label }: { steps: WorkflowStep[]; label: string }) {
  const done = steps.filter((s) => s.status === "completed").length;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={done}
      aria-valuemin={0}
      aria-valuemax={steps.length}
      className="flex gap-1"
    >
      {steps.map((step) => (
        <span
          key={step.id}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors duration-500",
            step.status === "completed" && "bg-brand",
            step.status === "in_progress" && "bg-brand/35",
            step.status === "pending" && "bg-canvas-deep"
          )}
        />
      ))}
    </div>
  );
}

/** Expanded checklist of a workflow's steps; the current step is highlighted. */
export function StepList({ steps }: { steps: WorkflowStep[] }) {
  return (
    <ol className="space-y-1">
      {steps.map((step, i) => {
        const current = step.status === "in_progress";
        const done = step.status === "completed";
        return (
          <li
            key={step.id}
            aria-current={current ? "step" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-3 transition-colors",
              current && "bg-brand-soft"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums",
                done && "bg-brand text-white",
                current && "bg-white text-brand ring-2 ring-brand",
                step.status === "pending" && "border border-line-strong text-mist"
              )}
            >
              {done ? (
                <Check className="size-3.5" strokeWidth={3} />
              ) : current ? (
                <span className="size-2 animate-pulse rounded-full bg-brand motion-reduce:animate-none" />
              ) : (
                i + 1
              )}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 text-sm",
                done && "text-mist line-through decoration-mist/50",
                current && "font-medium text-ink",
                step.status === "pending" && "text-ink-soft"
              )}
            >
              {step.title}
              {done && <span className="sr-only"> (completed)</span>}
            </span>
            {current && <Chip tone="teal" className="bg-white">In progress</Chip>}
          </li>
        );
      })}
    </ol>
  );
}
