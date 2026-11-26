import type { WorkspaceMemberDto, WorkspaceRole } from "@orion/contracts";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { ApiError } from "../../../lib/errors";
import { assertCanManageMember, permissionsFor, requirePermission, scopeForRole } from "../permissions";
import { getDb, resolveWorkspace, schema, type WorkspaceAccess } from "./shared";
import type { FounderRepo } from "./types";

type WorkspaceRepo = Pick<FounderRepo, "getWorkspaceAccess" | "listMembers" | "addMember" | "updateMember" | "removeMember">;

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } } | null;
  return e?.code === "23505" || e?.cause?.code === "23505";
}

async function requireManager(userId: string): Promise<WorkspaceAccess> {
  const access = await resolveWorkspace(userId);
  if (!access) throw new ApiError(409, "conflict", "Complete your company profile before managing your team");
  requirePermission(access.role, "members:manage");
  return access;
}

/** Every requested entity must belong to this workspace. */
async function assertEntitiesInWorkspace(startupId: string, entityIds: string[] | null) {
  if (!entityIds || entityIds.length === 0) return;
  const db = await getDb();
  const { entityStructures } = await schema();
  const rows = await db
    .select({ id: entityStructures.id })
    .from(entityStructures)
    .where(and(eq(entityStructures.startupId, startupId), inArray(entityStructures.id, entityIds)));
  if (rows.length !== entityIds.length) throw new ApiError(400, "bad_request", "One or more selected entities are not in this workspace");
}

async function findMember(startupId: string, memberId: string) {
  const db = await getDb();
  const { workspaceMembers, workspaceMemberEntities, startups } = await schema();
  const [member] = await db
    .select({ id: workspaceMembers.id, userId: workspaceMembers.userId, role: workspaceMembers.role, entityScope: workspaceMembers.entityScope, creatorId: startups.userId })
    .from(workspaceMembers)
    .innerJoin(startups, eq(startups.id, workspaceMembers.startupId))
    .where(and(eq(workspaceMembers.id, memberId), eq(workspaceMembers.startupId, startupId)))
    .limit(1);
  if (!member) return null;
  const entityRows = member.entityScope === "selected"
    ? await db.select({ entityId: workspaceMemberEntities.entityId }).from(workspaceMemberEntities).where(eq(workspaceMemberEntities.memberId, memberId))
    : [];
  return { ...member, entityIds: member.entityScope === "selected" ? entityRows.map((r) => r.entityId) : null };
}

async function ownerCount(startupId: string): Promise<number> {
  const db = await getDb();
  const { workspaceMembers } = await schema();
  const rows = await db
    .select({ id: workspaceMembers.id })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.startupId, startupId), eq(workspaceMembers.role, "owner")));
  return rows.length;
}

