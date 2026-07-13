"use server";

import { auth } from "@orion/auth";
import { db } from "@orion/db";
import { assessmentDrafts } from "@orion/db/schema";
import { and, eq } from "drizzle-orm";

export interface DraftPayload {
  answers: Record<string, string | string[]>;
  currentSectionIdx: number;
  completedSectionIds: string[];
}

export interface DraftRecord extends DraftPayload {
  updatedAt: Date;
}

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function getDraft(templateId: string): Promise<DraftRecord | null> {
  const userId = await requireUserId();

  const [draft] = await db
    .select()
    .from(assessmentDrafts)
    .where(
      and(
        eq(assessmentDrafts.userId, userId),
        eq(assessmentDrafts.templateId, templateId)
      )
    )
    .limit(1);

  if (!draft) return null;

  return {
    answers: draft.answers,
    currentSectionIdx: draft.currentSectionIdx,
    completedSectionIds: draft.completedSectionIds,
    updatedAt: draft.updatedAt,
  };
}

export type SaveDraftResult = { updatedAt: Date } | { error: string };

export async function saveDraft(
  templateId: string,
  payload: DraftPayload
): Promise<SaveDraftResult> {
  try {
    const userId = await requireUserId();
    const now = new Date();

    await db
      .insert(assessmentDrafts)
      .values({
        userId,
        templateId,
        answers: payload.answers,
        currentSectionIdx: payload.currentSectionIdx,
        completedSectionIds: payload.completedSectionIds,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [assessmentDrafts.userId, assessmentDrafts.templateId],
        set: {
          answers: payload.answers,
          currentSectionIdx: payload.currentSectionIdx,
          completedSectionIds: payload.completedSectionIds,
          updatedAt: now,
        },
      });

    return { updatedAt: now };
  } catch (err) {
    // Server-action errors are redacted in prod, so return the message as data
    // (and log it server-side) instead of throwing.
    console.error("saveDraft failed:", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error saving draft",
    };
  }
}

export async function clearDraft(templateId: string): Promise<void> {
  const userId = await requireUserId();

  await db
    .delete(assessmentDrafts)
    .where(
      and(
        eq(assessmentDrafts.userId, userId),
        eq(assessmentDrafts.templateId, templateId)
      )
    );
}
