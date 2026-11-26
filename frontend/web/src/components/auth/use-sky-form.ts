"use client";

import { useCallback, useEffect, useRef } from "react";
import { sky } from "./night-sky/signal";

type Scorer = (form: FormData) => number;

/**
 * Wires an auth form to the night sky: every keystroke re-scores the form (0..1) and the
 * constellation connects that share of its links. A full form ignites it, submitting sends
 * a comet round it, and a returned error flashes it ember.
 */
export function useSkyForm(score: Scorer, pending: boolean, state: { error?: string } | undefined) {
  const formRef = useRef<HTMLFormElement>(null);
  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  });

  const onInput = useCallback(() => {
    if (!formRef.current) return;
    const p = scoreRef.current(new FormData(formRef.current));
    sky.setProgress(p);
    sky.setMood(p >= 1 ? "success" : "idle");
  }, []);

  useEffect(() => {
    if (pending) {
      sky.setMood("pending");
      return;
    }
    if (!state?.error) return;
    // React resets the form after an action; re-score once the reset lands, then flash.
    const id = setTimeout(() => {
      onInput();
      sky.setMood("error");
    }, 0);
    return () => clearTimeout(id);
  }, [pending, state, onInput]);

  useEffect(() => {
    sky.reset();
    onInput(); // browser autofill
    return () => sky.reset();
  }, [onInput]);

  return { formRef, onInput };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const str = (f: FormData, k: string) => String(f.get(k) ?? "");
export const emailScore = (v: string) => (EMAIL.test(v.trim()) ? 1 : Math.min(0.6, v.length / 20));
export const lengthScore = (v: string, n: number) => Math.min(1, v.length / n);
