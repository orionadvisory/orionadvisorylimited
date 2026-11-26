import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { audit, getDb, iso, offsetFor, PAGE_SIZE, pageOf, schema } from "./shared";

type Role = "member" | "admin";
type Status = "active" | "suspended";

export const usersRepo = {
  async userStats() {
    const db = await getDb();
    const { users } = await schema();
    const rows = await db
      .select({ role: users.role, status: users.status, count: sql<number>`count(*)::int` })
      .from(users)
      .groupBy(users.role, users.status);
    const stats = { total: 0, active: 0, suspended: 0, admins: 0, members: 0 };
    for (const r of rows) {
      stats.total += r.count;
      if (r.status === "active") stats.active += r.count;
      if (r.status === "suspended") stats.suspended += r.count;
      if (r.role === "admin") stats.admins += r.count;
      if (r.role === "member") stats.members += r.count;
    }
    return stats;
  },

  async listUsers(query: string | undefined, page: number) {
    const db = await getDb();
    const { users } = await schema();
    const search = query?.trim();
    const where = search
      ? or(
          ilike(users.email, `%${search}%`),
          ilike(users.name, `%${search}%`),
          sql`${users.role}::text ilike ${`%${search}%`}`,
          sql`${users.status}::text ilike ${`%${search}%`}`,
        )
      : undefined;
    const [[{ count }], items] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(where),
      db
        .select({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status, createdAt: users.createdAt })
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(PAGE_SIZE)
        .offset(offsetFor(page)),
    ]);
    return pageOf(items.map((u) => ({ ...u, createdAt: iso(u.createdAt) })), count, page);
  },

  /** Null if the user doesn't exist. */
  async setUserRole(adminUserId: string, userId: string, role: Role) {
    const db = await getDb();
    const { users } = await schema();
    const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
    if (!target) return null;
    if (target.role === role) return { changed: false };
    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
    await audit({
      adminUserId,
      action: "admin_user_role_updated",
      entityType: "user",
      entityId: userId,
      details: { previousRole: target.role, newRole: role },
    });
    return { changed: true };
  },

  /** Null if the user doesn't exist. Suspension revokes the user's sessions immediately. */
  async setUserStatus(adminUserId: string, userId: string, status: Status) {
    const db = await getDb();
    const { users, sessions } = await schema();
    const [target] = await db.select({ status: users.status }).from(users).where(eq(users.id, userId)).limit(1);
    if (!target) return null;
    if (target.status === status) return { changed: false };
    await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, userId));
    if (status === "suspended") await db.delete(sessions).where(eq(sessions.userId, userId));
    await audit({
      adminUserId,
      action: "admin_user_status_updated",
      entityType: "user",
      entityId: userId,
      details: { previousStatus: target.status, newStatus: status },
    });
    return { changed: true };
  },
};
