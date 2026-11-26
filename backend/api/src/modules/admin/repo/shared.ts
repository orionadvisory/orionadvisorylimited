import { getDb } from "../../../lib/db";

export const schema = () => import("@orion/db/schema");
export { getDb };

export const PAGE_SIZE = 20;

export const iso = (d: Date) => d.toISOString();
export const isoOrNull = (d: Date | null) => (d ? d.toISOString() : null);

export function pageOf<T>(items: T[], total: number, page: number) {
  return { items, total, page, perPage: PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export const offsetFor = (page: number) => (Math.max(1, page) - 1) * PAGE_SIZE;

/** Every admin mutation is recorded. Actions are prefixed `admin_` (the audit feed filters on it). */
export async function audit(params: {
  adminUserId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: unknown;
}) {
  const db = await getDb();
  const { auditLog } = await schema();
  await db.insert(auditLog).values({
    userId: params.adminUserId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    details: params.details ?? null,
  });
}
