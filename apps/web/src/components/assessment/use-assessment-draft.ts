"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getDraft,
  saveDraft,
  clearDraft,
  type DraftPayload,
} from "@/app/actions/assessment-draft";
import type { Answers } from "./question-field";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface UseAssessmentDraftOptions {
  templateId: string;
}

interface UseAssessmentDraftReturn {
  loaded: boolean;
  answers: Answers;
  currentSectionIdx: number;
  completedSectionIds: Set<string>;
  saveState: SaveState;
  lastSavedAt: Date | null;
  setAnswer: (key: string, val: string | string[]) => void;
  setCurrentSectionIdx: (idx: number) => void;
  markSectionComplete: (sectionId: string) => void;
  flushSave: () => Promise<void>;
  clearAndReset: () => Promise<void>;
}

const AUTOSAVE_DEBOUNCE_MS = 800;

/**
 * Manages assessment draft state with DB-backed autosave.
 * Hydrates from server on mount, debounces writes, exposes save status.
 */
export function useAssessmentDraft({
  templateId,
}: UseAssessmentDraftOptions): UseAssessmentDraftReturn {
  const [loaded, setLoaded] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentSectionIdx, setCurrentSectionIdxState] = useState(0);
  const [completedSectionIds, setCompletedSectionIds] = useState<Set<string>>(
    new Set()
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPayloadRef = useRef<DraftPayload | null>(null);

  // ── Hydrate from server ──
  useEffect(() => {
    let cancelled = false;
    getDraft(templateId)
      .then((draft) => {
        if (cancelled || !draft) {
          setLoaded(true);
          return;
        }
        setAnswers(draft.answers);
        setCurrentSectionIdxState(draft.currentSectionIdx);
        setCompletedSectionIds(new Set(draft.completedSectionIds));
        setLastSavedAt(draft.updatedAt);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  // ── Save runner ──
  const runSave = useCallback(
    async (payload: DraftPayload) => {
      setSaveState("saving");
      try {
        const res = await saveDraft(templateId, payload);
        if ("error" in res) {
          // eslint-disable-next-line no-console
          console.error("Draft save failed:", res.error);
          setSaveState("error");
          return;
        }
        setLastSavedAt(res.updatedAt);
        setSaveState("saved");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Draft save threw:", err);
        setSaveState("error");
      }
    },
    [templateId]
  );

  // ── Schedule debounced save whenever state changes ──
  useEffect(() => {
    if (!loaded) return;

    const payload: DraftPayload = {
      answers,
      currentSectionIdx,
      completedSectionIds: [...completedSectionIds],
    };
    latestPayloadRef.current = payload;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSave(payload);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [loaded, answers, currentSectionIdx, completedSectionIds, runSave]);

  // ── Public setters ──
  const setAnswer = useCallback((key: string, val: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  }, []);

  const setCurrentSectionIdx = useCallback((idx: number) => {
    setCurrentSectionIdxState(idx);
  }, []);

  const markSectionComplete = useCallback((sectionId: string) => {
    setCompletedSectionIds((prev) => {
      if (prev.has(sectionId)) return prev;
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });
  }, []);

  const flushSave = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (latestPayloadRef.current) {
      await runSave(latestPayloadRef.current);
    }
  }, [runSave]);

  const clearAndReset = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    // Best-effort: a failed draft clear must never surface an error on an
    // assessment that has already been saved.
    try {
      await clearDraft(templateId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("clearDraft failed (ignored):", err);
    }
  }, [templateId]);

  return {
    loaded,
    answers,
    currentSectionIdx,
    completedSectionIds,
    saveState,
    lastSavedAt,
    setAnswer,
    setCurrentSectionIdx,
    markSectionComplete,
    flushSave,
    clearAndReset,
  };
}
