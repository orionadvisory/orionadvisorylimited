"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowRight } from "lucide-react";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { STEPS } from "./steps";

export function Process() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 0.7", "end 0.6"] });

  return (
    <section className="relative px-5 py-32 sm:px-8 sm:py-44">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="kicker text-mist">(04) How it works</p>
          <SplitText
            className="mt-6 font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.025em]"
            segments={[{ text: "Three steps." }, { text: "\n" }, { text: "Zero mysterious billable hours.", className: "italic text-mist" }]}
          />
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-md text-pretty text-lg leading-relaxed text-mist">
              A visible path from legal uncertainty to properly sorted.
            </p>
            <Link href="/health-check" className="group mt-9 inline-flex items-center gap-2 border-b border-aurora/60 pb-1 text-aurora-deep transition-colors hover:border-aurora hover:text-aurora-deep">
              Start step one now
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <ol ref={listRef} className="relative">
          {/* Track + scroll-driven fill */}
          <span className="absolute bottom-6 left-7 top-6 w-px bg-ink/10" aria-hidden="true" />
          <motion.span
            style={{ scaleY: scrollYProgress }}
            className="absolute bottom-6 left-7 top-6 w-px origin-top bg-gradient-to-b from-aurora via-aurora to-gold shadow-[0_0_12px_rgba(25,211,174,0.8)]"
            aria-hidden="true"
          />
          {STEPS.map((step, i) => (
            <Step key={step.n} step={step} index={i} progress={scrollYProgress} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Step({ step, index, progress }: { step: (typeof STEPS)[number]; index: number; progress: MotionValue<number> }) {
  const at = index / (STEPS.length - 1 || 1);
  const lit = useTransform(progress, [Math.max(0, at - 0.12), at], [0, 1]);
  const Icon = step.icon;

  return (
    <li className="relative pb-14 pl-20 last:pb-0">
      <div className="absolute left-0 top-0 grid size-14 place-items-center rounded-full border border-ink/15 bg-cloud">
        <motion.span style={{ opacity: lit }} className="absolute inset-0 rounded-full bg-aurora shadow-[0_0_30px_rgba(25,211,174,0.7)]" />
        <Icon className="relative size-5 text-ink" aria-hidden="true" />
      </div>
      <Reveal>
        <div className="glass rounded-3xl p-7 sm:p-9">
          <div className="flex items-center justify-between">
            <span className="text-outline font-display text-7xl leading-none">{step.n}</span>
            <span className="kicker rounded-full border border-ink/10 px-3 py-1 text-[0.65rem] text-mist">{step.meta}</span>
          </div>
          <h3 className="mt-6 font-display text-4xl tracking-tight">{step.title}</h3>
          <p className="mt-3 max-w-md text-pretty leading-relaxed text-mist">{step.description}</p>
        </div>
      </Reveal>
    </li>
  );
}
