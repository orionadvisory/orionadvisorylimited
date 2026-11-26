"use server";

import { apiErrorMessage, sessionApi } from "@orion/session/api";

/**
 * Persist a guest health check result to the signed-in account after signup.
 * Creates a default startup profile if none exists.
 */
export async function persistHealthCheck(resultJson: string) {
  let result: unknown;
  try {
    result = JSON.parse(resultJson);
  } catch {
    return { error: "Saved results are corrupted. Please run the health check again." };
  }

  const api = await sessionApi();
  const res = await api.v1["health-check"].persist.$post({
    json: { result } as Parameters<typeof api.v1["health-check"]["persist"]["$post"]>[0]["json"],
  });
  if (res.ok) {
    const { data } = await res.json();
    return { success: true as const, assessmentId: data.assessmentId, startupId: data.startupId };
  }
  const status: number = res.status;
  if (status === 401) return { error: "You must be signed in to save results" };
  return { error: await apiErrorMessage(res, "Failed to save your results") };
}
