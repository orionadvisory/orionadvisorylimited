import { CalendarClock, Inbox, Quote } from "lucide-react";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { cn } from "@orion/ui/utils";
import {
  STATUS_STEPS,
  domainLabel,
  severityOf,
  statusOf,
  type Referral,
} from "./referral-model";

function StatusTrack({ step }: { step: number }) {
  if (step === 0) return null;
  return (
    <ol className="mt-3 flex gap-1" aria-label={`Progress: ${STATUS_STEPS[step - 1]}`}>
      {STATUS_STEPS.map((label, i) => (
        <li
          key={label}
          title={label}
          className={cn("h-1 flex-1 rounded-full", i < step ? "bg-brand" : "bg-canvas-deep")}
        >
          <span className="sr-only">
            {label}
            {i < step ? " (done)" : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** "Your requests" — referrals as a vertical status timeline. */
export function ReferralTimeline({
  referrals,
  className,
}: {
  referrals: Referral[];
  className?: string;
}) {
  return (
    <BentoCard as="section" aria-labelledby="your-requests-title" className={className}>
      <BentoCardHeader
        title={<span id="your-requests-title">Your Referral Requests</span>}
        description={
          referrals.length > 0
            ? `${referrals.length} request${referrals.length === 1 ? "" : "s"}`
            : "Requests you send will appear here"
        }
        icon={
          <IconChip tone="canvas">
            <CalendarClock />
          </IconChip>
        }
      />

      {referrals.length === 0 ? (
        <div className="mt-5 flex items-center gap-3 rounded-bento-sm bg-canvas p-4">
          <IconChip tone="white" size="sm">
            <Inbox />
          </IconChip>
          <p className="font-display text-lg leading-snug text-ink-soft">No requests yet.</p>
        </div>
      ) : (
        <ol className="relative mt-6 space-y-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-line">
          {referrals.map((ref) => {
            const status = statusOf(ref.status);
            const sev = severityOf(ref.issueSeverity);
            return (
              <li key={ref.id} className="relative pl-7">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-0 top-1.5 size-[15px] rounded-full border-[3px] border-white shadow-[0_0_0_1px_var(--color-line)]",
                    status.dot
                  )}
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  <Chip tone={status.tone}>{status.label}</Chip>
                  <Chip tone={sev.tone} className={sev.className}>
                    {sev.label}
                  </Chip>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mist">
                    {domainLabel(ref.issueDomain)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium leading-5 text-ink">{ref.issueTitle}</p>
                <p className="mt-0.5 text-xs text-mist">
                  Requested {new Date(ref.createdAt).toLocaleDateString()}
                </p>
                <StatusTrack step={status.step} />
                {ref.providerNotes && (
                  <figure className="mt-3 rounded-bento-sm border border-brand/10 bg-brand-soft p-4">
                    <Quote className="size-4 text-brand" aria-hidden="true" />
                    <blockquote className="mt-1.5 font-display text-lg leading-snug text-ink">
                      {ref.providerNotes}
                    </blockquote>
                    <figcaption className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-brand">
                      Expert note
                    </figcaption>
                  </figure>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </BentoCard>
  );
}
