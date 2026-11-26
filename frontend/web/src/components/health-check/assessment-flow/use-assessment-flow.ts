"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  type Section,
  type Question,
  type Answers,
  shouldShow,
} from "@/components/assessment/question-field";

export interface AssessmentTemplate {
  id: string;
  name: string;
  description: string | null;
}

function isAnswered(answers: Answers, key: string) {
  const val = answers[key];
  const fileVal = answers[`${key}__file`];
  // A file attachment counts as answering the question
  if (fileVal) return true;
  if (Array.isArray(val)) return val.length > 0;
  return !!val;
}

/** State + actions for the public template-driven health check. */
export function useAssessmentFlow(
  template: AssessmentTemplate,
  sections: Section[],
  questions: Question[]
) {
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [assessmentId, setAssessmentId] = useState<string | undefined>();

  // Start or resume an in-progress assessment
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
      .catch(() => {
        // Guest flow — generate a local ID for upload keying
        setAssessmentId(`guest_${crypto.randomUUID()}`);
      });
  }, [template.id]);

  const questionsBySection = useMemo(() => {
    const map = new Map<string, Question[]>();
    for (const s of sections) {
      map.set(s.id, questions.filter((q) => q.sectionId === s.id));
    }
    return map;
  }, [sections, questions]);

  const currentSection = sections[currentSectionIdx];
  const currentQuestions = currentSection
    ? (questionsBySection.get(currentSection.id) ?? [])
    : [];
  const visibleQuestions = currentQuestions.filter((q) => shouldShow(q, answers));

  const handleChange = useCallback((key: string, val: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  }, []);

  const sectionComplete = visibleQuestions
    .filter((q) => q.required)
    .every((q) => isAnswered(answers, q.questionKey));

  const totalSections = sections.length;
  const progressPercent = submitting
    ? 100
    : ((currentSectionIdx + (sectionComplete ? 1 : 0.5)) / totalSections) * 100;

  const allVisibleQuestions = questions.filter((q) => shouldShow(q, answers));
  const answeredCount = allVisibleQuestions.filter((q) =>
    isAnswered(answers, q.questionKey)
  ).length;

  const goTo = (idx: number) => {
    setCurrentSectionIdx(idx);
    window.scrollTo(0, 0);
  };

  const handleNext = () => {
    if (currentSectionIdx < totalSections - 1) goTo(currentSectionIdx + 1);
  };

  const handleBack = () => {
    if (currentSectionIdx > 0) goTo(currentSectionIdx - 1);
  };

  const handleNavigate = (idx: number) => goTo(idx);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id, answers }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Assessment failed");
      }

      const result = await res.json();
      localStorage.setItem("orion_health_check", JSON.stringify(result));
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return {
    answers,
    assessmentId,
    currentSection,
    currentSectionIdx,
    totalSections,
    visibleQuestions,
    sectionComplete,
    progressPercent,
    answeredCount,
    visibleTotal: allVisibleQuestions.length,
    isLastSection: currentSectionIdx === totalSections - 1,
    submitted,
    submitting,
    error,
    handleChange,
    handleNext,
    handleBack,
    handleNavigate,
    handleSubmit,
  };
}
