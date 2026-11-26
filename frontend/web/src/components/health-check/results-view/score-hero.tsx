import { BentoCard } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { PillSegments } from "@orion/ui/components/ui/pill-segments";
import { Progress } from "@orion/ui/components/ui/progress";
import type { HealthCheckResult } from "@orion/core/health-check/types";
import { riskTone, scoreBand, severityBreakdown, severityConfig } from "./results-model";

/** The score: giant serif numeral, band + risk chips, bar, summary and severity split. */
export function ScoreHero({ result, className }: { result: HealthCheckResult; className?: string }) {
  const { overallScore, riskLevel, issues, summary } = result;
  const band = scoreBand(overallScore);
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const highCount = issues.filter((i) => i.severity === "high").length;

  return (
    <BentoCard as="section" padding="lg" aria-labelledby="score-title" className={className}>
      {/* Soft brand haze behind the numeral */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-[radial-gradient(closest-side,rgb(15_118_110/0.10),transparent)] print:hidden"
      />
      <div className="relative">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-brand">
          Your legal health report
        </p>
        <h1 id="score-title" className="sr-only">
          Legal health score: {overallScore} out of 100
        </h1>

        <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-3">
          <p
            aria-hidden="true"
            className="font-display text-[clamp(6rem,22vw,10rem)] leading-[0.8] tracking-[-0.04em] text-ink tabular-nums"
          >
            {overallScore}
            <span className="ml-1 font-sans text-base font-medium tracking-normal text-mist">/100</span>
          </p>
          <div className="flex flex-wrap gap-1.5 pb-2">
            <Chip tone={riskTone(riskLevel)} className="text-xs">
              {severityConfig[riskLevel].label} risk
            </Chip>
            <Chip tone={band.tone}>{band.label}</Chip>
            <Chip>
              {issues.length} issue{issues.length !== 1 ? "s" : ""} found
            </Chip>
          </div>
        </div>

        <Progress
          value={overallScore}
          label="Legal health score"
          className="mt-6 h-2"
          indicatorClassName={band.barClass}
        />

        <p className="mt-6 max-w-2xl text-[0.95rem] leading-7 text-ink-soft">{summary}</p>

        {issues.length > 0 && (
          <div className="mt-6 border-t border-line pt-5">
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mist">
                Issues by severity
              </p>
              {criticalCount > 0 && (
                <span className="text-xs font-semibold text-ember-deep">{criticalCount} critical</span>
              )}
              {highCount > 0 && (
                <span className="text-xs font-semibold text-gold-deep">{highCount} high priority</span>
              )}
            </div>
            <PillSegments segments={severityBreakdown(issues)} ariaLabel="Issues by severity" />
          </div>
        )}
      </div>
    </BentoCard>
  );
}
