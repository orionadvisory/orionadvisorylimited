"use client";

import { ChevronLeft, Sparkles } from "lucide-react";
import { Chip } from "@orion/ui/components/ui/chip";
import {
  type Section,
  type Question,
  QuestionCard,
} from "@/components/assessment/question-field";
import { SectionNav } from "@/components/assessment/section-nav";
import { AnalysingScreen } from "../shared/analysing-screen";
import { FlowError, FlowFooter, FlowTopBar, SectionHeading } from "../shared/flow-chrome";
import { GhostPill, PrimaryPill } from "../shared/pill";
import { CompleteScreen } from "./complete-screen";
import { useAssessmentFlow, type AssessmentTemplate } from "./use-assessment-flow";

interface AssessmentFlowProps {
  template: AssessmentTemplate;
  sections: Section[];
  questions: Question[];
}

const pad = (n: number) => String(n).padStart(2, "0");

export function AssessmentFlow({ template, sections, questions }: AssessmentFlowProps) {
  const flow = useAssessmentFlow(template, sections, questions);
  const {
    answers,
    currentSection,
    currentSectionIdx,
    totalSections,
    answeredCount,
    visibleTotal,
  } = flow;

  if (flow.submitted) {
    return (
      <CompleteScreen
        answeredCount={answeredCount}
        visibleTotal={visibleTotal}
        totalSections={totalSections}
      />
    );
  }

  if (flow.submitting) {
    return (
      <AnalysingScreen
        title="Analysing your responses."
        description="Our AI is reviewing your legal health across every domain — company structure, equity, people, IP, contracts and compliance."
        startAt={visibleTotal > 0 ? (answeredCount / visibleTotal) * 0.5 : 0.2}
      />
    );
  }

  return (
    <div className="min-h-svh bg-orion-canvas">
      <FlowTopBar
        title={template.name}
        progress={flow.progressPercent}
        aside={
          <Chip tone="teal" className="hidden sm:inline-flex">
            Free · no signup
          </Chip>
        }
        meta={
          <>
            <span className="truncate">
              Section {currentSectionIdx + 1} of {totalSections} · {answeredCount} of {visibleTotal}{" "}
              answered
            </span>
            <span className="hidden tabular-nums sm:inline">{Math.round(flow.progressPercent)}%</span>
          </>
        }
      />

      <div className="mx-auto max-w-5xl px-4 pb-36 sm:px-6">
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:gap-10">
          <SectionNav
            sections={sections}
            questions={questions}
            answers={answers}
            currentIndex={currentSectionIdx}
            onNavigate={flow.handleNavigate}
          />

          <main className="min-w-0 flex-1">
            <SectionHeading
              eyebrow={`Section ${pad(currentSectionIdx + 1)} / ${pad(totalSections)}`}
              title={currentSection.title}
              description={currentSection.description}
            />

            <div className="space-y-4">
              {flow.visibleQuestions.map((question, qi) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={qi + 1}
                  value={answers[question.questionKey]}
                  onChange={flow.handleChange}
                  assessmentId={flow.assessmentId}
                  attachmentValue={answers[`${question.questionKey}__file`]}
                  answers={answers}
                />
              ))}
            </div>

            <FlowError message={flow.error} className="mt-6" />
          </main>
        </div>
      </div>

      <FlowFooter>
        <GhostPill onClick={flow.handleBack} disabled={currentSectionIdx === 0}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back
        </GhostPill>

        {flow.isLastSection ? (
          <PrimaryPill
            onClick={flow.handleSubmit}
            disabled={!flow.sectionComplete}
            icon={<Sparkles />}
          >
            Submit assessment
          </PrimaryPill>
        ) : (
          <PrimaryPill onClick={flow.handleNext} disabled={!flow.sectionComplete}>
            <span className="sm:hidden">Next</span>
            <span className="hidden sm:inline">Next section</span>
          </PrimaryPill>
        )}
      </FlowFooter>
    </div>
  );
}
