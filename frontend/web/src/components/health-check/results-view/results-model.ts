import type { PillSegment } from "@orion/ui/components/ui/pill-segments";
import type { ChipTone } from "@orion/ui/components/ui/chip";
import type { HealthCheckResult, IssueFinding } from "@orion/core/health-check/types";

export type Severity = IssueFinding["severity"];

export const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

/** Chip styling per severity: critical → ember (filled), high → ember-soft, medium → gold, low → teal. */
export const severityConfig: Record<Severity, { label: string; tone: ChipTone; className?: string }> = {
  critical: { label: "Critical", tone: "ember", className: "bg-ember-deep text-white" },
  high: { label: "High", tone: "ember" },
  medium: { label: "Medium", tone: "gold" },
  low: { label: "Low", tone: "teal" },
  info: { label: "Info", tone: "neutral" },
};

/** Risk chip in the hero follows the same scale. */
export function riskTone(risk: Severity): ChipTone {
  if (risk === "critical" || risk === "high") return "ember";
  if (risk === "medium") return "gold";
  return "teal";
}

export const resolutionLabels: Record<IssueFinding["resolutionPath"], string> = {
  self_serve: "Self-serve",
  document_generation: "Generate document",
  expert_referral: "Expert help needed",
};

export const domainLabels: Record<string, string> = {
  incorporation: "Incorporation & Structure",
  equity: "Equity & Founders",
  governance: "Governance",
  employment: "Employment & Contractors",
  ip: "Intellectual Property",
  contracts: "Contracts & Agreements",
  data_privacy: "Data & Privacy",
  regulation: "Regulation",
  tax: "Tax",
  investment_readiness: "Investment Readiness",
};

export const domainLabel = (d: string) => {
  const label = domainLabels[d.toLowerCase()] || d.replace(/_/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Same bands as the dashboard health score card. */
export function scoreBand(score: number): { label: string; tone: ChipTone; barClass: string } {
  if (score >= 80) return { label: "Strong", tone: "teal", barClass: "bg-brand" };
  if (score >= 60) return { label: "Good — room to improve", tone: "teal", barClass: "bg-brand" };
  if (score >= 40) return { label: "Needs attention", tone: "gold", barClass: "bg-gold" };
  return { label: "At risk", tone: "ember", barClass: "bg-ember" };
}

/** Issues by severity for the segmented bar (matches the dashboard's mapping). */
export function severityBreakdown(issues: IssueFinding[]): PillSegment[] {
  const count = (...sev: Severity[]) => issues.filter((i) => sev.includes(i.severity)).length;
  return [
    { label: "Critical", value: count("critical"), tone: "ink" },
    { label: "High", value: count("high"), tone: "ember" },
    { label: "Medium", value: count("medium"), tone: "gold" },
    { label: "Low", value: count("low", "info"), tone: "muted" },
  ];
}

export function groupIssues(issues: IssueFinding[]) {
  return SEVERITY_ORDER.map((severity) => ({
    severity,
    issues: issues.filter((i) => i.severity === severity),
  })).filter((g) => g.issues.length > 0);
}

/** Weakest domain first. */
export function sortedDomains(domainScores: HealthCheckResult["domainScores"]) {
  return Object.entries(domainScores)
    .filter(([, v]) => v !== undefined)
    .sort((a, b) => (a[1].score ?? 100) - (b[1].score ?? 100));
}

/** "What to do next" rows: the AI's priority actions, or the top recommendations as a fallback. */
export function nextActions(result: HealthCheckResult): string[] {
  if (result.priorityActions && result.priorityActions.length > 0) return result.priorityActions;
  return groupIssues(result.issues)
    .flatMap((g) => g.issues)
    .slice(0, 4)
    .map((i) => i.recommendation.title);
}
