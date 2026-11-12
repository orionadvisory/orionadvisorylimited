"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { SplitText } from "../motion/split-text";
import { Magnetic } from "../motion/magnetic";
import { EASE_OUT_EXPO } from "../motion/easing";
import { ConstellationCanvas } from "./constellation-canvas";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 1.1, delay, ease: EASE_OUT_EXPO },
});

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden">
      {/* Sky */}
      <div className="horizon-grid absolute inset-0 -z-20 opacity-70" />
      <div className="aurora aurora-a -z-20 left-[-15%] top-[-25%] size-[56rem]" />
      <div className="aurora aurora-b -z-20 right-[-20%] top-[5%] size-[52rem]" />
      <ConstellationCanvas className="absolute inset-0 -z-10 size-full" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-b from-transparent to-cloud" />

      <div className="mx-auto w-full max-w-7xl px-5 pb-28 pt-36 sm:px-8 lg:pt-40">
        <motion.p {...fadeUp(0.1)} className="glass inline-flex items-center gap-2.5 rounded-full py-1.5 pl-2 pr-4 text-xs text-ink/80 sm:text-sm">
          <span className="rounded-full bg-aurora/15 px-2 py-0.5 font-medium text-aurora-deep">New</span>
          Free legal health check — results in 5 minutes
        </motion.p>

        <SplitText
          as="h1"
          immediate
          delay={0.25}
          stagger={0.08}
          className="mt-7 max-w-5xl font-display text-[clamp(3.5rem,10vw,9.5rem)] leading-[0.88] tracking-[-0.035em]"
          segments={[
            { text: "Your startup’s" },
            { text: "\n" },
            { text: "legal" },
            { text: "north star.", className: "italic text-aurora-gradient pr-[0.08em]" },
          ]}
        />

        <motion.p {...fadeUp(0.95)} className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-mist sm:text-xl">
          Orion maps every legal gap in your company — formation, equity, fundraising, IP, compliance — then guides
          you all the way to <em className="font-display text-[1.15em] text-ink">sorted</em>, with real lawyers and
          an AI co-pilot that speaks human.
        </motion.p>

        <motion.div {...fadeUp(1.1)} className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
          <Magnetic>
            <Link
              href="/health-check"
              className="btn-shine group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 font-medium text-cloud shadow-[0_18px_40px_-14px_rgba(12,26,23,0.55)] transition-colors hover:bg-aurora-deep"
            >
              Check my legal health
              <span className="grid size-10 place-items-center rounded-full bg-cloud text-aurora-deep transition-transform duration-500 group-hover:-rotate-45">
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
          </Magnetic>
          <Link href="/pricing" className="glass rounded-full px-7 py-4 text-ink/90 transition-colors hover:bg-ink/10">
            View packages
          </Link>
        </motion.div>

        <motion.ul {...fadeUp(1.25)} className="kicker mt-9 flex flex-wrap gap-x-6 gap-y-2 text-mist/80">
          {["Free", "No signup", "UK · US · Nigeria"].map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <Check className="size-3.5 text-aurora-deep" aria-hidden="true" />
              {item}
            </li>
          ))}
        </motion.ul>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex"
        aria-hidden="true"
      >
        <span className="kicker text-[0.65rem] text-mist/70">Scroll</span>
        <span className="relative h-12 w-px overflow-hidden bg-ink/10">
          <span className="scroll-cue absolute inset-0 bg-gradient-to-b from-transparent via-aurora to-transparent" />
        </span>
      </motion.div>
    </section>
  );
}
