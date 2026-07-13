"use client";

import { useMemo, useState, useEffect } from "react";
import { Logo } from "@orion/ui/components/ui/logo";
import { useRouter } from "next/navigation";
import { Button } from "@orion/ui/components/ui/button";
import { Badge } from "@orion/ui/components/ui/badge";
import { Progress } from "@orion/ui/components/ui/progress";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  type Section,
  type Question,
  shouldShow,
  QuestionCard,
} from "@/components/assessment/question-field";
import { SectionNav } from "@/components/assessment/section-nav";
import { useAssessmentDraft } from "@/components/assessment/use-assessment-draft";
import { DraftStatus } from "@/components/assessment/draft-status";
import { SaveExitButton } from "@/components/assessment/save-exit-button";

interface OnboardingAssessmentProps {
  template: { id: string; name: string; description: string | null };
  sections: Section[];
  questions: Question[];
}

// Safely read a JSON response. If the server returns non-JSON (e.g. a Vercel
// timeout/error HTML page), surface a clear message instead of a raw
// "Unexpected token '<'" JSON parse error.
async function readJson(res: Response, fallbackMessage: string) {
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.error || fallbackMessage);
    return data;
  } catch (e) {
    if (e instanceof Error && e.message && !e.message.includes("JSON")) throw e;
    if (res.status === 504 || res.status === 408) {
      throw new Error("This took too long and timed out. Please try again.");
    }
    throw new Error(`${fallbackMessage} (server error ${res.status}).`);
  }
}

export function OnboardingAssessment({
  template,
  sections,
  questions,
}: OnboardingAssessmentProps) {
  const router = useRouter();
  const draft = useAssessmentDraft({ templateId: template.id });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [assessmentId, setAssessmentId] = useState<string | undefined>();

  // Start or resume an in-progress assessment record (used for file uploads)
  useEffect(() => {
    fetch("/api/assessments/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: template.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.assessmentId) setAssessmentId(data.assessmentId);
      })
      .catch(() => {});
  }, [template.id]);

  const questionsBySection = useMemo(() => {
    const map = new Map<string, Question[]>();
    for (const s of sections) {
      map.set(
        s.id,
        questions.filter((q) => q.sectionId === s.id)
      );
    }
    return map;
  }, [sections, questions]);

  const totalSections = sections.length;
  const currentSection = sections[draft.currentSectionIdx];
  const currentQuestions = currentSection
    ? questionsBySection.get(currentSection.id) ?? []
    : [];
  const visibleQuestions = currentQuestions.filter((q) =>
    shouldShow(q, draft.answers)
  );

  const sectionComplete = visibleQuestions
    .filter((q) => q.required)
    .every((q) => {
      const val = draft.answers[q.questionKey];
      const fileVal = draft.answers[`${q.questionKey}__file`];
      if (fileVal) return true;
      if (Array.isArray(val)) return val.length > 0;
      return !!val;
    });

  const allVisibleQuestions = questions.filter((q) =>
    shouldShow(q, draft.answers)
  );
  const answeredCount = allVisibleQuestions.filter((q) => {
    const val = draft.answers[q.questionKey];
    const fileVal = draft.answers[`${q.questionKey}__file`];
    if (fileVal) return true;
    if (Array.isArray(val)) return val.length > 0;
    return !!val;
  }).length;

  const progressPercent = submitting
    ? 100
    : ((draft.currentSectionIdx + (sectionComplete ? 1 : 0.5)) /
        totalSections) *
      100;

  const goToSection = (idx: number) => {
    draft.setCurrentSectionIdx(idx);
    window.scrollTo(0, 0);
  };

  const handleNext = () => {
    if (currentSection) draft.markSectionComplete(currentSection.id);
    if (draft.currentSectionIdx < totalSections - 1) {
      goToSection(draft.currentSectionIdx + 1);
    }
  };

  const handleBack = () => {
    if (draft.currentSectionIdx > 0) {
      goToSection(draft.currentSectionIdx - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    await draft.flushSave();

    try {
      const res = await fetch("/api/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          answers: draft.answers,
        }),
      });
      const result = await readJson(res, "Assessment failed");

      const persistRes = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          answers: draft.answers,
          result,
        }),
      });
      await readJson(persistRes, "Failed to save results");

      await draft.clearAndReset();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  if (!draft.loaded) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (submitting) {
    return <SubmittingScreen />;
  }

  // Capture the startup name up front so it shows on the dashboard and docs.
  const startupName = ((draft.answers["__startup_name"] as string) || "").trim();
  if (!startupName) {
    return (
      <StartupNameStep
        onContinue={(name) => draft.setAnswer("__startup_name", name)}
      />
    );
  }

  const isLastSection = draft.currentSectionIdx === totalSections - 1;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1a1a2e] backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Logo size={34} />
              <span className="text-sm font-semibold text-white">
                Legal Health Check
              </span>
            </div>
            <div className="flex items-center gap-3">
              <DraftStatus
                state={draft.saveState}
                lastSavedAt={draft.lastSavedAt}
              />
              <SaveExitButton onSave={draft.flushSave} />
              <Badge variant="info">
                Section {draft.currentSectionIdx + 1} of {totalSections}
              </Badge>
            </div>
          </div>
          <Progress value={progressPercent} />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">
              {answeredCount} of {allVisibleQuestions.length} questions answered
            </p>
            <p className="text-xs text-gray-400">
              {Math.round(progressPercent)}%
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-32">
        <div className="flex gap-8 mt-6">
          <SectionNav
            sections={sections}
            questions={questions}
            answers={draft.answers}
            currentIndex={draft.currentSectionIdx}
            onNavigate={goToSection}
          />

          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentSection.title}
              </h2>
              {currentSection.description && (
                <div className="mt-2 pl-4 border-l-2 border-indigo-200">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {currentSection.description}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {visibleQuestions.map((question, qi) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={qi + 1}
                  value={draft.answers[question.questionKey]}
                  onChange={draft.setAnswer}
                  assessmentId={assessmentId}
                  attachmentValue={draft.answers[`${question.questionKey}__file`]}
                  answers={draft.answers}
                />
              ))}
            </div>

            {error && (
              <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={draft.currentSectionIdx === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {isLastSection ? (
            <Button onClick={handleSubmit} disabled={!sectionComplete}>
              <Sparkles className="w-4 h-4" />
              Submit & Build Dashboard
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!sectionComplete}>
              Next Section
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SubmittingScreen() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-6">
          <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Analysing your responses...
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Our AI is reviewing your legal health across all domains to build
          your personalised dashboard.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          This usually takes 15-30 seconds
        </div>
      </div>
    </div>
  );
}

function StartupNameStep({
  onContinue,
}: {
  onContinue: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const trimmed = name.trim();

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <div className="sticky top-0 z-10 bg-[#1a1a2e] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-2">
          <Logo size={34} />
          <span className="text-sm font-semibold text-white">
            Legal Health Check
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            What&apos;s your startup called?
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            We&apos;ll use this across your dashboard and generated documents.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (trimmed) onContinue(trimmed);
            }}
            className="space-y-4"
          >
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            />
            <Button
              type="submit"
              disabled={!trimmed}
              className="w-full"
              size="md"
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
