import type { CreateEntityBodyDto, EntityDto, UpdateEntityBodyDto } from "@orion/contracts";
import { and, asc, eq, inArray, ne } from "drizzle-orm";
import { ApiError } from "../../../lib/errors";
import { inScope, requirePermission } from "../permissions";
import { getDb, resolveWorkspace, schema } from "./shared";
import type { FounderRepo } from "./types";

type EntityRepo = Pick<FounderRepo, "listEntities" | "createEntity" | "updateEntity">;

function dto(row: {
  id: string; entityName: string; tradingName: string | null; entityType: string; jurisdiction: string;
  state: string | null; registrationNumber: string | null; registeredAddress: string | null;
  industry: string | null; financialYearEnd: string | null; taxId: string | null; role: string | null;
  status: string; incorporatedAt: Date | null; createdAt: Date; updatedAt: Date;
}): EntityDto {
  return {
    id: row.id,
    name: row.entityName,
    tradingName: row.tradingName,
    legalType: row.entityType,
    jurisdiction: row.jurisdiction,
    state: row.state,
    registrationNumber: row.registrationNumber,
    registeredAddress: row.registeredAddress,
    industry: row.industry,
    financialYearEnd: row.financialYearEnd,
    taxId: row.taxId,
    role: row.role,
    status: row.status === "archived" ? "archived" : "active",
    incorporatedAt: row.incorporatedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const clean = (value: string | null | undefined) => value === undefined ? undefined : value || null;

export const entitiesRepo: EntityRepo = {
  async listEntities(userId, includeArchived = false) {
    const access = await resolveWorkspace(userId);
    if (!access) return [];
    requirePermission(access.role, "entity:read");
    if (access.entityIds?.length === 0) return [];
    const db = await getDb();
    const { entityStructures } = await schema();
    const rows = await db.select().from(entityStructures).where(and(
      eq(entityStructures.startupId, access.startup.id),
      includeArchived ? undefined : ne(entityStructures.status, "archived"),
      access.entityIds ? inArray(entityStructures.id, access.entityIds) : undefined,
    )).orderBy(asc(entityStructures.entityName));
    return rows.map(dto);
  },

  async createEntity(userId, input) {
    const access = await resolveWorkspace(userId);
    if (!access) throw new ApiError(409, "conflict", "Complete your company profile before adding an entity");
    requirePermission(access.role, "entity:manage");
    const startup = access.startup;
    const db = await getDb();
    const { entityStructures, auditLog } = await schema();
    const [created] = await db.insert(entityStructures).values({
      startupId: startup.id,
      entityName: input.name,
      tradingName: clean(input.tradingName),
      entityType: input.legalType,
      jurisdiction: input.jurisdiction,
      state: clean(input.state),
      registrationNumber: clean(input.registrationNumber),
      registeredAddress: clean(input.registeredAddress),
      industry: clean(input.industry),
      financialYearEnd: clean(input.financialYearEnd),
      taxId: clean(input.taxId),
      role: clean(input.role),
      incorporatedAt: input.incorporatedAt ? new Date(input.incorporatedAt) : null,
    }).returning();
    await db.insert(auditLog).values({ userId, action: "entity_created", entityType: "entity", entityId: created.id, details: { name: created.entityName } });
    return dto(created);
  },

  async updateEntity(userId, entityId, input) {
    const access = await resolveWorkspace(userId);
    // Out-of-scope entities are reported as not found, so their existence is not revealed.
    if (!access || !inScope(access.entityIds, entityId)) return null;
    requirePermission(access.role, "entity:manage");
    const startup = access.startup;
    const db = await getDb();
    const { entityStructures, auditLog } = await schema();
    const values = {
      ...(input.name !== undefined && { entityName: input.name }),
      ...(input.tradingName !== undefined && { tradingName: clean(input.tradingName) }),
      ...(input.legalType !== undefined && { entityType: input.legalType }),
      ...(input.jurisdiction !== undefined && { jurisdiction: input.jurisdiction }),
      ...(input.state !== undefined && { state: clean(input.state) }),
      ...(input.registrationNumber !== undefined && { registrationNumber: clean(input.registrationNumber) }),
      ...(input.registeredAddress !== undefined && { registeredAddress: clean(input.registeredAddress) }),
      ...(input.industry !== undefined && { industry: clean(input.industry) }),
      ...(input.financialYearEnd !== undefined && { financialYearEnd: clean(input.financialYearEnd) }),
      ...(input.taxId !== undefined && { taxId: clean(input.taxId) }),
      ...(input.role !== undefined && { role: clean(input.role) }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.incorporatedAt !== undefined && { incorporatedAt: input.incorporatedAt ? new Date(input.incorporatedAt) : null }),
      updatedAt: new Date(),
    };
    const [updated] = await db.update(entityStructures).set(values).where(
      and(eq(entityStructures.id, entityId), eq(entityStructures.startupId, startup.id)),
    ).returning();
    if (!updated) return null;
    await db.insert(auditLog).values({ userId, action: input.status === "archived" ? "entity_archived" : "entity_updated", entityType: "entity", entityId, details: { fields: Object.keys(input) } });
    return dto(updated);
  },
};
