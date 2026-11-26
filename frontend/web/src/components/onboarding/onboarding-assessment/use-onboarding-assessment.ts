"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type Answers, type Question, type Section, shouldShow } from "@/components/assessment/question-field";
import { useAssessmentDraft } from "@/components/assessment/use-assessment-draft";

export interface OnboardingAssessmentProps {
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

function isAnswered(q: Question, answers: Answers) {
  const val = answers[q.questionKey];
  const fileVal = answers[`${q.questionKey}__file`];
  if (fileVal) return true;
  if (Array.isArray(val)) return val.length > 0;
  return !!val;
}

/** All state + side effects for the onboarding assessment (draft, uploads, submit). */
export function useOnboardingAssessment({ template, sections, questions }: OnboardingAssessmentProps) {
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
  const currentQuestions = currentSection ? (questionsBySection.get(currentSection.id) ?? []) : [];
  const visibleQuestions = currentQuestions.filter((q) => shouldShow(q, draft.answers));

  const sectionComplete = visibleQuestions.filter((q) => q.required).every((q) => isAnswered(q, draft.answers));

  const allVisibleQuestions = questions.filter((q) => shouldShow(q, draft.answers));
  const answeredCount = allVisibleQuestions.filter((q) => isAnswered(q, draft.answers)).length;

  const progressPercent = submitting
    ? 100
    : ((draft.currentSectionIdx + (sectionComplete ? 1 : 0.5)) / totalSections) * 100;

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

  // Capture the startup name up front so it shows on the dashboard and docs.
  const startupName = ((draft.answers["__startup_name"] as string) || "").trim();

  return {
    draft,
    submitting,
    error,
    assessmentId,
    totalSections,
    currentSection,
    visibleQuestions,
    sectionComplete,
    answeredCount,
    visibleCount: allVisibleQuestions.length,
    progressPercent,
    startupName,
    isLastSection: draft.currentSectionIdx === totalSections - 1,
    goToSection,
    handleNext,
    handleBack,
    handleSubmit,
  };
}
