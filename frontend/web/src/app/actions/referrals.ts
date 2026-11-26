"use server";

import { apiErrorMessage, sessionApi } from "@orion/session/api";

export async function createReferral(data: { issueId: string; issueSummary: string }) {
  const api = await sessionApi();
  const res = await api.v1.referrals.$post({ json: data });
  if (res.ok) {
    const { data: created } = await res.json();
    return { success: true as const, referralId: created.referralId };
  }
  const status: number = res.status;
  if (status === 401) return { error: "You must be signed in" };
  return { error: await apiErrorMessage(res) };
}

export async function getUserReferrals() {
  const api = await sessionApi();
  const res = await api.v1.referrals.$get();
  if (!res.ok) return [];
  const { data } = await res.json();
  return data.map((r) => ({ ...r, createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) }));
}

export async function getUserIssues() {
  const api = await sessionApi();
  const res = await api.v1.issues.$get();
  if (!res.ok) return [];
  return (await res.json()).data;
}
