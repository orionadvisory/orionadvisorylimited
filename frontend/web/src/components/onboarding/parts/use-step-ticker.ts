"use client";

import { useEffect, useState } from "react";
import { sky } from "@/components/auth/night-sky";

/**
 * Advances through `count` status lines every `intervalMs`, holding on the last
 * one, and mirrors that progress into the night-sky store so the constellation
 * connects while the server works. Resets the sky on unmount.
 */
export function useStepTicker(count: number, intervalMs = 4000) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i < count - 1 ? i + 1 : i));
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs]);

  useEffect(() => {
    sky.setMood("pending");
    return () => sky.reset();
  }, []);

  useEffect(() => {
    sky.setProgress(count > 0 ? (active + 1) / count : 1);
  }, [active, count]);

  return active;
}
