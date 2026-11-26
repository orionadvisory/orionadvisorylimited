import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Badge } from "@orion/ui/components/ui/badge";
import { ArrowButton } from "@orion/ui/components/ui/arrow-button";
import { BentoCard, BentoCardHeader } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { PillSegments } from "@orion/ui/components/ui/pill-segments";
import { StatCard } from "@/components/admin/stat-card";
import { tableClasses as tc } from "@/components/admin/table-styles";
import { requireActiveAdmin } from "@orion/session/admin";
import { getTemplateStatusCounts, getRecentAdminAuditEvents, getAdminUserStats } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

function formatDate(value: Date | string | null) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function formatAction(action: string) {
  return action
    .replace(/^admin_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AdminDashboardPage() {
  const admin = await requireActiveAdmin();

  const [userStats, templateCounts, recentAudit] = await Promise.all([
    getAdminUserStats(),
    getTemplateStatusCounts(),
    getRecentAdminAuditEvents(10),
  ]);

  const displayName = admin.name || admin.email;
  const firstName = (admin.name || "").split(" ")[0] || displayName;
  const templateTotal = templateCounts.published + templateCounts.draft + templateCounts.archived;

  return (
    <div>
      <Topbar title="Admin Dashboard" subtitle={`Signed in as ${displayName}`} />
      <div className="mx-auto max-w-[1440px] space-y-8 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <section aria-labelledby="admin-greeting" className="grid gap-6 xl:grid-cols-12 xl:items-end">
          <div className="min-w-0 xl:col-span-7">
            <h1
              id="admin-greeting"
              className="font-display text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
            >
              Welcome back, {firstName}
            </h1>
            <p className="mt-3 text-sm text-mist">Platform access, assessments and recent admin activity.</p>
          </div>
          <div className="max-w-xl xl:col-span-5">
            {userStats.total > 0 ? (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-mist">
                  Account status
                </p>
                <PillSegments
                  ariaLabel="Users by account status"
                  segments={[
                    { label: "Active", value: userStats.active, tone: "teal" },
                    { label: "Suspended", value: userStats.suspended, tone: "ember" },
                  ]}
                />
              </>
            ) : (
              <Chip>No users yet</Chip>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-8">
            <StatCard
              label="Total users"
              value={userStats.total}
              hint={`${userStats.active} active · ${userStats.suspended} suspended`}
              href="/admin/users"
              linkLabel="Manage users"
            />
            <StatCard
              variant="tinted-teal"
              label="Admins"
              value={userStats.admins}
              hint="With console access"
              href="/admin/users?q=admin"
              linkLabel="View admin users"
            />
            <StatCard
              variant="tinted-gold"
              label="Published templates"
              value={templateCounts.published}
              hint="Live for founders"
              href="/admin/assessments"
              linkLabel="View assessment templates"
            />
            <StatCard
              variant="tinted-ember"
              label="Draft templates"
              value={templateCounts.draft}
              hint={templateCounts.draft === 0 ? "Nothing pending" : "Awaiting publish"}
              href="/admin/assessments?q=draft"
              linkLabel="View draft templates"
            />
          </div>

          <BentoCard as="section" variant="ink" aria-labelledby="lifecycle-title" className="flex flex-col xl:col-span-4">
            <BentoCardHeader
              onInk
              title={<span id="lifecycle-title">Template lifecycle</span>}
              description="Published share of all assessment templates"
              action={
                <ArrowButton
                  href="/admin/assessments"
                  label="Manage assessment templates"
                  tone="brand"
                  linkComponent={Link}
                />
              }
            />
            <p className="mt-6 font-display text-6xl leading-none tracking-tight text-[#f4efe6] tabular-nums">
              {templateCounts.published}
              <span className="text-[#7f918a]">/{templateTotal}</span>
              <span className="sr-only"> templates published</span>
            </p>
            <ul className="mt-auto space-y-2 pt-6 text-sm">
              {[
                { label: "Published", value: templateCounts.published, dot: "bg-aurora" },
                { label: "Draft", value: templateCounts.draft, dot: "bg-gold" },
                { label: "Archived", value: templateCounts.archived, dot: "bg-[#7f918a]" },
              ].map((row) => (
                <li key={row.label} className="flex items-center justify-between rounded-full bg-white/[0.05] px-4 py-2.5">
                  <span className="flex items-center gap-2 text-[#d6ddd9]">
                    <span className={`h-2 w-2 rounded-full ${row.dot}`} aria-hidden="true" />
                    {row.label}
                  </span>
                  <span className="font-semibold tabular-nums text-[#f4efe6]">{row.value}</span>
                </li>
              ))}
            </ul>
          </BentoCard>

          <BentoCard as="section" aria-labelledby="audit-title" className="xl:col-span-12">
            <BentoCardHeader
              title={<span id="audit-title">Recent admin activity</span>}
              description="Last 10 admin actions"
            />
            <div className="mt-4">
              {recentAudit.length === 0 ? (
                <p className="rounded-bento-sm bg-canvas p-5 text-sm text-mist">No admin activity yet.</p>
              ) : (
                <div className={tc.wrap}>
                  <table className={tc.table}>
                    <thead className={tc.thead}>
                      <tr>
                        <th className={tc.th}>Action</th>
                        <th className={tc.th}>Entity</th>
                        <th className={tc.th}>Actor</th>
                        <th className={tc.th}>When</th>
                      </tr>
                    </thead>
                    <tbody className={tc.tbody}>
                      {recentAudit.map((event) => (
                        <tr key={event.id}>
                          <td className={`${tc.td} font-medium text-ink`}>{formatAction(event.action)}</td>
                          <td className={tc.td}>
                            <Badge variant="outline">{event.entityType}</Badge>
                          </td>
                          <td className={`${tc.td} text-ink-soft`}>{event.actorEmail || "System"}</td>
                          <td className={`${tc.td} text-xs text-mist`}>{formatDate(event.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
