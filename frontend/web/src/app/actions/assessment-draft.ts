"use server";

import { apiErrorMessage, sessionApi } from "@orion/session/api";

export interface DraftPayload {
  answers: Record<string, string | string[]>;
  currentSectionIdx: number;
  completedSectionIds: string[];
}

export interface DraftRecord extends DraftPayload {
  updatedAt: Date;
}

export async function getDraft(templateId: string): Promise<DraftRecord | null> {
  const api = await sessionApi();
  const res = await api.v1.assessments[":templateId"].draft.$get({ param: { templateId } });
  if (res.ok) {
    const { data } = await res.json();
    return data ? { ...data, updatedAt: new Date(data.updatedAt) } : null;
  }
  const status: number = res.status;
  if (status === 401) throw new Error("Not authenticated");
  throw new Error(await apiErrorMessage(res, "Failed to load draft"));
}

export type SaveDraftResult = { updatedAt: Date } | { error: string };

export async function saveDraft(templateId: string, payload: DraftPayload): Promise<SaveDraftResult> {
  try {
    const api = await sessionApi();
    const res = await api.v1.assessments[":templateId"].draft.$put({ param: { templateId }, json: payload });
    if (res.ok) return { updatedAt: new Date((await res.json()).data.updatedAt) };
    // Server-action errors are redacted in prod, so return the message as data.
    return { error: await apiErrorMessage(res, "Failed to save draft") };
  } catch (err) {
    console.error("saveDraft failed:", err);
    return { error: err instanceof Error ? err.message : "Unknown error saving draft" };
  }
}

export async function clearDraft(templateId: string): Promise<void> {
  const api = await sessionApi();
  const res = await api.v1.assessments[":templateId"].draft.$delete({ param: { templateId } });
  const status: number = res.status;
  if (status === 401) throw new Error("Not authenticated");
}
