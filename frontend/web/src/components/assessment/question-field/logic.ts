import type { Answers, Question } from "./types";

export function getChoices(options: Record<string, unknown> | null): string[] {
  if (!options) return [];
  if (Array.isArray(options.choices)) return options.choices as string[];
  return [];
}

export function getShowIf(
  options: Record<string, unknown> | null
): { questionKey: string; equals?: string; notEquals?: string; includes?: string } | null {
  if (!options || !options.showIf) return null;
  return options.showIf as { questionKey: string; equals?: string; notEquals?: string; includes?: string };
}

export function shouldShow(question: Question, answers: Answers): boolean {
  const showIf = getShowIf(question.options);
  if (!showIf) return true;

  const val = answers[showIf.questionKey];
  if (showIf.equals) {
    if (Array.isArray(val)) return val.includes(showIf.equals);
    return val === showIf.equals;
  }
  if (showIf.notEquals) {
    if (Array.isArray(val)) return !val.includes(showIf.notEquals);
    return val !== showIf.notEquals;
  }
  if (showIf.includes) {
    if (Array.isArray(val)) return val.includes(showIf.includes);
    return val === showIf.includes;
  }
  return true;
}
