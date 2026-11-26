import { BentoCard } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { Progress } from "@orion/ui/components/ui/progress";
import { domainLabel, scoreBand } from "./results-model";

/** Domain scores as small bento tiles, weakest first. */
export function DomainGrid({ domains }: { domains: [string, { score: number; issues: number }][] }) {
  if (domains.length === 0) return null;

  return (
    <section aria-labelledby="domains-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 id="domains-title" className="font-display text-3xl leading-none tracking-tight text-ink sm:text-4xl">
          Score by area
        </h2>
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-mist">Weakest first</p>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {domains.map(([domain, data]) => {
          const band = scoreBand(data.score);
          const label = domainLabel(domain);
          return (
            <BentoCard as="li" key={domain} padding="sm" className="flex flex-col break-inside-avoid">
              <p className="min-h-10 text-sm font-medium leading-5 text-ink">{label}</p>
              <div className="mt-3 flex items-end justify-between gap-2">
                <p className="font-display text-4xl leading-none tracking-tight text-ink tabular-nums">
                  {data.score}
                  <span className="ml-0.5 font-sans text-xs font-medium tracking-normal text-mist">%</span>
                </p>
                {data.issues > 0 ? (
                  <Chip tone={band.tone}>
                    {data.issues} issue{data.issues !== 1 ? "s" : ""}
                  </Chip>
                ) : (
                  <Chip tone="teal">Clear</Chip>
                )}
              </div>
              <Progress
                value={data.score}
                label={`${label} score`}
                className="mt-3 h-1.5"
                indicatorClassName={band.barClass}
              />
            </BentoCard>
          );
        })}
      </ul>
    </section>
  );
}