async function listMemberDtos(startupId: string, onlyMemberId?: string): Promise<WorkspaceMemberDto[]> {
  const db = await getDb();
  const { workspaceMembers, workspaceMemberEntities, users } = await schema();
  const rows = await db
    .select({
      id: workspaceMembers.id, userId: workspaceMembers.userId, name: users.name, email: users.email,
      role: workspaceMembers.role, entityScope: workspaceMembers.entityScope, createdAt: workspaceMembers.createdAt,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(and(eq(workspaceMembers.startupId, startupId), onlyMemberId ? eq(workspaceMembers.id, onlyMemberId) : undefined))
    .orderBy(asc(workspaceMembers.createdAt));
  const scoped = rows.filter((r) => r.entityScope === "selected").map((r) => r.id);
  const links = scoped.length
    ? await db.select().from(workspaceMemberEntities).where(inArray(workspaceMemberEntities.memberId, scoped))
    : [];
  return rows.map((r) => ({
    ...r,
    entityScope: r.entityScope === "selected" ? "selected" : "all",
    entityIds: links.filter((l) => l.memberId === r.id).map((l) => l.entityId),
    createdAt: r.createdAt.toISOString(),
  }));
}

/** Replace a member's role and entity scope atomically (neon-http has no interactive transactions). */
async function writeMembership(memberId: string, role: WorkspaceRole, entityIds: string[] | null) {
  const db = await getDb();
  const { workspaceMembers, workspaceMemberEntities } = await schema();
  const update = db
    .update(workspaceMembers)
    .set({ role, entityScope: entityIds ? "selected" : "all", updatedAt: new Date() })
    .where(eq(workspaceMembers.id, memberId));
  const clear = db.delete(workspaceMemberEntities).where(eq(workspaceMemberEntities.memberId, memberId));
  if (entityIds && entityIds.length > 0) {
    await db.batch([update, clear, db.insert(workspaceMemberEntities).values(entityIds.map((entityId) => ({ memberId, entityId })))]);
  } else {
    await db.batch([update, clear]);
  }
}

export const workspaceRepo: WorkspaceRepo = {
  async getWorkspaceAccess(userId) {
    const access = await resolveWorkspace(userId);
    if (!access) return null;
    return {
      workspaceId: access.startup.id,
      workspaceName: access.startup.name,
      role: access.role,
      entityScope: access.entityIds ? "selected" : "all",
      entityIds: access.entityIds,
      permissions: permissionsFor(access.role),
    };
  },

  async listMembers(userId) {
    const access = await requireManager(userId);
    return listMemberDtos(access.startup.id);
  },

  async addMember(userId, input) {
    const access = await requireManager(userId);
    assertCanManageMember(access.role, input.role, input.role);
    const entityIds = scopeForRole(input.role, input.entityIds);
    await assertEntitiesInWorkspace(access.startup.id, entityIds);

    const db = await getDb();
    const { users, workspaceMembers, workspaceMemberEntities, auditLog } = await schema();
    const [invitee] = await db
      .select({ id: users.id, emailVerified: users.emailVerified })
      .from(users)
      .where(sql`lower(${users.email}) = ${input.email}`)
      .limit(1);
    if (!invitee) throw new ApiError(404, "not_found", "No ORION account uses this email. Ask them to sign up first.");
    // Without this, anyone could register a colleague's address first and be granted their access.
    if (!invitee.emailVerified) {
      throw new ApiError(409, "conflict", "This person hasn't confirmed their email address yet. Ask them to check their inbox, then try again.");
    }
    const [existing] = await db
      .select({ id: workspaceMembers.id })
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.startupId, access.startup.id), eq(workspaceMembers.userId, invitee.id)))
      .limit(1);
    if (existing) throw new ApiError(409, "conflict", "This person is already a member of the workspace");

    const memberId = crypto.randomUUID();
    const insertMember = db.insert(workspaceMembers).values({
      id: memberId, startupId: access.startup.id, userId: invitee.id, role: input.role,
      entityScope: entityIds ? "selected" : "all", invitedBy: userId,
    });
    try {
      if (entityIds && entityIds.length > 0) {
        await db.batch([insertMember, db.insert(workspaceMemberEntities).values(entityIds.map((entityId) => ({ memberId, entityId })))]);
      } else {
        await insertMember;
      }
    } catch (err) {
      // A concurrent add of the same person hits the (startup_id, user_id) unique index.
      if (isUniqueViolation(err)) throw new ApiError(409, "conflict", "This person is already a member of the workspace");
      throw err;
    }
    await db.insert(auditLog).values({ userId, action: "member_added", entityType: "workspace_member", entityId: memberId, details: { role: input.role, entityIds } });
    const [dto] = await listMemberDtos(access.startup.id, memberId);
    return dto;
  },

  async updateMember(userId, memberId, input) {
    const access = await requireManager(userId);
    const target = await findMember(access.startup.id, memberId);
    if (!target) return null;
    const newRole = input.role ?? target.role;
    assertCanManageMember(access.role, target.role, input.role);
    if (target.userId === target.creatorId && newRole !== "owner") {
      throw new ApiError(409, "conflict", "The workspace creator always remains an owner");
    }
    if (target.role === "owner" && newRole !== "owner" && (await ownerCount(access.startup.id)) <= 1) {
      throw new ApiError(409, "conflict", "A workspace must keep at least one owner");
    }
    const entityIds = scopeForRole(newRole, input.entityIds !== undefined ? input.entityIds : target.entityIds);
    await assertEntitiesInWorkspace(access.startup.id, entityIds);
    await writeMembership(memberId, newRole, entityIds);

    const db = await getDb();
    const { auditLog } = await schema();
    await db.insert(auditLog).values({ userId, action: "member_updated", entityType: "workspace_member", entityId: memberId, details: { from: target.role, to: newRole, entityIds } });
    const [dto] = await listMemberDtos(access.startup.id, memberId);
    return dto;
  },

  async removeMember(userId, memberId) {
    const access = await requireManager(userId);
    const target = await findMember(access.startup.id, memberId);
    if (!target) return false;
    assertCanManageMember(access.role, target.role);
    if (target.userId === target.creatorId) throw new ApiError(409, "conflict", "The workspace creator cannot be removed");
    if (target.role === "owner" && (await ownerCount(access.startup.id)) <= 1) {
      throw new ApiError(409, "conflict", "A workspace must keep at least one owner");
    }
    const db = await getDb();
    const { workspaceMembers, auditLog } = await schema();
    await db.delete(workspaceMembers).where(eq(workspaceMembers.id, memberId));
    await db.insert(auditLog).values({ userId, action: "member_removed", entityType: "workspace_member", entityId: memberId, details: { role: target.role } });
    return true;
  },
};
