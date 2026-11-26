"use client";

import { Building2, ChevronLeft, FileText, Sparkles } from "lucide-react";
import { BentoCard } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { getRelevantDocuments } from "@orion/core/health-check/questions";
import type { ProfileData } from "@orion/core/health-check/types";
import { AnalysingScreen } from "../shared/analysing-screen";
import { FlowError, FlowFooter, FlowTopBar, SectionHeading } from "../shared/flow-chrome";
import { GhostPill, PrimaryPill } from "../shared/pill";
import { DocumentStep } from "./document-step";
import { ProfileStep } from "./profile-step";
import { useHealthCheckFlow } from "./use-health-check-flow";

const WIDTH = "max-w-3xl";

export default function HealthCheckFlow() {
  const flow = useHealthCheckFlow();
  const { step, profile } = flow;

  if (step === "analysing") {
    return (
      <AnalysingScreen
        title="Our legal team is reviewing your setup."
        description="Our AI — backed by 50 years of combined legal expertise — is analysing your profile and document gaps across 10 legal domains."
        startAt={0.35}
      />
    );
  }

  return (
    <div className="min-h-svh bg-orion-canvas">
      <FlowTopBar
        title="Legal Health Check"
        width={WIDTH}
        progress={flow.progressPercent}
        aside={<Chip tone="teal">{step === "profile" ? "1 · Profile" : "2 · Documents"}</Chip>}
        meta={
          <span>
            Step {flow.currentStep} of 2 · {step === "profile" ? "Your startup" : "Your documents"}
          </span>
        }
      />

      <main className={`mx-auto px-4 pb-36 pt-8 sm:px-6 ${WIDTH}`}>
        {step === "profile" ? (
          <>
            <SectionHeading
              eyebrow="Step 01 / 02"
              icon={<Building2 className="size-3.5" aria-hidden="true" />}
              title="Tell us about your startup"
              description="This helps us tailor the assessment to your situation."
            />
            <BentoCard padding="lg">
              <ProfileStep profile={profile} onChange={flow.handleProfileChange} />
            </BentoCard>
          </>
        ) : (
          <>
            <SectionHeading
              eyebrow="Step 02 / 02"
              icon={<FileText className="size-3.5" aria-hidden="true" />}
              title="Which documents do you have?"
              description={`Based on your profile, these are the documents relevant to your startup. Showing ${
                getRelevantDocuments(profile as ProfileData).length
              } documents.`}
            />
            <FlowError message={flow.error} className="mb-4" />
            <BentoCard padding="lg">
              <DocumentStep
                profile={profile as ProfileData}
                documentsHeld={flow.documentsHeld}
                onToggle={flow.handleDocToggle}
              />
            </BentoCard>
          </>
        )}
      </main>

      <FlowFooter width={WIDTH}>
        {step === "profile" ? (
          <>
            <span className="hidden font-mono text-[0.68rem] uppercase tracking-[0.14em] text-mist sm:inline">
              Takes about 3 minutes
            </span>
            <PrimaryPill
              className="ml-auto"
              onClick={() => flow.goTo("documents")}
              disabled={!flow.profileComplete}
            >
              <span className="sm:hidden">Next</span>
              <span className="hidden sm:inline">Next: Select your documents</span>
            </PrimaryPill>
          </>
        ) : (
          <>
            <GhostPill onClick={() => flow.goTo("profile")}>
              <ChevronLeft className="size-4" aria-hidden="true" />
              Back
            </GhostPill>
            <PrimaryPill onClick={flow.handleSubmit} icon={<Sparkles />}>
              Get AI assessment
            </PrimaryPill>
          </>
        )}
      </FlowFooter>
    </div>
  );
}
