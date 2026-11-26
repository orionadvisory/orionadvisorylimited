import { Building2, MapPin, TrendingUp } from "lucide-react";
import { Chip } from "@orion/ui/components/ui/chip";
import { PillSegments, type PillSegment } from "@orion/ui/components/ui/pill-segments";
import { StatNumeral } from "@orion/ui/components/ui/stat-numeral";
import { stageLabels } from "./overview-model";

interface OverviewHeaderProps {
  firstName: string;
  startupName: string | null;
  stage: string | null;
  jurisdiction: string | null;
  breakdown: PillSegment[];
  hasHealthCheck: boolean;
  resolvedCount: number;
  domainsAssessed: number;
}

/** Greeting, company chips, open-issue severity pills and headline numerals. */
export function OverviewHeader({
  firstName,
  startupName,
  stage,
  jurisdiction,
  breakdown,
  hasHealthCheck,
  resolvedCount,
  domainsAssessed,
}: OverviewHeaderProps) {
  const openTotal = breakdown.reduce((sum, s) => sum + s.value, 0);

  return (
    <section aria-labelledby="overview-greeting" className="grid gap-6 xl:grid-cols-12 xl:items-end">
      <div className="min-w-0 xl:col-span-7">
        <h1
          id="overview-greeting"
          className="font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
        >
          Welcome back, {firstName}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {startupName && <Chip icon={<Building2 aria-hidden="true" />}>{startupName}</Chip>}
          {stage && (
            <Chip icon={<TrendingUp aria-hidden="true" />}>{stageLabels[stage] || stage}</Chip>
          )}
          {jurisdiction && <Chip icon={<MapPin aria-hidden="true" />}>{jurisdiction}</Chip>}
        </div>

        {(openTotal > 0 || hasHealthCheck) && (
        <div className="mt-6 max-w-2xl">
          {openTotal > 0 ? (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-mist">
                Open issues by severity
              </p>
              <PillSegments segments={breakdown} ariaLabel="Open issues by severity" />
            </>
          ) : hasHealthCheck ? (
            <Chip tone="teal">No open issues — you&apos;re all clear</Chip>
          ) : null}
        </div>
        )}
      </div>

      {hasHealthCheck && (
        <dl className="flex gap-8 xl:col-span-5 xl:justify-end">
          <div>
            <dt className="sr-only">Resolved issues</dt>
            <dd>
              <StatNumeral value={resolvedCount} label="Resolved" size="lg" />
            </dd>
          </div>
          <div>
            <dt className="sr-only">Domains assessed</dt>
            <dd>
              <StatNumeral value={domainsAssessed} label="Domains assessed" size="lg" />
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}
