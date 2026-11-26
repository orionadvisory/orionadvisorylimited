export interface Section {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
}

export interface Question {
  id: string;
  sectionId: string;
  questionKey: string;
  prompt: string;
  description: string | null;
  inputType: string;
  options: Record<string, unknown> | null;
  domain: string | null;
  required: boolean;
  weight: number;
  orderIndex: number;
}

export type Answers = Record<string, string | string[]>;

export type UploadValue = { uploadId: string; fileName: string; storageKey: string };

/** Shared change handler signature used by every assessment input. */
export type AnswerChangeHandler = (key: string, val: string | string[]) => void;
