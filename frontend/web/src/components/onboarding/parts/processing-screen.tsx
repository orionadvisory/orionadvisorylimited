"use client";

import { Check } from "lucide-react";
import { Logo } from "@orion/ui/components/ui/logo";
import { cn } from "@orion/ui/utils";
import { NightSkyCanvas } from "@/components/auth/night-sky";
import { useStepTicker } from "./use-step-ticker";

interface ProcessingScreenProps {
  title: string;
  /** Italic aurora tail of the headline. */
  accent: string;
  description: string;
  steps: string[];
}

/**
 * Full-bleed night-sky panel shown while the health check is analysed: the
 * Orion constellation connects as status lines tick through.
 */
export function ProcessingScreen({ title, accent, description, steps }: ProcessingScreenProps) {
  const active = useStepTicker(steps.length);

  return (
    <div className="flex min-h-svh bg-orion-canvas p-3 sm:p-4">
      <section
        aria-busy="true"
        aria-labelledby="processing-title"
        className="relative isolate flex min-h-[calc(100svh-1.5rem)] flex-1 flex-col justify-between overflow-hidden rounded-bento bg-[#06100e] p-6 text-cloud sm:min-h-[calc(100svh-2rem)] sm:p-10"
      >
        <div className="pointer-events-none absolute -left-1/4 -top-1/3 -z-10 size-[42rem] rounded-full bg-[radial-gradient(closest-side,rgba(25,211,174,0.22),transparent)] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-1/3 -right-1/4 -z-10 size-[38rem] rounded-full bg-[radial-gradient(closest-side,rgba(100,150,255,0.16),transparent)] blur-2xl" />
        <NightSkyCanvas className="absolute inset-0 -z-10 size-full" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(3,8,7,0.75))]" />

        <div className="flex w-fit items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 backdrop-blur-md">
          <span className="grid size-8 place-items-center rounded-full bg-ink">
            <Logo size={20} />
          </span>
          <span className="font-display text-xl leading-none">Orion</span>
        </div>

        <div className="max-w-xl">
          <p className="mb-4 flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-aurora-soft/70">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-aurora opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-aurora" />
            </span>
            Analysing · usually 15–30 seconds
          </p>
          <h1
            id="processing-title"
            className="font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.95] tracking-[-0.02em] text-balance"
          >
            {title}{" "}
            <em className="bg-gradient-to-r from-aurora to-[#9be8ff] bg-clip-text pr-1 text-transparent">{accent}</em>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#b9c4bf]">{description}</p>

          <ol aria-live="polite" className="mt-6 space-y-2.5">
            {steps.map((step, i) => {
              const done = i < active;
              const current = i === active;
              return (
                <li
                  key={step}
                  className={cn(
                    "flex items-center gap-3 text-sm transition-opacity duration-500",
                    done ? "text-[#b9c4bf]" : current ? "text-cloud" : "text-white/30"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full border transition-colors",
                      done
                        ? "border-aurora/40 bg-aurora/15 text-aurora"
                        : current
                          ? "border-aurora/60 text-aurora"
                          : "border-white/10"
                    )}
                  >
                    {done ? (
                      <Check className="size-3.5" strokeWidth={2.75} />
                    ) : current ? (
                      <span className="size-1.5 animate-pulse rounded-full bg-aurora" />
                    ) : null}
                  </span>
                  <span>
                    {step}
                    {current && <span className="sr-only"> (in progress)</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
