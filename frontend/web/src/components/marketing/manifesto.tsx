"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { OrionMark } from "./brand/orion-mark";

/** Words light up one by one as the paragraph scrolls through the viewport. */
const COPY: { text: string; className?: string }[] = [
  { text: "Most founders discover their legal gaps at the" },
  { text: "worst possible moment", className: "font-display italic text-ember" },
  { text: "— mid-diligence, mid-dispute, mid-deal." },
  { text: "Orion finds them first,", className: "font-display italic text-aurora-gradient" },
  { text: "explains them in plain English, and gets them fixed." },
];

export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });

  const words = COPY.flatMap((seg) => seg.text.split(" ").map((word) => ({ word, className: seg.className })));

  return (
    <section className="relative px-5 py-32 sm:px-8 sm:py-44">
      <div className="mx-auto max-w-6xl">
        <p className="kicker mb-10 flex items-center gap-3 text-mist">
          <OrionMark size={16} /> (01) The problem
        </p>
        <p ref={ref} className="text-balance text-[clamp(2rem,4.6vw,4.4rem)] font-medium leading-[1.08] tracking-[-0.025em]">
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} className={w.className}>
              {w.word}
            </Word>
          ))}
        </p>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
  className,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  className?: string;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <>
      <motion.span style={{ opacity }} className={className}>
        {children}
      </motion.span>{" "}
    </>
  );
}
