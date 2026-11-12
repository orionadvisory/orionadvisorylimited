"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@orion/ui/utils";
import { EASE_OUT_EXPO } from "../motion/easing";
import { ScoreRing } from "./score-ring";
import { SAMPLE_ACTIONS, SAMPLE_DOMAINS, SAMPLE_SCORE, scoreTone } from "./data";

/**
 * A sample health report that tilts up out of the page as you scroll —
 * the "product reveal" moment right under the hero.
 */
export function ReportPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.2"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [38, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.84, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [0.15, 1]);

  return (
    <section aria-label="Sample Orion legal health report" className="relative -mt-16 px-3 pb-28 sm:px-8">
      <div ref={ref} className="mx-auto max-w-6xl [perspective:1800px]">
        <motion.div
          style={{ rotateX, scale, y, opacity, transformOrigin: "50% 0%" }}
          className="relative rounded-[1.75rem] border border-ink/10 bg-surface/90 p-2 shadow-[0_50px_120px_-40px_rgba(12,26,23,0.28)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-aurora to-transparent" />

          {/* Window chrome */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-ink/15" />
              <span className="size-2.5 rounded-full bg-ink/15" />
              <span className="size-2.5 rounded-full bg-ink/15" />
            </div>
            <p className="kicker mx-auto rounded-full bg-ink/5 px-4 py-1 text-[0.65rem] text-mist">Legal health report · sample</p>
            <span className="w-10" />
          </div>

          <div className="grid gap-2 lg:grid-cols-[0.9fr_1.3fr_1.15fr]">
            {/* Score */}
            <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-ink/[0.03] p-6 text-center">
              <p className="kicker self-start text-mist">Overall score</p>
              <ScoreRing score={SAMPLE_SCORE} />
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                  <span className="size-1.5 rounded-full bg-gold" /> Moderate risk
                </span>
                <p className="mt-3 text-sm text-mist">Acme Labs · Seed stage · 52 questions</p>
              </div>
            </div>

            {/* Domains */}
            <div className="rounded-2xl bg-ink/[0.03] p-6">
              <p className="kicker text-mist">By domain</p>
              <ul className="mt-6 space-y-5">
                {SAMPLE_DOMAINS.map((d, i) => {
                  const tone = scoreTone(d.score);
                  return (
                    <li key={d.label}>
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="text-ink/90">{d.label}</span>
                        <span className={cn("font-code text-xs tabular-nums", tone.text)}>{d.score}</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/[0.06]">
                        <motion.div
                          className={cn("h-full rounded-full", tone.bar)}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${d.score}%` }}
                          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                          transition={{ duration: 1.6, delay: 0.3 + i * 0.08, ease: EASE_OUT_EXPO }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <div className="flex-1 rounded-2xl bg-ink/[0.03] p-6">
                <p className="kicker text-mist">Priority actions</p>
                <ol className="mt-5 space-y-3">
                  {SAMPLE_ACTIONS.map((a, i) => (
                    <motion.li
                      key={a.title}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                      transition={{ duration: 0.9, delay: 0.5 + i * 0.12, ease: EASE_OUT_EXPO }}
                      className="flex items-start gap-3 rounded-xl border border-ink/[0.06] bg-cloud/40 p-3"
                    >
                      <span
                        className={cn(
                          "mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 font-code text-[0.6rem] uppercase",
                          a.severity === "High" ? "bg-ember/15 text-ember" : "bg-gold/15 text-gold",
                        )}
                      >
                        {a.severity}
                      </span>
                      <div>
                        <p className="text-sm leading-snug text-ink/90">{a.title}</p>
                        <p className="mt-0.5 text-xs text-mist">{a.domain}</p>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </div>
              <div className="rounded-2xl border border-aurora/20 bg-aurora/[0.06] p-5">
                <p className="flex items-center gap-2 text-xs font-medium text-aurora-deep">
                  <Sparkles className="size-3.5" aria-hidden="true" /> Orion co-pilot
                </p>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-ink/85">
                  Investors will spot the missing vesting in diligence. Fix that first — it’s a one-week job.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
