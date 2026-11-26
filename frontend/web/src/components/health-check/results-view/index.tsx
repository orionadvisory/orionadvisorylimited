"use client";

import { useState } from "react";
import Link from "next/link";
import { RotateCcw, Sparkles } from "lucide-react";
import { Chip } from "@orion/ui/components/ui/chip";
import { FlowTopBar, LogoChip } from "../shared/flow-chrome";
import { ghostPillClass, PillArrow, primaryPillClass } from "../shared/pill";
import { AuthGateModal } from "./auth-gate-modal";
import { DomainGrid } from "./domain-grid";
import { GuestCta } from "./guest-cta";
import { IssuesList } from "./issues-list";
import { NextActionsCard } from "./next-actions-card";
import { nextActions, sortedDomains } from "./results-model";
import { ScoreHero } from "./score-hero";
import { useResults } from "./use-results";

const WIDTH = "max-w-6xl";

export default function ResultsView() {
  const { result, retake } = useResults();
  const [showAuthGate, setShowAuthGate] = useState(false);

  if (!result) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-orion-canvas">
        <LogoChip className="animate-pulse motion-reduce:animate-none" />
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-mist">
          Loading results…
        </p>
      </div>
    );
  }

  const openGate = () => setShowAuthGate(true);

  return (
    <div className="min-h-svh bg-orion-canvas print:bg-white">
      {showAuthGate && <AuthGateModal onClose={() => setShowAuthGate(false)} />}

      <FlowTopBar
        title="Your Legal Health Report"
        width={WIDTH}
        className="print:static print:border-0 print:bg-transparent"
        aside={
          <>
            <Chip tone="teal" icon={<Sparkles aria-hidden="true" />} className="hidden md:inline-flex">
              AI-powered
            </Chip>
            <button type="button" onClick={retake} className={`${ghostPillClass} px-3 py-2 print:hidden`}>
              <RotateCcw className="size-3.5" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Retake</span>
            </button>
            <Link href="/signup" className={`${primaryPillClass} py-1 pl-4 pr-1 print:hidden`}>
              <span>
                <span className="sm:hidden">Save</span>
                <span className="hidden sm:inline">Sign up to save</span>
              </span>
              <PillArrow />
            </Link>
          </>
        }
      />

      <main className={`mx-auto space-y-10 px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8 ${WIDTH}`}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <ScoreHero result={result} className="lg:col-span-7" />
          <NextActionsCard actions={nextActions(result)} onAction={openGate} className="lg:col-span-5" />
        </div>

        <DomainGrid domains={sortedDomains(result.domainScores)} />

        <IssuesList issues={result.issues} onAction={openGate} />

        <GuestCta />
      </main>
    </div>
  );
}
