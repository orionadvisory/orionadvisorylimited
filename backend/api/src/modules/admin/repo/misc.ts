import { asc, desc, eq, ilike, sql } from "drizzle-orm";
import { audit, getDb, iso, isoOrNull, offsetFor, PAGE_SIZE, pageOf, schema } from "./shared";

async function submissionColumns() {
  const { assessments, startups, users, assessmentTemplates } = await schema();
  return {
    id: assessments.id,
    status: assessments.status,
    overallScore: assessments.overallScore,
    riskLevel: assessments.riskLevel,
    completedAt: assessments.completedAt,
    createdAt: assessments.createdAt,
    startupName: startups.name,
    startupId: startups.id,
    userName: users.name,
    userEmail: users.email,
    templateName: assessmentTemplates.name,
    templateId: assessmentTemplates.id,
  };
}

const submissionDates = <T extends { createdAt: Date; completedAt: Date | null }>(r: T) => ({
  ...r,
  createdAt: iso(r.createdAt),
  completedAt: isoOrNull(r.completedAt),
});

/** Submissions, audit feed, partners, uploads and first-admin bootstrap. */
export const miscRepo = {
  async listSubmissions(templateId: string | undefined, page: number) {
    const db = await getDb();
    const { assessments, startups, users, assessmentTemplates } = await schema();
    const where = templateId ? eq(assessments.templateId, templateId) : undefined;
    const [[{ count }], items] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(assessments).where(where),
      db
        .select(await submissionColumns())
        .from(assessments)
        .leftJoin(startups, eq(assessments.startupId, startups.id))
        .leftJoin(users, eq(startups.userId, users.id))
        .leftJoin(assessmentTemplates, eq(assessments.templateId, assessmentTemplates.id))
        .where(where)
        .orderBy(desc(assessments.createdAt))
        .limit(PAGE_SIZE)
        .offset(offsetFor(page)),
    ]);
    return pageOf(items.map(submissionDates), count, page);
  },

  async getSubmission(assessmentId: string) {
    const db = await getDb();
    const { assessments, startups, users, assessmentTemplates, assessmentResponses, uploads } = await schema();
    const [assessment] = await db
      .select(await submissionColumns())
      .from(assessments)
      .leftJoin(startups, eq(assessments.startupId, startups.id))
      .leftJoin(users, eq(startups.userId, users.id))
      .leftJoin(assessmentTemplates, eq(assessments.templateId, assessmentTemplates.id))
      .where(eq(assessments.id, assessmentId))
      .limit(1);
    if (!assessment) return null;
    const [responses, files] = await Promise.all([
      db
        .select({
          id: assessmentResponses.id,
          questionId: assessmentResponses.questionId,
          questionText: assessmentResponses.questionText,
          answer: assessmentResponses.answer,
          domain: assessmentResponses.domain,
          createdAt: assessmentResponses.createdAt,
        })
        .from(assessmentResponses)
        .where(eq(assessmentResponses.assessmentId, assessmentId))
        .orderBy(asc(assessmentResponses.createdAt)),
      db
        .select({
          id: uploads.id,
          name: uploads.name,
          storageKey: uploads.storageKey,
          mimeType: uploads.mimeType,
          fileSize: uploads.fileSize,
          questionKey: uploads.questionKey,
          domain: uploads.domain,
          createdAt: uploads.createdAt,
        })
        .from(uploads)
        .where(eq(uploads.assessmentId, assessmentId))
        .orderBy(asc(uploads.createdAt)),
    ]);
    return {
      assessment: submissionDates(assessment),
      responses: responses.map((r) => ({ ...r, createdAt: iso(r.createdAt) })),
      uploads: files.map((u) => ({ ...u, createdAt: iso(u.createdAt) })),
    };
  },

  async submissionCount(templateId: string) {
    const db = await getDb();
    const { assessments } = await schema();
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(assessments)
      .where(eq(assessments.templateId, templateId));
    return count;
  },

  async recentAuditEvents(limit: number) {
    const db = await getDb();
    const { auditLog, users } = await schema();
    const rows = await db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        details: auditLog.details,
        createdAt: auditLog.createdAt,
        actorEmail: users.email,
      })
      .from(auditLog)
      .leftJoin(users, eq(users.id, auditLog.userId))
      .where(ilike(auditLog.action, "admin_%"))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit);
    return rows.map((r) => ({ ...r, createdAt: iso(r.createdAt) }));
  },

  // ─── Partners ──────────────────────────────────────────

  async listPartners() {
    const db = await getDb();
    const { partners } = await schema();
    const rows = await db
      .select({ id: partners.id, name: partners.name, orderIndex: partners.orderIndex, createdAt: partners.createdAt })
      .from(partners)
      .orderBy(asc(partners.orderIndex), asc(partners.createdAt));
    return rows.map((p) => ({ ...p, createdAt: iso(p.createdAt) }));
  },

  async createPartner(adminUserId: string, input: { id: string; name: string; storageKey: string; contentType: string }) {
    const db = await getDb();
    const { partners } = await schema();
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(partners);
    await db.insert(partners).values({
      id: input.id,
      name: input.name,
      logoStorageKey: input.storageKey,
      logoContentType: input.contentType,
      orderIndex: count,
    });
    await audit({ adminUserId, action: "admin_partner_created", entityType: "partner", entityId: input.id, details: { name: input.name } });
  },

  async reorderPartners(adminUserId: string, orderedIds: string[]) {
    const db = await getDb();
    const { partners } = await schema();
    await Promise.all(
      orderedIds.map((id, index) =>
        db.update(partners).set({ orderIndex: index, updatedAt: new Date() }).where(eq(partners.id, id)),
      ),
    );
    await audit({ adminUserId, action: "admin_partners_reordered", entityType: "partner", details: { orderedIds } });
  },

  /** Returns the logo storage key so the caller can delete the object, or null if not found. */
  async deletePartner(adminUserId: string, id: string) {
    const db = await getDb();
    const { partners } = await schema();
    const [row] = await db
      .delete(partners)
      .where(eq(partners.id, id))
      .returning({ name: partners.name, logoStorageKey: partners.logoStorageKey });
    if (!row) return null;
    await audit({ adminUserId, action: "admin_partner_deleted", entityType: "partner", entityId: id, details: { name: row.name } });
    return row.logoStorageKey;
  },

  async findUploadStorageKey(uploadId: string) {
    const db = await getDb();
    const { uploads } = await schema();
    const [row] = await db.select({ storageKey: uploads.storageKey }).from(uploads).where(eq(uploads.id, uploadId)).limit(1);
    return row?.storageKey ?? null;
  },

  // ─── First-admin bootstrap ─────────────────────────────

  async hasAdmin() {
    const db = await getDb();
    const { users } = await schema();
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "admin"));
    return count > 0;
  },

  async createFirstAdmin(input: { name: string; email: string; passwordHash: string }): Promise<"ok" | "email_taken"> {
    const db = await getDb();
    const { users } = await schema();
    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`lower(${users.email}) = ${input.email}`)
      .limit(1);
    if (taken) return "email_taken";
    const [created] = await db
      .insert(users)
      .values({ ...input, role: "admin", status: "active", onboardingCompleted: true })
      .returning({ id: users.id });
    await audit({ adminUserId: created.id, action: "admin_bootstrap_created", entityType: "user", entityId: created.id });
    return "ok";
  },
};
