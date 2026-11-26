"use client";

import { useRef } from "react";
import { useConstellation } from "./use-constellation";

export function ConstellationCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useConstellation(ref);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
