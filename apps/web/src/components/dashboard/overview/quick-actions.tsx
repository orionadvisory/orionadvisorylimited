import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@orion/ui/components/ui/card";
import { GitBranch, Sparkles, FileText } from "lucide-react";

const actions = [
  {
    href: "/dashboard/workflows",
    icon: GitBranch,
    label: "Continue Workflow",
    sub: "Incorporation Flow",
    tone: "emerald",
  },
  {
    href: "/dashboard/ai",
    icon: Sparkles,
    label: "Ask AI",
    sub: "Legal co-pilot",
    tone: "amber",
  },
  {
    href: "/dashboard/documents",
    icon: FileText,
    label: "Generate Document",
    sub: "AI-powered drafts",
    tone: "teal",
  },
];

const toneClasses = {
  emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-700 group-hover:border-emerald-200",
  amber: "border-amber-100 bg-amber-50/70 text-amber-700 group-hover:border-amber-200",
  teal: "border-teal-100 bg-teal-50/70 text-teal-700 group-hover:border-teal-200",
};

export default function QuickActions() {
  return (
    <Card className="border-stone-200/80 bg-white/85 shadow-md shadow-stone-900/[0.04] backdrop-blur">
      <CardHeader>
        <CardTitle className="text-stone-950">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="group">
                <div className="flex h-full w-full items-center gap-3 rounded-lg border border-stone-200 bg-stone-50/50 p-4 text-left transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-md hover:shadow-stone-900/[0.06] sm:block">
                  <span className={`mb-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border sm:mb-3 ${toneClasses[action.tone as keyof typeof toneClasses]}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-stone-950">{action.label}</span>
                    <span className="mt-0.5 block text-xs text-stone-500">{action.sub}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
