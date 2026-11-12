"use client";

import { cn } from "@orion/ui/utils";

/**
 * Card whose border and wash glow follow the pointer. The glow itself is pure
 * CSS (.spotlight in marketing.css); this only feeds it --mx / --my.
 */
export function SpotlightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div onPointerMove={onPointerMove} className={cn("spotlight", className)}>
      {children}
    </div>
  );
}
