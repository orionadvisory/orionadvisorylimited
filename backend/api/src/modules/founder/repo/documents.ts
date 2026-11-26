import { and, desc, eq } from "drizzle-orm";
import { findStartup, getDb, schema } from "./shared";
import type { DocumentListItem, FounderRepo } from "./types";

type DocumentsRepo = Pick<
  FounderRepo,
  "listDocuments" | "listDocGenerationIssues" | "createGeneratedDocument" | "findDocumentForUser" | "createUpload"
>;

export const documentsRepo: DocumentsRepo = {
  async listDocuments(userId) {
    const db = await getDb();
    const { documents, uploads } = await schema();
    const [generated, uploaded] = await Promise.all([
      db
        .select({
          id: documents.id,
          name: documents.name,
          type: documents.type,
          status: documents.status,
          content: documents.content,
          createdAt: documents.createdAt,
        })
        .from(documents)
        .where(eq(documents.userId, userId))
        .orderBy(desc(documents.createdAt)),
      db
        .select({ id: uploads.id, name: uploads.name, domain: uploads.domain, createdAt: uploads.createdAt })
        .from(uploads)
        .where(eq(uploads.userId, userId))
        .orderBy(desc(uploads.createdAt)),
    ]);
    const merged: DocumentListItem[] = [
      ...generated.map((d) => ({ ...d, source: "generated" as const })),
      ...uploaded.map((u) => ({
        id: u.id,
        name: u.name,
        type: u.domain || "upload",
        status: "ready",
        content: null,
        source: "uploaded" as const,
        createdAt: u.createdAt,
      })),
    ];
    return merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async listDocGenerationIssues(userId) {
    const startup = await findStartup(userId);
    if (!startup) return { startup: null, issues: [] };
    const db = await getDb();
    const { legalIssues } = await schema();
    const issues = await db
      .select({ id: legalIssues.id, title: legalIssues.title, severity: legalIssues.severity })
      .from(legalIssues)
      .where(
        and(
          eq(legalIssues.startupId, startup.id),
          eq(legalIssues.resolutionPath, "document_generation"),
          eq(legalIssues.isResolved, false),
        ),
      );
    return {
      startup: { name: startup.name, jurisdiction: startup.primaryJurisdiction, stage: startup.stage },
      issues,
    };
  },

  async createGeneratedDocument(input) {
    const db = await getDb();
    const { documents, auditLog } = await schema();
    const [doc] = await db
      .insert(documents)
      .values({
        id: input.id,
        startupId: input.startupId,
        userId: input.userId,
        name: input.name,
        type: input.type,
        status: "ready",
        templateId: input.templateId,
        inputData: input.fields,
        content: input.content,
        storageKey: input.storageKey,
        mimeType: "text/markdown",
        fileSize: Buffer.byteLength(input.content, "utf-8"),
        jurisdiction: input.fields.jurisdiction || null,
      })
      .returning({ id: documents.id, name: documents.name, type: documents.type, createdAt: documents.createdAt });
    await db.insert(auditLog).values({
      userId: input.userId,
      action: "document_generated",
      entityType: "document",
      entityId: doc.id,
      details: { templateId: input.templateId, templateName: input.templateName },
    });
    return doc;
  },

  async findDocumentForUser(id, userId) {
    const db = await getDb();
    const { documents, uploads } = await schema();
    const [doc] = await db
      .select({ name: documents.name, storageKey: documents.storageKey, content: documents.content })
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .limit(1);
    if (doc) return doc;
    // The documents list also shows the founder's own uploads (by upload id).
    const [upload] = await db
      .select({ name: uploads.name, storageKey: uploads.storageKey })
      .from(uploads)
      .where(and(eq(uploads.id, id), eq(uploads.userId, userId)))
      .limit(1);
    return upload ? { ...upload, content: null } : null;
  },

  async createUpload(input) {
    const db = await getDb();
    const { uploads } = await schema();
    await db.insert(uploads).values(input);
  },
};
