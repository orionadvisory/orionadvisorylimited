import { Building2, MapPin } from "lucide-react";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { getDashboardData } from "@/app/actions/dashboard";
import { getEntities } from "@/app/actions/entities";
import { getWorkspaceAccess } from "@/app/actions/workspace";
import { Topbar } from "@/components/layout/topbar";
import { PageHero } from "@/components/dashboard/shared/page-hero";
import { ArchiveEntityButton, EntityCreateForm } from "@/components/dashboard/entities/entity-create-form";

export default async function EntitiesPage() {
  const [data, access, entities] = await Promise.all([getDashboardData(), getWorkspaceAccess(), getEntities()]);
  const canManage = access?.permissions.includes("entity:manage") ?? false;
  const workspace = data?.startup?.name || "Your workspace";
  return <div>
    <Topbar title="My Entities" subtitle={`Group view · ${workspace}`} userName={data?.user.name} userEmail={data?.user.email} startupName={workspace} />
    <main className="mx-auto max-w-[1440px] space-y-8 px-4 pb-12 pt-5 sm:px-6 lg:px-8">
      <PageHero kicker="Workspace · My Entities" title={<>Your companies, <em>one view</em></>} description="Manage every company, fund and adviser in one workspace. ORION collects more details only when an obligation needs them." aside={<div className="rounded-2xl border border-brand/10 bg-brand-soft px-4 py-3 text-xs leading-5 text-ink-soft">Legal form, tax treatment and regulated activity remain separate. ORION never infers one from another.</div>} />
      {canManage && <EntityCreateForm />}
      <BentoCard padding="none" className="overflow-hidden">
        <div className="p-5 sm:p-6"><BentoCardHeader title="Active entities" description={`${entities.length} in ${workspace}`} icon={<IconChip tone="teal"><Building2 /></IconChip>} /></div>
        {entities.length === 0 ? <div className="border-t border-line px-6 py-12 text-center"><p className="font-display text-2xl text-ink">Build your group view</p><p className="mx-auto mt-2 max-w-md text-sm text-mist">Add the first legal entity. Your existing startup profile remains the workspace and is not duplicated.</p></div> :
          <div className="divide-y divide-line border-t border-line">{entities.map((entity) => <article key={entity.id} className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-ink">{entity.name}</h2><Chip tone="teal">Active</Chip>{entity.role && <Chip>{entity.role.replaceAll("_", " ")}</Chip>}</div><p className="mt-1 text-sm text-ink-soft">{entity.legalType}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-mist"><MapPin className="h-3.5 w-3.5" />{[entity.state, entity.jurisdiction].filter(Boolean).join(", ")}{entity.registrationNumber ? ` · ${entity.registrationNumber}` : " · Registration pending confirmation"}</p></div>{canManage && <ArchiveEntityButton id={entity.id} name={entity.name} />}</article>)}</div>}
      </BentoCard>
    </main>
  </div>;
}
