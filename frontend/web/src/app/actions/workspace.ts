"use server";

import type { WorkspaceRole } from "@orion/contracts";
import { apiErrorMessage, sessionApi } from "@orion/session/api";
import { revalidatePath } from "next/cache";

/** The caller's role, entity scope and permissions; null when they have no workspace yet. */
export async function getWorkspaceAccess() {
  const api = await sessionApi();
  const res = await api.v1.workspace.$get();
  if (!res.ok) return null;
  return (await res.json()).data;
}

/** Members of the workspace. Empty unless the caller can manage members. */
export async function getMembers() {
  const api = await sessionApi();
  const res = await api.v1.workspace.members.$get();
  if (!res.ok) return [];
  return (await res.json()).data;
}

export async function addMember(input: { email: string; role: WorkspaceRole; entityIds: string[] | null }) {
  const api = await sessionApi();
  const res = await api.v1.workspace.members.$post({ json: input });
  if (!res.ok) return { error: await apiErrorMessage(res) };
  revalidatePath("/dashboard/settings");
  return { success: true as const };
}

export async function updateMember(id: string, input: { role?: WorkspaceRole; entityIds?: string[] | null }) {
  const api = await sessionApi();
  const res = await api.v1.workspace.members[":id"].$patch({ param: { id }, json: input });
  if (!res.ok) return { error: await apiErrorMessage(res) };
  revalidatePath("/dashboard/settings");
  return { success: true as const };
}

export async function removeMember(id: string) {
  const api = await sessionApi();
  const res = await api.v1.workspace.members[":id"].$delete({ param: { id } });
  if (!res.ok) return { error: await apiErrorMessage(res) };
  revalidatePath("/dashboard/settings");
  return { success: true as const };
}
