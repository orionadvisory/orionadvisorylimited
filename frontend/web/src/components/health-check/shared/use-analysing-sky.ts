"use client";

import { useEffect, useState } from "react";
import { sky } from "@/components/auth/night-sky";

/**
 * Drives the night sky while the assessment is being analysed: the comet circles
 * ("pending") and the Orion figure keeps connecting towards — but never quite
 * reaching — completion. Also cycles a short status line. Resets the sky on unmount.
 */
export function useAnalysingSky(steps: readonly string[], startAt = 0.15) {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    let progress = startAt;
    sky.reset();
    sky.setProgress(progress);
    sky.setMood("pending");

    const grow = window.setInterval(() => {
      progress += (0.94 - progress) * 0.07;
      sky.setProgress(progress);
    }, 450);
    const cycle = window.setInterval(() => {
      setStepIdx((i) => (i + 1) % steps.length);
    }, 3200);

    return () => {
      window.clearInterval(grow);
      window.clearInterval(cycle);
      sky.reset();
    };
  }, [steps.length, startAt]);

  return steps[stepIdx];
}
