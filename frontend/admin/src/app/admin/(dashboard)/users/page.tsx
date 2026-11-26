import {
  listAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "@/app/actions/admin";
import { Topbar } from "@/components/layout/topbar";
import { BentoCard } from "@orion/ui/components/ui/bento-card";
import { StatCard } from "@/components/admin/stat-card";
import { searchInputClass, tableClasses as tc } from "@/components/admin/table-styles";
import { Badge } from "@orion/ui/components/ui/badge";
import { Button } from "@orion/ui/components/ui/button";
import { Pagination } from "@/components/admin/pagination";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { requireActiveAdmin } from "@orion/session/admin";

type UsersPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};


function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  await requireActiveAdmin();

  const { q, page: pageStr } = await searchParams;
  const search = q?.trim() ?? "";
  const page = Math.max(1, Number(pageStr) || 1);

  const { items: users, total, totalPages } = await listAdminUsers(search, page);

  const activeCount = users.filter((u) => u.status === "active").length;
  const suspendedCount = users.filter((u) => u.status === "suspended").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div>
      <Topbar title="User Management" subtitle="Review and manage platform access" />
      <div className="mx-auto max-w-[1440px] space-y-6 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Total users" value={total} hint="All accounts" />
          <StatCard variant="tinted-teal" label="Active" value={activeCount} hint="On this page" />
          <StatCard variant="tinted-ember" label="Suspended" value={suspendedCount} hint="On this page" />
          <StatCard variant="tinted-gold" label="Admins" value={adminCount} hint="On this page" />
        </div>

        <BentoCard as="section">
          <div className="pb-2">
            <h2 className="text-base font-semibold tracking-tight text-ink">Directory</h2>
            <p className="mt-0.5 text-xs text-mist">Search by name, email, role, or status</p>
          </div>
          <div className="space-y-4 pt-2">
            <form method="get" className="flex flex-col gap-3 sm:flex-row">
              <input
                name="q"
                defaultValue={search}
                placeholder="Search users"
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
                    <th className={tc.th}>User</th>
                    <th className={tc.th}>Role</th>
                    <th className={tc.th}>Status</th>
                    <th className={tc.th}>Created</th>
                    <th className={tc.th}>Actions</th>
                  </tr>
                </thead>
                <tbody className={tc.tbody}>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className={tc.td}>
                        <p className="font-medium text-ink">
                          {user.name || "Unnamed user"}
                        </p>
                        <p className="text-xs text-mist">{user.email}</p>
                      </td>
                      <td className={tc.td}>
                        <Badge variant={user.role === "admin" ? "info" : "default"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className={tc.td}>
                        <Badge variant={user.status === "active" ? "success" : "warning"}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className={`${tc.td} text-ink-soft`}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td className={tc.td}>
                        <UserRowActions
                          userId={user.id}
                          currentRole={user.role}
                          currentStatus={user.status}
                          updateRoleAction={updateAdminUserRole}
                          updateStatusAction={updateAdminUserStatus}
                        />
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
              basePath="/admin/users"
              searchParams={{ q: search || undefined }}
            />
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
