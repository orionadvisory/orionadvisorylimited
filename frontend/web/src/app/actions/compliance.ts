"use server";
import { apiErrorMessage, sessionApi } from "@orion/session/api";
import { revalidatePath } from "next/cache";

export async function getObligations() {
  const api = await sessionApi(); const res = await api.v1.obligations.$get();
  return res.ok ? (await res.json()).data : [];
}
export async function createObligation(input: { entityId: string; title: string; regulator?: string; category: string; dueAt?: string; explanation?: string }) {
  const api = await sessionApi(); const res = await api.v1.obligations.$post({ json: { ...input, regulator: input.regulator || null, explanation: input.explanation || null, dueAt: input.dueAt ? new Date(`${input.dueAt}T12:00:00Z`).toISOString() : null } });
  if (!res.ok) return { error: await apiErrorMessage(res) }; revalidatePath("/dashboard/compliance"); return { success: true as const };
}
export async function completeObligation(id: string) {
  const api = await sessionApi(); const res = await api.v1.obligations[":id"].$patch({ param: { id }, json: { status: "completed" } });
  if (!res.ok) return { error: await apiErrorMessage(res) }; revalidatePath("/dashboard/compliance"); return { success: true as const };
}
