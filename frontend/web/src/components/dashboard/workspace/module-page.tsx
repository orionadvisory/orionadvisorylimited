import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleDashed, Clock3, type LucideIcon } from "lucide-react";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { Topbar } from "@/components/layout/topbar";
import { PageHero } from "@/components/dashboard/shared/page-hero";
import { getDashboardData } from "@/app/actions/dashboard";

export type ModuleItem = {
  title: string;
  detail: string;
  meta: string;
  status: "Needs confirmation" | "Upcoming" | "In progress" | "Ready for review" | "Missing information";
};

const statusTone = {
  "Needs confirmation": "gold",
  Upcoming: "teal",
  "In progress": "teal",
  "Ready for review": "teal",
  "Missing information": "ember",
} as const;

export async function ModulePage({
  title,
  accent,
  description,
  icon: Icon,
  stats,
  items,
  actionLabel,
  actionHref,
  note,
}: {
  title: string;
  accent: string;
  description: string;
  icon: LucideIcon;
  stats: { label: string; value: string; hint: string }[];
  items: ModuleItem[];
  /** Omit both to mark the module as not yet available (no dead call-to-action). */
  actionLabel?: string;
  actionHref?: string;
  note: string;
}) {
  const data = await getDashboardData();
  const startupName = data?.startup?.name || "Your workspace";
  const userName = data?.user.name || "User";
  const initials = userName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div>
      <Topbar title={title} subtitle={`Group view · ${startupName}`} userName={userName} userEmail={data?.user.email || ""} userInitials={initials} />
      <main className="mx-auto max-w-[1440px] space-y-8 px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <PageHero
          kicker={`Workspace · ${title}`}
          title={<>{title} <em>{accent}</em></>}
          description={description}
          actions={
            actionLabel && actionHref ? (
              <Link href={actionHref} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ink-raised">
                {actionLabel}<ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-full border border-line px-4 py-2 text-xs font-medium text-mist">Coming soon</span>
            )
          }
          aside={<div className="max-w-sm rounded-2xl border border-brand/10 bg-brand-soft px-4 py-3 text-xs leading-5 text-ink-soft">{note}</div>}
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={`${title} summary`}>
          {stats.map((stat, index) => (
            <BentoCard key={stat.label} variant={index === 0 ? "ink" : index === 3 ? "tinted-gold" : "surface"}>
              <p className={`text-xs font-medium ${index === 0 ? "text-[#b9c4bf]" : "text-mist"}`}>{stat.label}</p>
              <p className={`mt-4 font-display text-4xl ${index === 0 ? "text-[#f4efe6]" : "text-ink"}`}>{stat.value}</p>
              <p className={`mt-2 text-xs ${index === 0 ? "text-[#b9c4bf]" : "text-mist"}`}>{stat.hint}</p>
            </BentoCard>
          ))}
        </section>

        <BentoCard id="workspace-list" padding="none" className="overflow-hidden">
          <div className="p-5 sm:p-6">
            <BentoCardHeader title={`${title} workspace`} description={`${startupName} · Group scope`} icon={<IconChip tone="teal"><Icon /></IconChip>} />
          </div>
          <div className="divide-y divide-line border-t border-line">
            {items.map((item) => (
              <article key={item.title} className="grid gap-3 px-5 py-5 transition-colors hover:bg-canvas/60 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
                <div className="flex min-w-0 gap-3">
                  <span className="mt-0.5 text-brand">{item.status === "Ready for review" ? <CheckCircle2 className="h-5 w-5" /> : item.status === "Upcoming" ? <Clock3 className="h-5 w-5" /> : <CircleDashed className="h-5 w-5" />}</span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{item.detail}</p>
                    <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-mist">{item.meta}</p>
                  </div>
                </div>
                <Chip tone={statusTone[item.status]}>{item.status}</Chip>
              </article>
            ))}
          </div>
        </BentoCard>
      </main>
    </div>
  );
}
