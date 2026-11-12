"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "motion/react";
import { EASE_OUT_EXPO } from "./easing";

/** Counts from 0 to `value` the first time it scrolls into view. */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 2.2,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT_EXPO,
      onUpdate: (n) => {
        if (ref.current) ref.current.textContent = `${prefix}${n.toFixed(decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, decimals, prefix, suffix]);

  // Server-render the final value so the number is correct without JS.
  return (
    <span ref={ref} className="tabular-nums">
      {`${prefix}${value.toFixed(decimals)}${suffix}`}
    </span>
  );
}
