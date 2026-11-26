"use server";

import { sessionApi } from "@orion/session/api";

export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: "member" | "admin";
    status: "active" | "suspended";
  };
  startup: {
    id: string;
    name: string;
    stage: string | null;
    structure: string | null;
    primaryJurisdiction: string | null;
    riskScore: number | null;
  } | null;
  stats: {
    documentCount: number;
    issueCount: number;
    resolvedCount: number;
    criticalCount: number;
  };
  issues: {
    id: string;
    title: string;
    severity: string;
    domain: string;
    isResolved: boolean;
  }[];
  recentDocs: {
    id: string;
    name: string;
    type: string;
    status: string;
    source: "generated" | "uploaded";
    createdAt: Date;
  }[];
  healthCheck: {
    overallScore: number;
    riskLevel: string;
    summary: string;
    domainScores: Record<string, { score: number; issues: number }>;
    priorityActions: string[];
    completedAt: string;
  } | null;
}

/** Dashboard data for the signed-in founder (null when signed out or the account is gone). */
export async function getDashboardData(): Promise<DashboardData | null> {
  const api = await sessionApi();
  const res = await api.v1.me.dashboard.$get();
  if (res.ok) {
    const { data } = await res.json();
    return { ...data, recentDocs: data.recentDocs.map((d) => ({ ...d, createdAt: new Date(d.createdAt) })) };
  }
  const status: number = res.status;
  if (status === 401 || status === 404) return null;
  throw new Error(`Orion API GET /v1/me/dashboard failed with ${status}`);
}
