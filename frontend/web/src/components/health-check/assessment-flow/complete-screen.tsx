import { Check } from "lucide-react";
import { BentoCard, IconChip } from "@orion/ui/components/ui/bento-card";
import { StatNumeral } from "@orion/ui/components/ui/stat-numeral";
import { LogoChip } from "../shared/flow-chrome";
import { PillArrow, primaryPillClass } from "../shared/pill";

/** Shown once the answers are scored and the report is in localStorage. */
export function CompleteScreen({
  answeredCount,
  visibleTotal,
  totalSections,
}: {
  answeredCount: number;
  visibleTotal: number;
  totalSections: number;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-orion-canvas px-4 py-10">
      <BentoCard as="section" padding="lg" aria-labelledby="complete-title" className="w-full max-w-lg">
        <div className="flex items-center justify-between gap-3">
          <LogoChip />
          <IconChip tone="teal">
            <Check strokeWidth={2.5} />
          </IconChip>
        </div>

        <p className="mt-8 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-brand">
          Assessment complete
        </p>
        <h1
          id="complete-title"
          className="mt-2 font-display text-4xl leading-[1.02] tracking-tight text-balance text-ink sm:text-5xl"
        >
          Your legal health report is ready.
        </h1>
        <p className="mt-4 text-sm leading-6 text-mist">
          Your legal health check has been submitted. You answered {answeredCount} of{" "}
          {visibleTotal} questions across {totalSections} sections.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-bento-sm bg-canvas p-4">
            <StatNumeral value={answeredCount} suffix={`/${visibleTotal}`} label="Questions answered" />
          </div>
          <div className="rounded-bento-sm bg-canvas p-4">
            <StatNumeral value={totalSections} label="Sections covered" />
          </div>
        </div>

        <a href="/health-check/results" className={`${primaryPillClass} mt-8 w-full`}>
          <span>View results</span>
          <PillArrow />
        </a>
      </BentoCard>
    </main>
  );
}
