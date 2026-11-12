"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Check } from "lucide-react";
import type { Pillar } from "./data";

/**
 * One card in the sticky stack. Each card pins, then shrinks slightly as the
 * next one slides over it; its photo zooms out as the card arrives.
 */
export function PillarCard({
  pillar,
  i,
  progress,
  range,
  targetScale,
}: {
  pillar: Pillar;
  i: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.6, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div ref={ref} className="sticky top-0 flex h-[100svh] items-center justify-center">
      <motion.article
        style={{ scale, top: `calc(-3vh + ${i * 26}px)` }}
        className="relative flex h-[78svh] max-h-[700px] w-full origin-top flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-night-2 shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.8)] md:grid md:grid-cols-[1.05fr_1fr]"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(90% 70% at 0% 100%, ${pillar.tint}24, transparent 60%)` }}
        />

        <div className="relative flex flex-1 flex-col justify-between gap-6 p-7 sm:p-10 lg:p-14">
          <p className="kicker flex items-center gap-3 text-haze">
            <span style={{ color: pillar.tint }}>{pillar.index}</span>
            <span className="h-px w-8 bg-white/20" />
            {pillar.kicker}
          </p>
          <div>
            <h3 className="font-display text-[clamp(2.6rem,5.5vw,5.2rem)] leading-[0.95] tracking-[-0.02em]">{pillar.title}</h3>
            <p className="mt-5 max-w-md text-pretty leading-relaxed text-haze sm:text-lg">{pillar.description}</p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {pillar.points.map((point) => (
              <li key={point} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-sm text-star/85">
                <Check className="size-3.5" style={{ color: pillar.tint }} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="duotone relative h-[34%] shrink-0 md:h-full" style={{ "--tint": pillar.tint } as React.CSSProperties}>
          <motion.div style={{ scale: imageScale }} className="absolute inset-0">
            <Image src={pillar.image} alt={pillar.imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </motion.div>
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-night-2 via-transparent to-transparent md:bg-gradient-to-r" />
          <p className="glass absolute bottom-5 right-5 z-[2] inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-star">
            <span className="pulse-dot size-2 rounded-full" style={{ background: pillar.tint }} />
            {pillar.chip}
          </p>
        </div>
      </motion.article>
    </div>
  );
}
