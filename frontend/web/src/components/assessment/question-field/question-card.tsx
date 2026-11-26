"use client";

import { BentoCard } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import type { AnswerChangeHandler, Answers, Question } from "./types";
import { fieldInputClass, fieldLabelClass } from "./styles";
import { QuestionField } from "./question-field";
import { FileUploadField } from "./file-upload-field";

export interface QuestionCardProps {
  question: Question;
  index: number;
  value: string | string[] | undefined;
  onChange: AnswerChangeHandler;
  assessmentId?: string;
  attachmentValue?: string | string[] | undefined;
  answers?: Answers;
}

function formatDomain(domain: string) {
  return domain.replace(/[_-]+/g, " ");
}

/** A question as a white bento tile: mono kicker, prompt, input, optional context + attachment. */
export function QuestionCard({
  question,
  index,
  value,
  onChange,
  assessmentId,
  attachmentValue,
  answers = {},
}: QuestionCardProps) {
  // Every question gets a supplement textbox, and a file upload unless the
  // primary input IS the file upload itself.
  const showAttachment = question.inputType !== "file_upload";
  const supplementKey = `${question.questionKey}__followup`;
  const supplementValue = answers[supplementKey];
  const promptId = `q-${question.id}-prompt`;
  const supplementId = `q-${question.id}-followup`;

  return (
    <BentoCard as="article" aria-labelledby={promptId} className="transition-shadow duration-300 hover:shadow-bento-lift">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-mist">
          Q {String(index).padStart(2, "0")}
        </span>
        {question.required && (
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ember-deep">
            · Required
          </span>
        )}
        {question.domain && (
          <Chip className="ml-auto capitalize">{formatDomain(question.domain)}</Chip>
        )}
      </div>

      <h3 id={promptId} className="mt-3 text-base font-semibold leading-snug tracking-tight text-ink sm:text-[1.05rem]">
        {question.prompt}
        {question.required && (
          <span className="ml-1 text-ember" aria-hidden="true">
            *
          </span>
        )}
      </h3>
      {question.description && (
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-mist">{question.description}</p>
      )}

      <div className="mt-5">
        <QuestionField question={question} value={value} onChange={onChange} assessmentId={assessmentId} />
      </div>

      <div className="mt-5 space-y-3 border-t border-dashed border-line pt-5">
        <div>
          <label htmlFor={supplementId} className={fieldLabelClass}>
            Additional context <span className="normal-case tracking-normal text-mist/70">(optional)</span>
          </label>
          <textarea
            id={supplementId}
            value={typeof supplementValue === "string" ? supplementValue : ""}
            onChange={(e) => onChange(supplementKey, e.target.value)}
            placeholder="Add anything else the legal team should know about this answer..."
            rows={3}
            className={fieldInputClass + " resize-y text-sm"}
          />
        </div>
        {showAttachment && (
          <FileUploadField
            question={question}
            value={attachmentValue}
            onChange={onChange}
            assessmentId={assessmentId}
            compact
          />
        )}
      </div>
    </BentoCard>
  );
}
