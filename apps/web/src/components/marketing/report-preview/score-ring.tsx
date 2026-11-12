"use client";

import { useId, useRef } from "react";
import { motion, useInView } from "motion/react";
import { CountUp } from "../motion/count-up";
import { EASE_OUT_EXPO } from "../motion/easing";

export function ScoreRing({ score }: { score: number }) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -120px 0px" });

  return (
    <div ref={ref} className="relative size-40">
      <svg viewBox="0 0 128 128" className="size-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#19d3ae" />
            <stop offset="1" stopColor="#e9c47a" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(12,26,23,0.08)" strokeWidth="7" />
        <motion.circle
          cx="64"
          cy="64"
          r="54"
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="7"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: score / 100 } : undefined}
          transition={{ duration: 2.2, ease: EASE_OUT_EXPO }}
          style={{ filter: "drop-shadow(0 0 8px rgba(25,211,174,0.5))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-6xl leading-none">
            <CountUp value={score} />
          </p>
          <p className="kicker mt-1 text-[0.65rem] text-mist">out of 100</p>
        </div>
      </div>
    </div>
  );
}
