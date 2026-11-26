import { CalendarDays } from "lucide-react";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";
import { getDashboardData } from "@/app/actions/dashboard";
import { getEntities } from "@/app/actions/entities";
import { getObligations } from "@/app/actions/compliance";
import { getWorkspaceAccess } from "@/app/actions/workspace";
import { Topbar } from "@/components/layout/topbar";
import { PageHero } from "@/components/dashboard/shared/page-hero";
import { ObligationForm } from "@/components/dashboard/compliance/obligation-form";
import { ObligationRow } from "@/components/dashboard/compliance/obligation-row";
import { StatCard } from "@/components/dashboard/compliance/stat-card";

export default async function CompliancePage() {
  const [data, access, entities, obligations] = await Promise.all([
    getDashboardData(),
    getWorkspaceAccess(),
    getEntities(),
    getObligations(),
  ]);
  const canManage = access?.permissions.includes("obligation:manage") ?? false;
  const canProgress = access?.permissions.includes("obligation:progress") ?? false;

  const open = obligations.filter((o) => o.status !== "completed" && o.status !== "not_applicable");
  const confirmed = open.filter((o) => o.dateStatus === "confirmed");
  const pending = open.filter((o) => o.dateStatus === "pending_confirmation");
  const overdue = open.filter((o) => o.status === "overdue");
  const workspace = access?.workspaceName || data?.startup?.name || "Your workspace";

  return (
    <div>
      <Topbar title="Compliance" subtitle={`Group calendar · ${workspace}`} userName={data?.user.name} userEmail={data?.user.email} />
      <main className="mx-auto max-w-[1440px] space-y-8 px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <PageHero
          kicker="Workspace · Compliance"
          title={<>Know what applies. <em>Act next.</em></>}
          description="Track obligations by entity, confirm dates only when the supporting facts are known, and keep preparation separate from submission and acceptance."
          aside={
            <div className="rounded-2xl border border-gold/15 bg-gold-soft px-4 py-3 text-xs leading-5 text-ink-soft">
              Unverified dates stay marked “Pending confirmation.” ORION does not invent statutory deadlines.
            </div>
          }
        />

        {canManage && <ObligationForm entities={entities.map(({ id, name }) => ({ id, name }))} />}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Open obligations" value={open.length} hint="Across active entities" variant="ink" />
          <StatCard label="Confirmed dates" value={confirmed.length} hint="Ready for calendar views" />
          <StatCard label="Needs confirmation" value={pending.length} hint="Missing date inputs" variant="tinted-gold" />
          <StatCard label="Overdue" value={overdue.length} hint={overdue.length ? "Requires attention" : "Nothing verified overdue"} />
        </section>

        <BentoCard padding="none" className="overflow-hidden">
          <div className="p-5 sm:p-6">
            <BentoCardHeader title="Compliance calendar" description="Chronological group view" icon={<IconChip tone="teal"><CalendarDays /></IconChip>} />
          </div>
          {obligations.length === 0 ? (
            <div className="border-t border-line px-6 py-12 text-center">
              <CalendarDays className="mx-auto h-7 w-7 text-brand" />
              <p className="mt-4 font-display text-2xl text-ink">Your calendar starts here</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-mist">
                {canManage
                  ? "Add a user-managed deadline now. Verified rule-generated obligations will join the same view."
                  : "No obligations are visible to you yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-line border-t border-line">
              {obligations.map((item) => <ObligationRow key={item.id} item={item} canProgress={canProgress} />)}
            </div>
          )}
        </BentoCard>
      </main>
    </div>
  );
}
