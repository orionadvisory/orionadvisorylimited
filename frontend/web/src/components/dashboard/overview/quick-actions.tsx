import Link from "next/link";
import { ArrowUpRight, FileText, GitBranch, Sparkles, Users } from "lucide-react";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";

const actions = [
  { href: "/dashboard/ai", icon: Sparkles, label: "Ask Orion AI", sub: "Your legal co-pilot", tone: "teal" },
  { href: "/dashboard/documents", icon: FileText, label: "Generate a document", sub: "AI-drafted agreements", tone: "gold" },
  { href: "/dashboard/workflows", icon: GitBranch, label: "Continue a workflow", sub: "Step-by-step guides", tone: "canvas" },
  { href: "/dashboard/referrals", icon: Users, label: "Talk to an expert", sub: "Vetted legal partners", tone: "ember" },
] as const;

export default function QuickActions({ className }: { className?: string }) {
  return (
    <BentoCard as="section" aria-labelledby="quick-actions-title" className={className}>
      <BentoCardHeader title={<span id="quick-actions-title">Quick actions</span>} />
      <ul className="mt-4 space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.href}>
              <Link
                href={action.href}
                className="focus-ring group flex items-center gap-3 rounded-full p-1.5 pr-4 transition-colors hover:bg-canvas"
              >
                <IconChip tone={action.tone}>
                  <Icon />
                </IconChip>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{action.label}</span>
                  <span className="block truncate text-xs text-mist">{action.sub}</span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-mist transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </BentoCard>
  );
}
