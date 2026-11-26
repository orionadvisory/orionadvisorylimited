"use client";

import { Sparkles } from "lucide-react";
import { QuestionCard } from "@/components/assessment/question-field";
import { SectionNav } from "@/components/assessment/section-nav";
import { DraftStatus } from "@/components/assessment/draft-status";
import { SaveExitButton } from "@/components/assessment/save-exit-button";
import { FrostedFooter } from "../parts/frosted-footer";
import { GhostPill, PrimaryPill } from "../parts/pill-buttons";
import { FormError } from "../parts/form-error";
import { ProcessingScreen } from "../parts/processing-screen";
import { AssessmentTopbar } from "./assessment-topbar";
import { SectionHeading } from "./section-heading";
import { SkyProgressCard } from "./sky-progress-card";
import { StartupNameStep } from "./startup-name-step";
import { useOnboardingAssessment, type OnboardingAssessmentProps } from "./use-onboarding-assessment";

const ANALYSIS_STEPS = [
  "Reading your answers",
  "Scoring each legal domain",
  "Spotting gaps and risks",
  "Prioritising your next steps",
  "Building your dashboard",
];

export function OnboardingAssessment(props: OnboardingAssessmentProps) {
  const a = useOnboardingAssessment(props);
  const { draft } = a;

  if (!draft.loaded) {
    return (
      <div className="flex min-h-svh items-center justify-center" role="status" aria-label="Loading your assessment">
        <span className="relative flex size-3">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand/50 motion-reduce:hidden" />
          <span className="relative inline-flex size-3 rounded-full bg-brand" />
        </span>
      </div>
    );
  }

  if (a.submitting) {
    return (
      <ProcessingScreen
        title="Charting your"
        accent="legal health"
        description="Our AI is reviewing your legal health across all domains to build your personalised dashboard."
        steps={ANALYSIS_STEPS}
      />
    );
  }

  if (!a.startupName) {
    return <StartupNameStep onContinue={(name) => draft.setAnswer("__startup_name", name)} />;
  }

  return (
    <div className="min-h-svh">
      <AssessmentTopbar
        title="Legal Health Check"
        actions={
          <>
            <span className="hidden sm:inline-flex">
              <DraftStatus state={draft.saveState} lastSavedAt={draft.lastSavedAt} />
            </span>
            <SaveExitButton onSave={draft.flushSave} />
          </>
        }
        progress={{
          percent: a.progressPercent,
          status: `Section ${draft.currentSectionIdx + 1} of ${a.totalSections} · ${a.answeredCount} of ${a.visibleCount} answered`,
        }}
      />

      <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:pt-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
          <SectionNav
            sections={props.sections}
            questions={props.questions}
            answers={draft.answers}
            currentIndex={draft.currentSectionIdx}
            onNavigate={a.goToSection}
            footer={<SkyProgressCard percent={a.progressPercent} />}
          />

          <main className="min-w-0 max-w-3xl flex-1">
            {a.currentSection && (
              <SectionHeading
                index={draft.currentSectionIdx}
                total={a.totalSections}
                title={a.currentSection.title}
                description={a.currentSection.description}
              />
            )}

            <div className="space-y-4">
              {a.visibleQuestions.map((question, qi) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={qi + 1}
                  value={draft.answers[question.questionKey]}
                  onChange={draft.setAnswer}
                  assessmentId={a.assessmentId}
                  attachmentValue={draft.answers[`${question.questionKey}__file`]}
                  answers={draft.answers}
                />
              ))}
            </div>

            <FormError message={a.error} className="mt-6" />
          </main>
        </div>
      </div>

      <FrostedFooter
        start={
          <GhostPill onClick={a.handleBack} disabled={draft.currentSectionIdx === 0}>
            Back
          </GhostPill>
        }
        hint={a.sectionComplete ? undefined : "Answer the required questions to continue"}
        end={
          a.isLastSection ? (
            <PrimaryPill onClick={a.handleSubmit} disabled={!a.sectionComplete} icon={<Sparkles />}>
              Submit &amp; Build Dashboard
            </PrimaryPill>
          ) : (
            <PrimaryPill onClick={a.handleNext} disabled={!a.sectionComplete}>
              Next Section
            </PrimaryPill>
          )
        }
      />
    </div>
  );
}
