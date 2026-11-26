import Link from "next/link";
import {
  getTemplateStatusCounts,
  listAssessmentTemplates,
} from "@/app/actions/admin";
import { Topbar } from "@/components/layout/topbar";
import { BentoCard } from "@orion/ui/components/ui/bento-card";
import { StatCard } from "@/components/admin/stat-card";
import { searchInputClass, tableClasses as tc } from "@/components/admin/table-styles";
import { Badge } from "@orion/ui/components/ui/badge";
import { Button } from "@orion/ui/components/ui/button";
import { Pagination } from "@/components/admin/pagination";
import { TemplateListActions } from "@/components/admin/template-list-actions";
import { TemplateRowActions } from "@/components/admin/template-row-actions";
import { requireActiveAdmin } from "@orion/session/admin";

type AssessmentsPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};


function formatDate(value: Date | string | null) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

function statusVariant(status: string) {
  if (status === "published") return "success" as const;
  if (status === "archived") return "warning" as const;
  return "info" as const;
}

export default async function AdminAssessmentsPage({
  searchParams,
}: AssessmentsPageProps) {
  await requireActiveAdmin();

  const { q, page: pageStr } = await searchParams;
  const search = q?.trim() ?? "";
  const page = Math.max(1, Number(pageStr) || 1);

  const [{ items: templates, total, totalPages }, statusCounts] =
    await Promise.all([
      listAssessmentTemplates(search, page),
      getTemplateStatusCounts(),
    ]);

  return (
    <div>
      <Topbar
        title="Assessment Templates"
        subtitle="Manage reusable assessment templates and publication status"
      />
      <div className="mx-auto max-w-[1440px] space-y-6 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Total templates" value={total} hint="Matching search" />
          <StatCard variant="tinted-ember" label="Draft" value={statusCounts.draft} hint="Not yet live" />
          <StatCard variant="tinted-teal" label="Published" value={statusCounts.published} hint="Live for founders" />
          <StatCard variant="tinted-gold" label="Archived" value={statusCounts.archived} hint="Retired" />
        </div>

        <TemplateListActions />

        <BentoCard as="section">
          <div className="pb-2">
            <h2 className="text-base font-semibold tracking-tight text-ink">Templates</h2>
            <p className="mt-0.5 text-xs text-mist">Search and manage template lifecycle</p>
          </div>
          <div className="space-y-4 pt-2">
            <form method="get" className="flex flex-col gap-3 sm:flex-row">
              <input
                name="q"
                defaultValue={search}
                placeholder="Search templates"
                className={searchInputClass}
              />
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>

            <div className={tc.wrap}>
              <table className={tc.table}>
                <thead className={tc.thead}>
                  <tr>
                    <th className={tc.th}>Template</th>
                    <th className={tc.th}>Status</th>
                    <th className={tc.th}>Version</th>
                    <th className={tc.th}>Content</th>
                    <th className={tc.th}>Updated</th>
                    <th className={tc.th}>Actions</th>
                  </tr>
                </thead>
                <tbody className={tc.tbody}>
                  {templates.map((t) => (
                    <tr key={t.id}>
                      <td className={tc.td}>
                        <p className="font-medium text-ink">{t.name}</p>
                      </td>
                      <td className={tc.td}>
                        <Badge variant={statusVariant(t.status)}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className={`${tc.td} text-ink-soft`}>
                        v{t.version}
                      </td>
                      <td className={`${tc.td} text-xs text-ink-soft`}>
                        <p>{t.sectionCount} sections</p>
                        <p>{t.questionCount} questions</p>
                        <p>{t.ruleCount} rules</p>
                      </td>
                      <td className={`${tc.td} text-ink-soft`}>
                        {formatDate(t.updatedAt || t.createdAt)}
                      </td>
                      <td className={tc.td}>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/admin/assessments/${t.id}`}>
                            <Button size="sm" variant="outline" type="button">
                              Open
                            </Button>
                          </Link>

                          <TemplateRowActions
                            templateId={t.id}
                            status={t.status}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              basePath="/admin/assessments"
              searchParams={{ q: search || undefined }}
            />
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
