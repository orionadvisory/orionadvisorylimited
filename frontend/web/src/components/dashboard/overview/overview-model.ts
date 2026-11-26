/**
 * Pure derivations for the founder overview. No React — unit-testable.
 * Input shapes mirror `DashboardData` from app/actions/dashboard.ts.
 */
import type { DashboardData } from "@/app/actions/dashboard";
import type { PillSegment } from "@orion/ui/components/ui/pill-segments";
import type { ChipTone } from "@orion/ui/components/ui/chip";

type Issue = DashboardData["issues"][number];
type HealthCheck = NonNullable<DashboardData["healthCheck"]>;

export const stageLabels: Record<string, string> = {
  idea: "Idea stage",
  pre_seed: "Pre-seed",
  seed: "Seed",
  series_a: "Series A",
  series_b: "Series B",
  growth: "Growth",
};

const severityOrder = ["critical", "high", "medium", "low", "info"];

export function severityRank(severity: string) {
  const i = severityOrder.indexOf(severity);
  return i === -1 ? severityOrder.length : i;
}

/** "employment_law" → "Employment law" */
export function formatDomain(domain: string) {
  const text = domain.replace(/[_-]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export interface ScoreBand {
  label: string;
  tone: ChipTone;
  /** Tailwind class for bars coloured by this band. */
  barClass: string;
}

export function scoreBand(score: number | null): ScoreBand {
  if (score === null) return { label: "Not assessed", tone: "neutral", barClass: "bg-line-strong" };
  if (score >= 80) return { label: "Strong", tone: "teal", barClass: "bg-brand" };
  if (score >= 60) return { label: "Good — room to improve", tone: "teal", barClass: "bg-brand" };
  if (score >= 40) return { label: "Needs attention", tone: "gold", barClass: "bg-gold" };
  return { label: "At risk", tone: "ember", barClass: "bg-ember" };
}

/** Open issues grouped by severity, for the segmented pill bar. */
export function severityBreakdown(issues: Issue[]): PillSegment[] {
  const open = issues.filter((i) => !i.isResolved);
  const count = (...sev: string[]) => open.filter((i) => sev.includes(i.severity)).length;
  return [
    { label: "Critical", value: count("critical"), tone: "ink" },
    { label: "High", value: count("high"), tone: "ember" },
    { label: "Medium", value: count("medium"), tone: "gold" },
    { label: "Low", value: count("low", "info"), tone: "muted" },
  ];
}

/** Weakest domains first, so the card leads with what needs work. */
export function weakestDomains(health: HealthCheck | null, limit = 5) {
  if (!health) return [];
  return Object.entries(health.domainScores)
    .map(([domain, v]) => ({
      domain,
      label: formatDomain(domain),
      score: Math.round(v.score),
      issues: v.issues,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}

export interface NextStep {
  id: string;
  label: string;
  meta: string;
  done: boolean;
  kind: "action" | "issue";
}

export interface NextStepsModel {
  /** Items to render (completed first, then the most urgent open ones). */
  visible: NextStep[];
  done: number;
  total: number;
  hiddenCount: number;
}

/**
 * Checklist for the ink anchor card. Priority actions from the latest health
 * check are open to-dos; legal issues are checked once resolved.
 */
export function buildNextSteps(
  health: HealthCheck | null,
  issues: Issue[],
  maxVisible = 6
): NextStepsModel {
  const actions: NextStep[] = (health?.priorityActions ?? []).map((label, i) => ({
    id: `action-${i}`,
    label,
    meta: "Priority action",
    done: false,
    kind: "action" as const,
  }));

  const issueSteps: NextStep[] = [...issues]
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
    .map((issue) => ({
      id: issue.id,
      label: issue.title,
      meta: `${formatDomain(issue.severity)} · ${formatDomain(issue.domain)}`,
      done: issue.isResolved,
      kind: "issue" as const,
    }));

  const all = [...actions, ...issueSteps];
  const doneItems = all.filter((s) => s.done);
  const openItems = all.filter((s) => !s.done);

  const doneShown = doneItems.slice(0, Math.min(2, maxVisible));
  const openShown = openItems.slice(0, maxVisible - doneShown.length);
  const visible = [...doneShown, ...openShown];

  return {
    visible,
    done: doneItems.length,
    total: all.length,
    hiddenCount: all.length - visible.length,
  };
}

export function greetingFor(date: Date) {
  const h = date.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function formatShortDate(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
