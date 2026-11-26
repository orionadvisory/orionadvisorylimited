"use client";

import { Check } from "lucide-react";
import { cn } from "@orion/ui/utils";
import type { Section, Question, Answers } from "./question-field";
import { shouldShow } from "./question-field";

interface SectionNavProps {
  sections: Section[];
  questions: Question[];
  answers: Answers;
  currentIndex: number;
  onNavigate: (index: number) => void;
  /** Optional extra block rendered under the desktop step list (e.g. a progress panel). */
  footer?: React.ReactNode;
}

function isSectionComplete(section: Section, questions: Question[], answers: Answers): boolean {
  const sectionQs = questions.filter((q) => q.sectionId === section.id).filter((q) => shouldShow(q, answers));
  return sectionQs
    .filter((q) => q.required)
    .every((q) => {
      const val = answers[q.questionKey];
      const fileVal = answers[`${q.questionKey}__file`];
      if (fileVal) return true;
      if (Array.isArray(val)) return val.length > 0;
      return !!val;
    });
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Section stepper. Desktop: a sticky vertical step list. Mobile: a compact,
 * horizontally scrolling row of step chips. The root is full width below `lg`,
 * so place it in a `flex-col lg:flex-row` container.
 */
export function SectionNav({ sections, questions, answers, currentIndex, onNavigate, footer }: SectionNavProps) {
  const steps = sections.map((section, idx) => ({
    section,
    idx,
    isCurrent: idx === currentIndex,
    isDone: idx !== currentIndex && (idx < currentIndex || isSectionComplete(section, questions, answers)),
  }));

  return (
    <nav aria-label="Assessment sections" className="w-full shrink-0 lg:w-60">
      {/* Mobile: compact horizontal stepper */}
      <ol className="-mx-1 flex snap-x gap-1.5 overflow-x-auto px-1 pb-1 lg:hidden">
        {steps.map(({ section, idx, isCurrent, isDone }) => (
          <li key={section.id} className="snap-start">
            <button
              type="button"
              onClick={() => onNavigate(idx)}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={isCurrent ? undefined : `Section ${idx + 1}: ${section.title}`}
              className={cn(
                "focus-ring flex h-9 items-center gap-2 rounded-full text-xs font-medium transition-colors",
                isCurrent
                  ? "bg-ink pl-1 pr-4 text-cloud"
                  : isDone
                    ? "w-9 justify-center bg-brand-soft text-brand"
                    : "w-9 justify-center border border-line bg-white/70 font-mono text-mist"
              )}
            >
              {isCurrent ? (
                <>
                  <span className="grid size-7 place-items-center rounded-full bg-white/10 font-mono text-[0.65rem]">
                    {pad(idx + 1)}
                  </span>
                  <span className="max-w-[12rem] truncate">{section.title}</span>
                </>
              ) : isDone ? (
                <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <span className="text-[0.65rem]">{pad(idx + 1)}</span>
              )}
            </button>
          </li>
        ))}
      </ol>

      {/* Desktop: vertical step list */}
      <div className="sticky top-32 hidden lg:block">
        <p className="mb-3 px-1 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-mist">Sections</p>
        <ol className="relative space-y-1">
          <span aria-hidden="true" className="absolute bottom-4 left-[1.15rem] top-4 w-px bg-line" />
          {steps.map(({ section, idx, isCurrent, isDone }) => (
            <li key={section.id} className="relative">
              <button
                type="button"
                onClick={() => onNavigate(idx)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "focus-ring flex w-full items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 text-left text-sm transition-colors",
                  isCurrent
                    ? "bg-ink font-medium text-cloud shadow-bento-lift"
                    : isDone
                      ? "text-ink-soft hover:bg-white/70"
                      : "text-mist hover:bg-white/70 hover:text-ink-soft"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full font-mono text-[0.65rem]",
                    isCurrent
                      ? "bg-white/10 text-cloud"
                      : isDone
                        ? "bg-brand-soft text-brand"
                        : "border border-line bg-canvas text-mist"
                  )}
                >
                  {isDone ? <Check className="size-3.5" strokeWidth={2.75} /> : pad(idx + 1)}
                </span>
                <span className="truncate">{section.title}</span>
                {isDone && <span className="sr-only"> (complete)</span>}
              </button>
            </li>
          ))}
        </ol>
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </nav>
  );
}
