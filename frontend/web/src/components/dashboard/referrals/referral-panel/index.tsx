"use client";

import { StatNumeral } from "@orion/ui/components/ui/stat-numeral";
import { PageHero } from "@/components/dashboard/shared/page-hero";
import { HowItWorksCard } from "./how-it-works-card";
import { ReferralTimeline } from "./referral-timeline";
import { referralCounts } from "./referral-model";
import { RequestForm } from "./request-form";
import { StatusBanner } from "./status-banner";
import { useReferrals } from "./use-referrals";

function HeroNumerals({ open, resolved }: { open: number | string; resolved: number | string }) {
  return (
    <dl className="flex gap-8">
      <div>
        <dt className="sr-only">Open requests</dt>
        <dd>
          <StatNumeral value={open} label="Open requests" size="lg" />
        </dd>
      </div>
      <div>
        <dt className="sr-only">Resolved</dt>
        <dd>
          <StatNumeral value={resolved} label="Resolved" size="lg" />
        </dd>
      </div>
    </dl>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12" aria-busy="true" aria-label="Loading expert help">
      <div className="h-80 animate-pulse rounded-bento bg-white/70 xl:col-span-7" />
      <div className="space-y-4 xl:col-span-5">
        <div className="h-56 animate-pulse rounded-bento bg-ink/90" />
        <div className="h-40 animate-pulse rounded-bento bg-white/70" />
      </div>
    </div>
  );
}

export default function ReferralPanel() {
  const { issues, referralsList, loading, submitting, success, error, handleSubmit } = useReferrals();
  const counts = referralCounts(referralsList);

  return (
    <div className="space-y-8">
      <PageHero
        kicker="Workspace · Expert help"
        title={
          <>
            Expert <em>help</em>
          </>
        }
        description="Get matched with qualified legal professionals for the issues Orion can't close on its own."
        aside={
          loading ? (
            <HeroNumerals open="—" resolved="—" />
          ) : (
            <HeroNumerals open={counts.open} resolved={counts.resolved} />
          )
        }
      />

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
          <div className="space-y-4 xl:col-span-7">
            <StatusBanner tone="success" message={success} />
            <StatusBanner tone="error" message={error} />
            <RequestForm issues={issues} onSubmit={handleSubmit} submitting={submitting} />
          </div>
          <div className="space-y-4 xl:col-span-5">
            <HowItWorksCard />
            <ReferralTimeline referrals={referralsList} />
          </div>
        </div>
      )}
    </div>
  );
}
