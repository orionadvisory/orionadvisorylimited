import type { DashboardDto, IssueDto, ReferralDto } from "@orion/contracts";
import { and, count, desc, eq } from "drizzle-orm";
import { findStartup, getDb, schema } from "./shared";
import type { FounderRepo } from "./types";

type DashboardRepo = Pick<
  FounderRepo,
  "getDashboard" | "listIssues" | "listReferrals" | "findIssueForUser" | "createReferral"
>;

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

export const dashboardRepo: DashboardRepo = {
  async getDashboard(userId) {
    const db = await getDb();
    const { users, documents, uploads, legalIssues, assessmentAnswers, assessments } = await schema();

    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) return null;

    const startup = await findStartup(userId);

    let stats: DashboardDto["stats"] = { documentCount: 0, issueCount: 0, resolvedCount: 0, criticalCount: 0 };
    let issues: DashboardDto["issues"] = [];
    let recentDocs: DashboardDto["recentDocs"] = [];
    let healthCheck: DashboardDto["healthCheck"] = null;

    if (startup) {
      const [[docCount], [uploadCount], allIssues, generatedDocs, uploadedDocs, latest] = await Promise.all([
        db.select({ value: count() }).from(documents).where(eq(documents.startupId, startup.id)),
        db.select({ value: count() }).from(uploads).where(eq(uploads.startupId, startup.id)),
        db
          .select({
            id: legalIssues.id,
            title: legalIssues.title,
            severity: legalIssues.severity,
            domain: legalIssues.domain,
            isResolved: legalIssues.isResolved,
          })
          .from(legalIssues)
          .where(eq(legalIssues.startupId, startup.id)),
        db
          .select({ id: documents.id, name: documents.name, type: documents.type, status: documents.status, createdAt: documents.createdAt })
          .from(documents)
          .where(eq(documents.startupId, startup.id))
          .orderBy(desc(documents.createdAt))
          .limit(5),
        db
          .select({ id: uploads.id, name: uploads.name, domain: uploads.domain, createdAt: uploads.createdAt })
          .from(uploads)
          .where(eq(uploads.startupId, startup.id))
          .orderBy(desc(uploads.createdAt))
          .limit(5),
        db
          .select({ aiAnalysis: assessmentAnswers.aiAnalysis, completedAt: assessments.completedAt })
          .from(assessmentAnswers)
          .innerJoin(assessments, eq(assessments.id, assessmentAnswers.assessmentId))
          .where(and(eq(assessmentAnswers.userId, userId), eq(assessments.status, "completed")))
          .orderBy(desc(assessmentAnswers.createdAt))
          .limit(1),
      ]);

      issues = allIssues;
      const active = allIssues.filter((i) => !i.isResolved);
      stats = {
        documentCount: docCount.value + uploadCount.value,
        issueCount: active.length,
        resolvedCount: allIssues.length - active.length,
        criticalCount: active.filter((i) => i.severity === "critical" || i.severity === "high").length,
      };

      recentDocs = [
        ...generatedDocs.map((d) => ({ ...d, source: "generated" as const })),
        ...uploadedDocs.map((u) => ({
          id: u.id,
          name: u.name,
          type: u.domain || "upload",
          status: "ready",
          source: "uploaded" as const,
          createdAt: u.createdAt,
        })),
      ]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }));

      const ai = latest[0]?.aiAnalysis;
      if (isRecord(ai)) {
        healthCheck = {
          overallScore: typeof ai.overallScore === "number" ? ai.overallScore : 0,
          riskLevel: typeof ai.riskLevel === "string" ? ai.riskLevel : "info",
          summary: typeof ai.summary === "string" ? ai.summary : "",
          domainScores: isRecord(ai.domainScores)
            ? (ai.domainScores as Record<string, { score: number; issues: number }>)
            : {},
          priorityActions: Array.isArray(ai.priorityActions) ? (ai.priorityActions as string[]) : [],
          completedAt: (latest[0].completedAt ?? new Date()).toISOString(),
        };
      }
    }

    return {
      user: { ...user, name: user.name || "User" },
      startup,
      stats,
      issues,
      recentDocs,
      healthCheck,
    };
  },

  async listIssues(userId) {
    const startup = await findStartup(userId);
    if (!startup) return [];
    const db = await getDb();
    const { legalIssues } = await schema();
    const rows = await db
      .select({
        id: legalIssues.id,
        title: legalIssues.title,
        description: legalIssues.description,
        domain: legalIssues.domain,
        severity: legalIssues.severity,
        resolutionPath: legalIssues.resolutionPath,
        isResolved: legalIssues.isResolved,
      })
      .from(legalIssues)
      .where(eq(legalIssues.startupId, startup.id))
      .orderBy(desc(legalIssues.severity));
    return rows satisfies IssueDto[];
  },

  async listReferrals(userId) {
    const db = await getDb();
    const { referrals, legalIssues } = await schema();
    const rows = await db
      .select({
        id: referrals.id,
        status: referrals.status,
        issueSummary: referrals.issueSummary,
        providerNotes: referrals.providerNotes,
        createdAt: referrals.createdAt,
        updatedAt: referrals.updatedAt,
        issueTitle: legalIssues.title,
        issueSeverity: legalIssues.severity,
        issueDomain: legalIssues.domain,
      })
      .from(referrals)
      .innerJoin(legalIssues, eq(referrals.issueId, legalIssues.id))
      .where(eq(referrals.userId, userId))
      .orderBy(desc(referrals.createdAt));
    return rows.map(
      (r): ReferralDto => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() }),
    );
  },

  async findIssueForUser(issueId, userId) {
    const db = await getDb();
    const { legalIssues, startups } = await schema();
    const [row] = await db
      .select({ id: legalIssues.id, title: legalIssues.title, startupId: legalIssues.startupId })
      .from(legalIssues)
      .innerJoin(startups, eq(startups.id, legalIssues.startupId))
      .where(and(eq(legalIssues.id, issueId), eq(startups.userId, userId)))
      .limit(1);
    return row ?? null;
  },

  async createReferral({ userId, issueId, startupId, issueSummary, issueTitle }) {
    const db = await getDb();
    const { referrals, auditLog } = await schema();
    const [referral] = await db
      .insert(referrals)
      .values({ issueId, startupId, userId, status: "requested", issueSummary })
      .returning({ id: referrals.id });
    await db.insert(auditLog).values({
      userId,
      action: "referral_created",
      entityType: "referral",
      entityId: referral.id,
      details: { issueId, issueTitle },
    });
    return referral.id;
  },
};
