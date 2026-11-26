"use server";

import { apiErrorMessage, sessionApi } from "@orion/session/api";
import { revalidatePath } from "next/cache";

export async function getEntities(includeArchived = false) {
  const api = await sessionApi();
  const res = await api.v1.entities.$get({ query: { includeArchived: includeArchived ? "true" : "false" } });
  if (!res.ok) return [];
  return (await res.json()).data;
}

export async function createEntity(input: { name: string; legalType: string; jurisdiction: string; state?: string; registrationNumber?: string; role?: string }) {
  const api = await sessionApi();
  const res = await api.v1.entities.$post({ json: { ...input, state: input.state || null, registrationNumber: input.registrationNumber || null, role: input.role || null } });
  if (!res.ok) return { error: await apiErrorMessage(res) };
  revalidatePath("/dashboard/entities");
  return { success: true as const, entity: (await res.json()).data };
}

export async function archiveEntity(id: string) {
  const api = await sessionApi();
  const res = await api.v1.entities[":id"].$patch({ param: { id }, json: { status: "archived" } });
  if (!res.ok) return { error: await apiErrorMessage(res) };
  revalidatePath("/dashboard/entities");
  return { success: true as const };
}
