import { Card, CardContent } from "@orion/ui/components/ui/card";
import { FileText, AlertTriangle, TrendingUp, Shield } from "lucide-react";

interface StatsGridProps {
  documentCount: number;
  issueCount: number;
  criticalCount: number;
  riskScore: number | null;
}

export default function StatsGrid({
  documentCount,
  issueCount,
  criticalCount,
  riskScore,
}: StatsGridProps) {
  const scoreLabel =
    riskScore === null
      ? "Not assessed"
      : riskScore >= 80
        ? "Strong"
        : riskScore >= 60
          ? "Good - room to improve"
          : riskScore >= 40
            ? "Needs attention"
            : "At risk";

  const stats = [
    {
      label: "Documents",
      value: String(documentCount),
      sub: documentCount === 0 ? "Generate your first" : `${documentCount} generated`,
      icon: FileText,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Active Issues",
      value: String(issueCount),
      sub: issueCount === 0 ? "All clear" : `${criticalCount} critical/high`,
      icon: AlertTriangle,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Critical Actions",
      value: String(criticalCount),
      sub: criticalCount === 0 ? "No urgent items" : "Requires attention",
      icon: Shield,
      color: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
    {
      label: "Legal Health",
      value: riskScore !== null ? String(riskScore) : "--",
      sub: scoreLabel,
      icon: TrendingUp,
      color: "text-teal-700",
      bg: "bg-teal-50",
      border: "border-teal-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-stone-200/80 bg-white/85 shadow-md shadow-stone-900/[0.04] backdrop-blur">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{stat.value}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{stat.sub}</p>
                </div>
                <div className={`w-10 h-10 ${stat.bg} ${stat.border} rounded-lg border flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
