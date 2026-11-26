"use client";

import type { AnswerChangeHandler, Question } from "./types";
import { getChoices } from "./logic";
import { fieldInputClass } from "./styles";
import { MultiChoiceTiles, SingleChoiceTiles } from "./choice-tiles";
import { FileUploadField } from "./file-upload-field";

export interface QuestionFieldProps {
  question: Question;
  value: string | string[] | undefined;
  onChange: AnswerChangeHandler;
  assessmentId?: string;
}

/** The primary input for a question, chosen by `inputType`. */
export function QuestionField({ question, value, onChange, assessmentId }: QuestionFieldProps) {
  const choices = getChoices(question.options);

  if (question.inputType === "file_upload") {
    return <FileUploadField question={question} value={value} onChange={onChange} assessmentId={assessmentId} />;
  }

  if (question.inputType === "select" && choices.length > 0) {
    return (
      <SingleChoiceTiles
        label={question.prompt}
        choices={choices}
        value={value}
        onSelect={(choice) => onChange(question.questionKey, choice)}
      />
    );
  }

  if (question.inputType === "multi_select" && choices.length > 0) {
    const selected = Array.isArray(value) ? value : [];
    return (
      <MultiChoiceTiles
        label={question.prompt}
        choices={choices}
        value={selected}
        onToggle={(choice) => {
          const next = selected.includes(choice) ? selected.filter((c) => c !== choice) : [...selected, choice];
          onChange(question.questionKey, next);
        }}
      />
    );
  }

  if (question.inputType === "textarea") {
    return (
      <textarea
        aria-label={question.prompt}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(question.questionKey, e.target.value)}
        rows={4}
        placeholder="Enter your response..."
        className={fieldInputClass + " resize-none"}
      />
    );
  }

  return (
    <input
      type="text"
      aria-label={question.prompt}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(question.questionKey, e.target.value)}
      placeholder="Enter your response..."
      className={fieldInputClass}
    />
  );
}
