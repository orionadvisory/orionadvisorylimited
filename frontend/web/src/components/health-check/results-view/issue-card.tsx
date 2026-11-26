"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, FileText, Users } from "lucide-react";
import { BentoCard } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { cn } from "@orion/ui/utils";
import type { IssueFinding } from "@orion/core/health-check/types";
import { domainLabel, resolutionLabels, severityConfig } from "./results-model";

const resolutionIcons = {
  self_serve: <CheckCircle2 aria-hidden="true" />,
  document_generation: <FileText aria-hidden="true" />,
  expert_referral: <Users aria-hidden="true" />,
};

const severityRail: Record<IssueFinding["severity"], string> = {
  critical: "bg-ember-deep",
  high: "bg-ember",
  medium: "bg-gold",
  low: "bg-brand",
  info: "bg-line-strong",
};

/** One finding: severity rail, title, description, resolution chip; expands to the fix. */
export function IssueCard({ issue, onAction }: { issue: IssueFinding; onAction: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const severity = severityConfig[issue.severity];
  const panelId = `issue-${issue.id}-fix`;

  return (
    <BentoCard as="article" padding="none" className="overflow-hidden break-inside-avoid">
      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-1", severityRail[issue.severity])} />
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="focus-ring flex w-full items-start gap-3 rounded-bento p-5 pl-6 text-left"
      >
        <span className="block min-w-0 flex-1">
          <span className="mb-2 flex flex-wrap items-center gap-1.5">
            <Chip tone={severity.tone} className={severity.className}>
              {severity.label}
            </Chip>
            <Chip icon={resolutionIcons[issue.resolutionPath]}>{resolutionLabels[issue.resolutionPath]}</Chip>
            <span className="ml-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-mist">
              {domainLabel(issue.domain)}
            </span>
          </span>
          <span className="block text-[0.95rem] font-semibold leading-6 tracking-tight text-ink">{issue.title}</span>
          <span className={cn("mt-1 block text-sm leading-6 text-mist", !expanded && "line-clamp-2 print:line-clamp-none")}>
            {issue.description}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-line text-mist transition-colors print:hidden"
        >
          <ChevronDown className={cn("size-4 transition-transform duration-300", expanded && "rotate-180")} />
        </span>
      </button>

      <div id={panelId} className={cn("px-5 pb-5 pl-6", expanded ? "block" : "hidden print:block")}>
        <div className="rounded-bento-sm bg-canvas p-4">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand">Recommended fix</p>
          <p className="mt-1.5 text-sm font-semibold text-ink">{issue.recommendation.title}</p>
          <p className="mt-1 text-sm leading-6 text-ink-soft">{issue.recommendation.description}</p>
          <button
            type="button"
            onClick={onAction}
            className="focus-ring group mt-4 inline-flex items-center gap-2 rounded-full bg-ink py-1 pl-4 pr-1 text-sm font-medium text-cloud transition-colors hover:bg-brand print:hidden"
          >
            Take action
            <span className="grid size-7 place-items-center rounded-full bg-cloud text-brand transition-transform duration-500 group-hover:-rotate-45">
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>
    </BentoCard>
  );
}
