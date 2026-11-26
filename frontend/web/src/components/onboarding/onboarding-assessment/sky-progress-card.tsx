"use client";

import { useEffect } from "react";
import { NightSkyCanvas, sky } from "@/components/auth/night-sky";

/** Small dark panel under the section list: the constellation connects as the assessment progresses. */
export function SkyProgressCard({ percent }: { percent: number }) {
  useEffect(() => {
    sky.setProgress(percent / 100);
  }, [percent]);

  useEffect(() => () => sky.reset(), []);

  return (
    <div className="relative isolate h-44 overflow-hidden rounded-bento-sm bg-[#06100e] p-4 text-cloud shadow-bento-lift">
      <div className="pointer-events-none absolute -left-1/2 -top-1/2 -z-10 size-72 rounded-full bg-[radial-gradient(closest-side,rgba(25,211,174,0.22),transparent)] blur-2xl" />
      <NightSkyCanvas className="absolute inset-0 -z-10 size-full" />
      <div className="flex h-full flex-col justify-end">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-aurora-soft/60">Your legal map</p>
        <p className="mt-1 font-display text-3xl leading-none tabular-nums">
          {Math.round(percent)}
          <span className="text-[#7f918a]">%</span>
        </p>
        <p className="mt-1 text-[0.7rem] text-[#b9c4bf]">charted so far</p>
      </div>
    </div>
  );
}
