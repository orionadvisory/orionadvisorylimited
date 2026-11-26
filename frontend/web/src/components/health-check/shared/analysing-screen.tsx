"use client";

import { NightSkyCanvas } from "@/components/auth/night-sky";
import { LogoChip } from "./flow-chrome";
import { useAnalysingSky } from "./use-analysing-sky";

const STEPS = [
  "Reading your answers",
  "Mapping ten legal domains",
  "Weighing founder & equity risk",
  "Checking employment & IP gaps",
  "Scoring your legal health",
  "Drafting your recommendations",
] as const;

/**
 * Full-screen "analysing" state: the Orion constellation connects itself in a deep
 * ink sky while a status line cycles through what the review is doing.
 */
export function AnalysingScreen({
  title,
  description,
  startAt,
}: {
  title: string;
  description: string;
  /** 0..1 — how much of the figure is already connected when the screen opens. */
  startAt?: number;
}) {
  const step = useAnalysingSky(STEPS, startAt);

  return (
    <div className="min-h-svh bg-canvas p-3">
      <section
        aria-busy="true"
        aria-labelledby="analysing-title"
        className="relative isolate flex min-h-[calc(100svh-1.5rem)] flex-col justify-between overflow-hidden rounded-[28px] bg-[#06100e] p-6 text-cloud sm:p-10"
      >
        <div className="pointer-events-none absolute -left-1/4 -top-1/3 -z-10 size-[42rem] rounded-full bg-[radial-gradient(closest-side,rgba(25,211,174,0.22),transparent)] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-1/3 -right-1/4 -z-10 size-[38rem] rounded-full bg-[radial-gradient(closest-side,rgba(100,150,255,0.16),transparent)] blur-2xl" />
        <NightSkyCanvas className="absolute inset-0 -z-10 size-full" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(3,8,7,0.75))]" />

        <div className="flex w-fit items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 backdrop-blur-md">
          <LogoChip className="size-8" />
          <span className="font-display text-xl leading-none">Orion</span>
        </div>

        <div className="max-w-xl">
          <p
            aria-live="polite"
            className="mb-4 flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-aurora-soft/80"
          >
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-aurora opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-aurora" />
            </span>
            <span>{step}…</span>
          </p>
          <h1
            id="analysing-title"
            className="font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.95] tracking-[-0.02em] text-balance"
          >
            {title}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#b9c4bf]">{description}</p>
          <p className="mt-6 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/45">
            This usually takes 15–30 seconds
          </p>
        </div>
      </section>
    </div>
  );
}
