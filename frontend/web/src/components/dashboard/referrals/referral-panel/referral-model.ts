import type { ChipTone } from "@orion/ui/components/ui/chip";

export interface Issue {
  id: string;
  title: string;
  description: string;
  domain: string;
  severity: string;
  resolutionPath: string;
  isResolved: boolean;
}

export interface Referral {
  id: string;
  status: string;
  issueSummary: string;
  providerNotes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  issueTitle: string;
  issueSeverity: string;
  issueDomain: string;
}

/** Severity → chip styling. critical = solid ember, high = ember-soft, medium = gold, low = teal. */
export const severityConfig: Record<string, { label: string; tone: ChipTone; className?: string }> = {
  critical: { label: "Critical", tone: "ember", className: "bg-ember text-ink" },
  high: { label: "High", tone: "ember" },
  medium: { label: "Medium", tone: "gold" },
  low: { label: "Low", tone: "teal" },
};

export type ReferralStatus = "requested" | "matched" | "in_progress" | "resolved" | "cancelled";

export const statusConfig: Record<
  string,
  { label: string; tone: ChipTone; dot: string; step: number }
> = {
  requested: { label: "Requested", tone: "gold", dot: "bg-gold", step: 1 },
  matched: { label: "Matched", tone: "teal", dot: "bg-brand", step: 2 },
  in_progress: { label: "In progress", tone: "teal", dot: "bg-brand", step: 3 },
  resolved: { label: "Resolved", tone: "ink", dot: "bg-ink", step: 4 },
  cancelled: { label: "Cancelled", tone: "neutral", dot: "bg-line-strong", step: 0 },
};

export const STATUS_STEPS = ["Requested", "Matched", "In progress", "Resolved"] as const;

export function severityOf(key: string) {
  return severityConfig[key] || severityConfig.low;
}

export function statusOf(key: string) {
  return statusConfig[key] || statusConfig.requested;
}

export function domainLabel(domain: string) {
  return domain.replace("_", " ");
}

/** Issues that warrant a human expert: unresolved and either flagged for referral or high-stakes. */
export function expertIssuesOf(issues: Issue[]) {
  return issues.filter(
    (i) =>
      !i.isResolved &&
      (i.resolutionPath === "expert_referral" || i.severity === "critical" || i.severity === "high")
  );
}

export function referralCounts(referrals: Referral[]) {
  const resolved = referrals.filter((r) => r.status === "resolved").length;
  const open = referrals.filter((r) => r.status !== "resolved" && r.status !== "cancelled").length;
  return { open, resolved };
}
