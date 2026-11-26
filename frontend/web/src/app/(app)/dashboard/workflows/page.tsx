import { StatNumeral } from "@orion/ui/components/ui/stat-numeral";
import { Topbar } from "@/components/layout/topbar";
import { PageHero } from "@/components/dashboard/shared/page-hero";
import WorkflowList from "@/components/dashboard/workflows/workflow-list";
import { PLACEHOLDER_WORKFLOWS } from "@/lib/data/workflows";

export default function WorkflowsPage() {
  const inProgress = PLACEHOLDER_WORKFLOWS.filter((w) => w.status === "in_progress").length;
  const available = PLACEHOLDER_WORKFLOWS.filter((w) => w.status !== "locked").length;

  return (
    <div>
      <Topbar title="Workflows" subtitle="Your legal journey, step by step" />
      <div className="mx-auto max-w-[1440px] space-y-8 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <PageHero
          kicker="Workspace · Workflows"
          title={
            <>
              Your legal journey, <em>step by step</em>
            </>
          }
          description="Guided flows that take you from incorporation to your first raise — Orion drafts, you decide."
          aside={
            <dl className="flex gap-8">
              <div>
                <dt className="sr-only">Workflows in progress</dt>
                <dd>
                  <StatNumeral value={inProgress} label="In progress" size="lg" />
                </dd>
              </div>
              <div>
                <dt className="sr-only">Workflows available</dt>
                <dd>
                  <StatNumeral value={available} label="Available" size="lg" />
                </dd>
              </div>
            </dl>
          }
        />
        <WorkflowList />
      </div>
    </div>
  );
}
