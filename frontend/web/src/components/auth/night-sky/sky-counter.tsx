"use client";

import { useSyncExternalStore } from "react";
import { ORION_LINKS, ORION_STARS } from "@/components/marketing/hero/constellation-data";
import { sky } from "./signal";

/** "05 / 08 domains charted" — counts stars whose links the form has connected so far. */
export function SkyCounter() {
  const { progress, mood } = useSyncExternalStore(sky.subscribe, sky.get, sky.getServer);
  const links = mood === "success" ? ORION_LINKS.length : Math.floor(progress * ORION_LINKS.length + 0.02);
  const stars = new Set<number>();
  ORION_LINKS.slice(0, links).forEach(([a, z]) => stars.add(a).add(z));
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <p className="kicker flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-aurora-soft/70" aria-live="off">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-aurora opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-aurora" />
      </span>
      <span className="tabular-nums text-aurora">{pad(stars.size)}</span>
      <span>/ {pad(ORION_STARS.length)} domains charted</span>
    </p>
  );
}
