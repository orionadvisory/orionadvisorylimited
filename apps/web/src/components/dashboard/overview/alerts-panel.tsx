import { Card, CardContent, CardHeader, CardTitle } from "@orion/ui/components/ui/card";
import { AlertTriangle, CheckCircle2, Info, Zap } from "lucide-react";
import Link from "next/link";

interface Issue {
  id: string;
  title: string;
  severity: string;
  domain: string;
  isResolved: boolean;
}

const severityConfig: Record<string, { icon: typeof AlertTriangle; bg: string; iconClass: string }> = {
  critical: { icon: AlertTriangle, bg: "bg-rose-50 border-rose-100", iconClass: "text-rose-700" },
  high: { icon: AlertTriangle, bg: "bg-amber-50 border-amber-100", iconClass: "text-amber-700" },
  medium: { icon: Info, bg: "bg-teal-50 border-teal-100", iconClass: "text-teal-700" },
  low: { icon: CheckCircle2, bg: "bg-stone-50 border-stone-100", iconClass: "text-stone-500" },
  info: { icon: Info, bg: "bg-stone-50 border-stone-100", iconClass: "text-stone-500" },
};

export default function AlertsPanel({ issues }: { issues: Issue[] }) {
  // Show top 5 by severity
  const severityOrder = ["critical", "high", "medium", "low", "info"];
  const sorted = [...issues]
    .sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity))
    .slice(0, 5);

  return (
    <Card className="h-full border-stone-200/80 bg-white/85 shadow-md shadow-stone-900/[0.04] backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-stone-950">Alerts</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Zap className="w-4 h-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-emerald-900">No active issues</p>
            <p className="text-xs text-emerald-700/80 mt-1">
              Run a health check to assess your legal standing
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((issue) => {
              const config = severityConfig[issue.severity] || severityConfig.info;
              const Icon = config.icon;
              return (
                <div
                  key={issue.id}
                  className={`p-3.5 rounded-lg border ${config.bg}`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
                    <div>
                      <p className="text-xs font-semibold text-stone-950">{issue.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5 capitalize">
                        {issue.severity} / {issue.domain.replace("_", " ")}
                      </p>
                      <Link
                        href="/dashboard/ai"
                        className="text-xs text-emerald-700 font-medium mt-1.5 hover:underline inline-block"
                      >
                        Ask AI for help
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
