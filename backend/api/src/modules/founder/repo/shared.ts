import type { WorkspaceRole } from "@orion/contracts";
import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "../../../lib/db";
import type { StartupRow } from "./types";

export const schema = () => import("@orion/db/schema");
export { getDb };

export const startupColumns = async () => {
  const { startups } = await schema();
  return {
    id: startups.id,
    name: startups.name,
    stage: startups.stage,
    structure: startups.structure,
    primaryJurisdiction: startups.primaryJurisdiction,
    riskScore: startups.riskScore,
  };
};

export async function findStartup(userId: string): Promise<StartupRow | null> {
  const db = await getDb();
  const { startups } = await schema();
  const [row] = await db
    .select(await startupColumns())
    .from(startups)
    .where(eq(startups.userId, userId))
    .orderBy(asc(startups.createdAt), asc(startups.id))
    .limit(1);
  return row ?? null;
}

export async function getOrCreateStartup(userId: string, name = "My Startup"): Promise<StartupRow> {
  const existing = await findStartup(userId);
  if (existing) return existing;
  const id = await createStartupRow({ userId, name });
  return { id, name, stage: null, structure: null, primaryJurisdiction: null, riskScore: null };
}

type StartupInsert = typeof import("@orion/db/schema").startups.$inferInsert;

/**
 * Create a startup row. It becomes the user's workspace (owner membership, written in the
 * same atomic batch) only when they belong to no workspace yet. Otherwise a background
 * auto-create from an older module (chat, documents) would pull an invited member away
 * from the workspace they were invited into.
 */
export async function createStartupRow(values: Omit<StartupInsert, "id">): Promise<string> {
  const db = await getDb();
  const { startups, workspaceMembers } = await schema();
  const id = crypto.randomUUID();
  const insertStartup = db.insert(startups).values({ ...values, id });
  const [membership] = await db
    .select({ id: workspaceMembers.id })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, values.userId))
    .limit(1);
  if (membership) {
    await insertStartup;
  } else {
    await db.batch([
      insertStartup,
      db.insert(workspaceMembers).values({ startupId: id, userId: values.userId, role: "owner", entityScope: "all" }),
    ]);
  }
  return id;
}

/** Give a workspace's creator an owner membership. Idempotent. */
export async function ensureOwnerMembership(startupId: string, userId: string): Promise<void> {
  const db = await getDb();
  const { workspaceMembers } = await schema();
  await db.insert(workspaceMembers).values({ startupId, userId, role: "owner", entityScope: "all" }).onConflictDoNothing();
}

/** The caller's membership of a workspace. `entityIds === null` means every entity. */
export type WorkspaceAccess = {
  startup: StartupRow;
  memberId: string;
  role: WorkspaceRole;
  entityIds: string[] | null;
};

/**
 * Resolve the workspace the caller is working in, through membership: the workspace they
 * created comes first, then their oldest membership. (Switching is not built yet.)
 *
 * Only ORION 2 modules (entities, compliance, team) use this. Older modules still use
 * `findStartup`, which only matches the creator, so invited members see nothing there.
 */
export async function resolveWorkspace(userId: string, healed = false): Promise<WorkspaceAccess | null> {
  const db = await getDb();
  const { startups, workspaceMembers, workspaceMemberEntities } = await schema();
  const [row] = await db
    .select({
      ...(await startupColumns()),
      memberId: workspaceMembers.id,
      role: workspaceMembers.role,
      entityScope: workspaceMembers.entityScope,
    })
    .from(workspaceMembers)
    .innerJoin(startups, eq(startups.id, workspaceMembers.startupId))
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(
      sql`case when ${startups.userId} = ${userId} then 0 else 1 end`,
      asc(workspaceMembers.createdAt),
      asc(workspaceMembers.id),
    )
    .limit(1);

  if (!row) {
    // A creator with no membership anywhere (legacy row): heal once, then resolve again.
    // Deliberately skipped when they belong to another workspace: see createStartupRow.
    const owned = healed ? null : await findStartup(userId);
    if (!owned) return null;
    await ensureOwnerMembership(owned.id, userId);
    return resolveWorkspace(userId, true);
  }

  const { memberId, role, entityScope, ...startup } = row;
  let entityIds: string[] | null = null;
  if (entityScope === "selected") {
    const rows = await db
      .select({ entityId: workspaceMemberEntities.entityId })
      .from(workspaceMemberEntities)
      .where(eq(workspaceMemberEntities.memberId, memberId));
    entityIds = rows.map((r) => r.entityId);
  }
  return { startup, memberId, role, entityIds };
}

/** Map AI severity strings onto the DB enum; also yields recommendation priority. */
export async function normalizers() {
  const { normalizeSeverity, normalizeResolutionPath } = await import("@orion/core/health-check");
  return {
    severity: normalizeSeverity,
    resolutionPath: normalizeResolutionPath,
    priority: (s: string) => (s === "critical" ? 0 : s === "high" ? 1 : 2),
  };
}

const STAGES = ["idea", "pre_seed", "seed", "series_a", "series_b", "growth"] as const;
export type Stage = (typeof STAGES)[number];
export const toStage = (value: unknown): Stage | null =>
  (STAGES as readonly unknown[]).includes(value) ? (value as Stage) : null;
