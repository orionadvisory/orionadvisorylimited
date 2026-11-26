import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ArrowButton } from "@orion/ui/components/ui/arrow-button";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { Progress } from "@orion/ui/components/ui/progress";
import { StatNumeral } from "@orion/ui/components/ui/stat-numeral";
import { formatShortDate, scoreBand, type weakestDomains } from "./overview-model";

interface HealthScoreCardProps {
  score: number | null;
  riskLevel: string | null;
  summary: string | null;
  completedAt: string | null;
  domains: ReturnType<typeof weakestDomains>;
  className?: string;
}

export function HealthScoreCard({
  score,
  riskLevel,
  summary,
  completedAt,
  domains,
  className,
}: HealthScoreCardProps) {
  const band = scoreBand(score);

  return (
    <BentoCard as="section" aria-labelledby="health-score-title" className={className}>
      <div className="flex h-full flex-col">
        <BentoCardHeader
          title={<span id="health-score-title">Legal health score</span>}
          description={completedAt ? `Last checked ${formatShortDate(completedAt)}` : "No health check yet"}
          icon={
            <IconChip tone="teal">
              <ShieldCheck />
            </IconChip>
          }
          action={
            <ArrowButton
              href="/health-check"
              label={score === null ? "Take the legal health check" : "Run a new legal health check"}
              linkComponent={Link}
            />
          }
        />

        {score === null ? (
          <div className="mt-8 flex flex-1 flex-col justify-end rounded-bento-sm bg-canvas p-5">
            <StatNumeral value="—" suffix="/100" size="xl" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-ink-soft">
              Take the ten-minute legal health check to get your score, a domain-by-domain
              breakdown and a prioritised checklist.
            </p>
            <Link
              href="/health-check"
              className="focus-ring mt-4 inline-flex w-fit items-center rounded-full bg-ink px-4 py-2 text-sm font-medium text-[#f4efe6] transition-colors hover:bg-brand"
            >
              Start health check
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-end gap-3">
              <StatNumeral value={score} suffix="/100" size="xl" />
              <div className="flex flex-wrap gap-1.5 pb-2">
                <Chip tone={band.tone}>{band.label}</Chip>
                {riskLevel && <Chip className="capitalize">{riskLevel} risk</Chip>}
              </div>
            </div>
            <Progress
              value={score}
              label="Legal health score"
              className="mt-5 h-2"
              indicatorClassName={band.barClass}
            />
            {summary && (
              <p className="mt-5 line-clamp-3 text-sm leading-6 text-ink-soft">{summary}</p>
            )}

            {domains.length > 0 && (
              <div className="mt-auto pt-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-mist">
                  Weakest domains
                </h3>
                <ul className="space-y-3">
                  {domains.map((d) => (
                    <li key={d.domain} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
                      <span className="truncate text-sm text-ink">{d.label}</span>
                      <span className="text-xs font-semibold tabular-nums text-ink-soft">
                        {d.score}
                        <span className="sr-only"> out of 100</span>
                      </span>
                      <Progress
                        value={d.score}
                        label={`${d.label} score`}
                        className="col-span-2 h-1.5"
                        indicatorClassName={scoreBand(d.score).barClass}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </BentoCard>
  );
}
