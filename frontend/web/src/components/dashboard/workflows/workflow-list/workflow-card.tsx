import { ArrowRight, ChevronDown, GitBranch, Lock, Play } from "lucide-react";
import { BentoCard, IconChip } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { cn } from "@orion/ui/utils";
import type { Workflow } from "@/lib/data/workflows";
import { StepList, StepMeter } from "./step-list";

const pill =
  "focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors";

function StatusChip({ status }: { status: Workflow["status"] }) {
  if (status === "in_progress") return <Chip tone="teal">Active</Chip>;
  if (status === "pending") return <Chip>Not started</Chip>;
  return <Chip tone="gold">Locked</Chip>;
}

export function WorkflowCard({
  workflow,
  expanded,
  onToggle,
}: {
  workflow: Workflow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isLocked = workflow.status === "locked";
  const active = workflow.status === "in_progress";
  const done = workflow.steps.filter((s) => s.status === "completed").length;
  const stepsId = `${workflow.id}-steps`;

  return (
    <BentoCard
      as="article"
      variant={isLocked ? "tinted-gold" : "surface"}
      className={cn(
        "transition-shadow duration-300",
        !isLocked && "hover:shadow-bento-lift",
        active && "ring-1 ring-brand/15"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <IconChip tone={isLocked ? "white" : active ? "teal" : "canvas"}>
            {isLocked ? <Lock /> : active ? <GitBranch /> : <Play />}
          </IconChip>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-ink">{workflow.title}</h2>
              <StatusChip status={workflow.status} />
            </div>
            <p className="mt-1 text-sm leading-6 text-mist">{workflow.description}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 pl-[52px] sm:pl-0">
          {active && (
            <button type="button" className={cn(pill, "group bg-ink text-cloud hover:bg-brand")}>
              Continue
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
          )}
          {workflow.status === "pending" && (
            <button type="button" className={cn(pill, "border border-line bg-white text-ink hover:bg-canvas")}>
              <Play className="size-3" aria-hidden="true" /> Start
            </button>
          )}
          {isLocked && (
            <button type="button" disabled className={cn(pill, "cursor-not-allowed bg-white/60 text-mist")}>
              <Lock className="size-3" aria-hidden="true" /> Locked
            </button>
          )}
          {!isLocked && (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={expanded}
              aria-controls={stepsId}
              aria-label={expanded ? `Hide ${workflow.title} steps` : `Show ${workflow.title} steps`}
              className="focus-ring grid size-9 place-items-center rounded-full border border-line bg-white text-mist transition-colors hover:border-ink hover:bg-ink hover:text-white"
            >
              <ChevronDown
                className={cn("size-4 transition-transform duration-300", expanded && "rotate-180")}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>

      {!isLocked && workflow.steps.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-baseline justify-between gap-3 text-xs text-mist">
            <span>
              <span className="font-display text-2xl leading-none text-ink tabular-nums">{done}</span>
              <span className="tabular-nums">/{workflow.steps.length}</span> steps done
            </span>
            {active && <span className="tabular-nums">{workflow.progress}% complete</span>}
          </div>
          <StepMeter steps={workflow.steps} label={`${workflow.title} progress`} />
        </div>
      )}

      {expanded && !isLocked && workflow.steps.length > 0 && (
        <div id={stepsId} className="mt-5 border-t border-line pt-4">
          <StepList steps={workflow.steps} />
        </div>
      )}

      {isLocked && (
        <div className="mt-5 flex flex-col gap-3 rounded-bento-sm bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Unlock with Fund Package</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              Available from $2,499 · Includes SAFE drafting & fundraising support
            </p>
          </div>
          <button type="button" className={cn(pill, "w-fit shrink-0 bg-ink text-cloud hover:bg-brand")}>
            Upgrade
          </button>
        </div>
      )}
    </BentoCard>
  );
}
