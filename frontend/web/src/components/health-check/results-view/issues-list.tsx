import { Chip } from "@orion/ui/components/ui/chip";
import type { IssueFinding } from "@orion/core/health-check/types";
import { IssueCard } from "./issue-card";
import { groupIssues, severityConfig } from "./results-model";

/** Issues grouped by severity, most severe first. */
export function IssuesList({ issues, onAction }: { issues: IssueFinding[]; onAction: () => void }) {
  if (issues.length === 0) return null;

  return (
    <section aria-labelledby="issues-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 id="issues-title" className="font-display text-3xl leading-none tracking-tight text-ink sm:text-4xl">
          Issues &amp; recommendations
        </h2>
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-mist">
          {issues.length} finding{issues.length !== 1 ? "s" : ""} · tap to see the fix
        </p>
      </div>

      <div className="space-y-8">
        {groupIssues(issues).map((group) => {
          const cfg = severityConfig[group.severity];
          return (
            <div key={group.severity}>
              <h3 className="mb-3 flex items-center gap-3">
                <Chip tone={cfg.tone} className={cfg.className}>
                  {cfg.label}
                </Chip>
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mist tabular-nums">
                  {group.issues.length} issue{group.issues.length !== 1 ? "s" : ""}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-line" />
              </h3>
              <div className="grid items-start gap-3 lg:grid-cols-2">
                {group.issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} onAction={onAction} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
