"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";
import { IssueTile } from "./issue-tile";
import { expertIssuesOf, type Issue } from "./referral-model";

export function RequestForm({
  issues,
  onSubmit,
  submitting,
  className,
}: {
  issues: Issue[];
  onSubmit: (issueId: string, summary: string) => void;
  submitting: boolean;
  className?: string;
}) {
  const [selectedIssue, setSelectedIssue] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");

  const expertIssues = expertIssuesOf(issues);
  const selected = expertIssues.find((i) => i.id === selectedIssue);

  const handleSubmit = () => {
    if (!selectedIssue || !selected) return;
    const summary = `Issue: ${selected.title}\nDomain: ${selected.domain}\nSeverity: ${selected.severity}\nDescription: ${selected.description}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ""}`;
    onSubmit(selectedIssue, summary);
  };

  if (expertIssues.length === 0) {
    return (
      <BentoCard as="section" padding="lg" className={className}>
        <div className="flex flex-col items-start gap-4 rounded-bento-sm bg-canvas p-6 sm:p-8">
          <IconChip tone="teal" size="lg">
            <CheckCircle2 />
          </IconChip>
          <h2 className="font-display text-3xl leading-tight tracking-tight text-ink">
            Nothing needs an expert <em className="text-brand">right now</em>
          </h2>
          <p className="max-w-md text-sm leading-6 text-ink-soft">
            Complete a legal health check to identify issues, or all your critical issues have been
            resolved.
          </p>
          <Link
            href="/health-check"
            className="focus-ring group inline-flex items-center gap-3 rounded-full bg-ink py-1.5 pl-5 pr-1.5 text-sm font-medium text-cloud transition-colors hover:bg-brand"
          >
            Take the health check
            <span className="grid size-8 place-items-center rounded-full bg-cloud text-brand transition-transform duration-500 group-hover:-rotate-45">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard as="section" aria-labelledby="request-help-title" padding="lg" className={className}>
      <BentoCardHeader
        title={<span id="request-help-title">Request Expert Help</span>}
        description="Select an issue and we'll connect you with a qualified legal professional"
        icon={
          <IconChip tone="teal">
            <Send />
          </IconChip>
        }
      />

      <div className="mt-6 space-y-6">
        <fieldset>
          <legend className="mb-3 flex w-full items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.18em] text-mist">
            <span>Select an issue</span>
            <span className="tabular-nums">{expertIssues.length} eligible</span>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {expertIssues.map((issue) => (
              <IssueTile
                key={issue.id}
                issue={issue}
                selected={selectedIssue === issue.id}
                onSelect={() => setSelectedIssue(issue.id)}
              />
            ))}
          </div>
        </fieldset>

        {selectedIssue && (
          <label className="block">
            <span className="mb-2 block font-mono text-[0.68rem] uppercase tracking-[0.18em] text-mist">
              Additional context (optional)
            </span>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Any additional details that would help the expert..."
              rows={4}
              className="w-full resize-none rounded-2xl border border-line bg-white/80 px-4 py-3.5 text-[0.95rem] text-ink shadow-[0_1px_0_rgba(12,26,23,0.03)] outline-none transition-all placeholder:text-mist/50 hover:border-line-strong focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
            />
          </label>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedIssue || submitting}
          className="focus-ring group flex w-full items-center justify-between rounded-full bg-ink py-2 pl-6 pr-2 font-medium text-cloud shadow-[0_18px_40px_-14px_rgba(12,26,23,0.55)] transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:bg-ink/40 disabled:shadow-none disabled:hover:bg-ink/40"
        >
          <span>{submitting ? "Submitting..." : "Request Expert Help"}</span>
          <span className="grid size-10 place-items-center rounded-full bg-cloud text-brand transition-transform duration-500 group-enabled:group-hover:-rotate-45">
            {submitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="size-4" aria-hidden="true" />
            )}
          </span>
        </button>
        {!selectedIssue && (
          <p className="-mt-3 text-center text-xs text-mist">Pick an issue above to continue.</p>
        )}
      </div>
    </BentoCard>
  );
}
