"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import type { ProfileData } from "@orion/core/health-check/types";
import { AssessmentTopbar } from "../onboarding-assessment/assessment-topbar";
import { FrostedFooter } from "../parts/frosted-footer";
import { GhostPill, PrimaryPill } from "../parts/pill-buttons";
import { ProcessingScreen } from "../parts/processing-screen";
import { DocumentsStep } from "./documents-step";
import { ProfileStep } from "./profile-step";
import { useOnboardingFlow } from "./use-onboarding-flow";

const ANALYSIS_STEPS = [
  "Reading your profile",
  "Checking your documents",
  "Scoring 10 legal domains",
  "Prioritising what matters",
  "Building your dashboard",
];

export default function OnboardingFlow() {
  const f = useOnboardingFlow();

  if (f.step === "analysing") {
    return (
      <ProcessingScreen
        title="Preparing your"
        accent="legal health report"
        description="Our AI legal team is analysing your profile and documents across 10 legal domains to generate your personalised dashboard."
        steps={ANALYSIS_STEPS}
      />
    );
  }

  const isProfile = f.step === "profile";

  return (
    <div className="min-h-svh">
      <AssessmentTopbar
        title="Set up your account"
        progress={{
          percent: isProfile ? 50 : 100,
          status: isProfile ? "Step 1 of 2 · Your startup" : "Step 2 of 2 · Your documents",
        }}
      />

      <main className="mx-auto max-w-3xl px-4 pb-32 pt-8 sm:px-6 lg:pt-12">
        {isProfile ? (
          <ProfileStep
            companyName={f.companyName}
            onCompanyNameChange={f.setCompanyName}
            profile={f.profile}
            onProfileChange={f.handleProfileChange}
          />
        ) : (
          <DocumentsStep
            profile={f.profile as ProfileData}
            documentsHeld={f.documentsHeld}
            onToggle={f.handleDocToggle}
            error={f.error}
          />
        )}
      </main>

      <FrostedFooter
        className="max-w-3xl"
        start={isProfile ? undefined : <GhostPill onClick={() => f.setStep("profile")}>Back</GhostPill>}
        hint={isProfile && !f.profileComplete ? "Answer every question to continue" : undefined}
        end={
          isProfile ? (
            <PrimaryPill onClick={() => f.setStep("documents")} disabled={!f.profileComplete} icon={<ChevronRight />}>
              Next: Select your documents
            </PrimaryPill>
          ) : (
            <PrimaryPill onClick={f.handleSubmit} icon={<Sparkles />}>
              Get my legal health score
            </PrimaryPill>
          )
        }
      />
    </div>
  );
}
