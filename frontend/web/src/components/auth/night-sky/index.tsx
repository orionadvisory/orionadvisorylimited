"use client";

import { useRef } from "react";
import { useNightSky } from "./use-night-sky";

export function NightSkyCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useNightSky(ref);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

export { sky } from "./signal";
