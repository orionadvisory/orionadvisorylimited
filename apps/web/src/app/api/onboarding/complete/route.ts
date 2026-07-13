import { auth } from "@orion/auth";
import { db } from "@orion/db";
import {
  startups,
  assessments,
  assessmentResponses,
  assessmentAnswers,
  legalIssues,
  recommendations,
  users,
} from "@orion/db/schema";
import { eq } from "drizzle-orm";
import {
  normalizeSeverity,
  normalizeResolutionPath,
} from "@orion/core/health-check";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { templateId, answers, result } = await req.json();

    if (!templateId || !answers || !result) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // Get or create startup for this user
    let [startup] = await db
      .select()
      .from(startups)
      .where(eq(startups.userId, userId))
      .limit(1);

    if (!startup) {
      [startup] = await db
        .insert(startups)
        .values({
          userId,
          name: "My Startup",
          riskScore: result.overallScore ?? null,
        })
        .returning();
    } else {
      await db
        .update(startups)
        .set({ riskScore: result.overallScore, updatedAt: new Date() })
        .where(eq(startups.id, startup.id));
    }

    // Create assessment record
    const [assessment] = await db
      .insert(assessments)
      .values({
        startupId: startup.id,
        status: "completed",
        overallScore: result.overallScore,
        riskLevel: normalizeSeverity(result.riskLevel),
        completedAt: new Date(),
      })
      .returning();

    // Store raw answers + AI analysis side-by-side
    await db.insert(assessmentAnswers).values({
      userId,
      assessmentId: assessment.id,
      rawAnswers: answers,
      aiAnalysis: result,
    });

    // Store all answers as assessment responses
    const responseEntries = Object.entries(answers).map(([key, value]) => ({
      assessmentId: assessment.id,
      questionId: key,
      questionText: key,
      answer: typeof value === "string" ? value : JSON.stringify(value),
      domain: "general",
    }));

    if (responseEntries.length > 0) {
      await db.insert(assessmentResponses).values(responseEntries);
    }

    // Insert issues and recommendations
    for (const issue of result.issues ?? []) {
      const severity = normalizeSeverity(issue.severity);
      const resolutionPath = normalizeResolutionPath(issue.resolutionPath);

      const [dbIssue] = await db
        .insert(legalIssues)
        .values({
          assessmentId: assessment.id,
          startupId: startup.id,
          title: issue.title,
          description: issue.description,
          domain: issue.domain,
          severity,
          resolutionPath,
        })
        .returning();

      if (issue.recommendation) {
        await db.insert(recommendations).values({
          issueId: dbIssue.id,
          title: issue.recommendation.title,
          description: issue.recommendation.description,
          actionType: resolutionPath,
          priority: severity === "critical" ? 0 : severity === "high" ? 1 : 2,
        });
      }
    }

    // Mark onboarding as completed
    await db
      .update(users)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return Response.json({ success: true, assessmentId: assessment.id });
  } catch (err) {
    console.error("onboarding/complete failed:", err);
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to save your results",
      },
      { status: 500 }
    );
  }
}
