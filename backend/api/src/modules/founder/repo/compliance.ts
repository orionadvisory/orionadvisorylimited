import type { CreateObligationBodyDto, ObligationDto, UpdateObligationBodyDto } from "@orion/contracts";
import { and, asc, eq, inArray, ne, sql } from "drizzle-orm";
import { inScope, requirePermission } from "../permissions";
import { getDb, resolveWorkspace, schema } from "./shared";
import type { FounderRepo } from "./types";

type ComplianceRepo = Pick<FounderRepo, "listObligations" | "createObligation" | "updateObligation">;

const clean = (value: string | null | undefined) => value === undefined ? undefined : value || null;

/** Statuses that are finished or out of scope, so a passed due date never makes them overdue. */
const CLOSED_STATUSES = new Set(["submitted", "completed", "not_applicable"]);

/**
 * Overdue is derived at read time from the confirmed due date, so it is always
 * current without a background job. Unconfirmed dates are never treated as overdue.
 */
export function effectiveStatus(status: string, dueAt: Date | null, dateStatus: string, now = new Date()): ObligationDto["status"] {
  if (dueAt && dateStatus === "confirmed" && dueAt.getTime() < now.getTime() && !CLOSED_STATUSES.has(status)) return "overdue";
  if (status === "overdue" && !(dueAt && dueAt.getTime() < now.getTime())) return dueAt ? "upcoming" : "needs_confirmation";
  return status as ObligationDto["status"];
}

/**
 * Moving work forward (status only) is allowed for contributors and advisers. Changing
 * dates or explanations, or ruling an obligation out, needs the manage permission.
 */
export function isProgressOnly(input: UpdateObligationBodyDto): boolean {
  const keys = Object.keys(input);
  return keys.length === 1 && keys[0] === "status" && input.status !== "not_applicable";
}

function dto(row: {
  id: string; entityId: string; entityName: string; ruleId: string | null; title: string;
  regulator: string | null; category: string; status: string; dueAt: Date | null; dateStatus: string;
  explanation: string | null; source: string; completedAt: Date | null; createdAt: Date; updatedAt: Date;
}): ObligationDto {
  return { ...row,
    status: effectiveStatus(row.status, row.dueAt, row.dateStatus), dateStatus: row.dateStatus as ObligationDto["dateStatus"],
    source: row.source as ObligationDto["source"], dueAt: row.dueAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

export const complianceRepo: ComplianceRepo = {
  async listObligations(userId) {
    const access = await resolveWorkspace(userId);
    if (!access) return [];
    requirePermission(access.role, "obligation:read");
    if (access.entityIds?.length === 0) return [];
    const startup = access.startup;
    const db = await getDb();
    const { complianceObligations, entityStructures } = await schema();
    const rows = await db.select({
      id: complianceObligations.id, entityId: complianceObligations.entityId, entityName: entityStructures.entityName,
      ruleId: complianceObligations.ruleId, title: complianceObligations.title, regulator: complianceObligations.regulator,
      category: complianceObligations.category, status: complianceObligations.status, dueAt: complianceObligations.dueAt,
      dateStatus: complianceObligations.dateStatus, explanation: complianceObligations.explanation, source: complianceObligations.source,
      completedAt: complianceObligations.completedAt, createdAt: complianceObligations.createdAt, updatedAt: complianceObligations.updatedAt,
    }).from(complianceObligations).innerJoin(entityStructures, eq(entityStructures.id, complianceObligations.entityId))
      .where(and(
        eq(complianceObligations.startupId, startup.id),
        ne(entityStructures.status, "archived"),
        access.entityIds ? inArray(complianceObligations.entityId, access.entityIds) : undefined,
      ))
      .orderBy(sql`${complianceObligations.dueAt} asc nulls last`, asc(complianceObligations.title));
    return rows.map(dto);
  },
  async createObligation(userId, input) {
    const access = await resolveWorkspace(userId);
    if (!access || !inScope(access.entityIds, input.entityId)) return null;
    requirePermission(access.role, "obligation:manage");
    const startup = access.startup;
    const db = await getDb();
    const { complianceObligations, entityStructures, auditLog } = await schema();
    const [entity] = await db.select({ id: entityStructures.id, entityName: entityStructures.entityName }).from(entityStructures)
      .where(and(eq(entityStructures.id, input.entityId), eq(entityStructures.startupId, startup.id), eq(entityStructures.status, "active"))).limit(1);
    if (!entity) return null;
    const dueAt = input.dueAt ? new Date(input.dueAt) : null;
    const [created] = await db.insert(complianceObligations).values({ startupId: startup.id, entityId: entity.id, title: input.title,
      regulator: clean(input.regulator), category: input.category, dueAt, dateStatus: dueAt ? "confirmed" : "pending_confirmation",
      status: dueAt ? "upcoming" : "needs_confirmation", explanation: clean(input.explanation), source: "user" }).returning();
    await db.insert(auditLog).values({ userId, action: "obligation_created", entityType: "compliance_obligation", entityId: created.id, details: { entityId: entity.id, title: created.title } });
    return dto({ ...created, entityName: entity.entityName });
  },
  async updateObligation(userId, obligationId, input) {
    const access = await resolveWorkspace(userId);
    if (!access) return null;
    requirePermission(access.role, isProgressOnly(input) ? "obligation:progress" : "obligation:manage");
    const startup = access.startup;
    const db = await getDb();
    const { complianceObligations, entityStructures, auditLog } = await schema();
    const values = {
      ...(input.status !== undefined && { status: input.status, completedAt: input.status === "completed" ? new Date() : null }),
      ...(input.dueAt !== undefined && { dueAt: input.dueAt ? new Date(input.dueAt) : null, dateStatus: input.dueAt ? "confirmed" : "pending_confirmation" }),
      // Keep the date-driven statuses in step with the date unless the caller sets a status explicitly.
      ...(input.dueAt !== undefined && input.status === undefined && {
        status: sql`case when ${complianceObligations.status} in ('needs_confirmation', 'upcoming', 'overdue') then ${input.dueAt ? "upcoming" : "needs_confirmation"} else ${complianceObligations.status} end`,
      }),
      ...(input.dateStatus !== undefined && { dateStatus: input.dateStatus }),
      ...(input.explanation !== undefined && { explanation: clean(input.explanation) }), updatedAt: new Date(),
    };
    const [updated] = await db.update(complianceObligations).set(values).where(and(
      eq(complianceObligations.id, obligationId),
      eq(complianceObligations.startupId, startup.id),
      access.entityIds ? inArray(complianceObligations.entityId, access.entityIds) : undefined,
    )).returning();
    if (!updated) return null;
    const [entity] = await db.select({ entityName: entityStructures.entityName }).from(entityStructures).where(eq(entityStructures.id, updated.entityId)).limit(1);
    await db.insert(auditLog).values({ userId, action: "obligation_updated", entityType: "compliance_obligation", entityId: obligationId, details: { fields: Object.keys(input) } });
    return dto({ ...updated, entityName: entity.entityName });
  },
};
