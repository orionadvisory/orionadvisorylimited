"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { BentoCard } from "@orion/ui/components/ui/bento-card";
import { cn } from "@orion/ui/utils";

const stages = [
  "Reading your startup profile",
  "Applying jurisdiction rules",
  "Drafting clauses",
  "Polishing the final document",
];

/** Generation-in-progress: pulsing orb, staged checklist and a shimmering paper preview. */
export function GeneratingState({ templateName }: { templateName?: string }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStage((s) => Math.min(s + 1, stages.length - 1)), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <BentoCard padding="lg" className="mx-auto max-w-3xl overflow-hidden" aria-live="polite" aria-busy="true">
      <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <div className="relative mb-6 grid size-16 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand/15 motion-reduce:animate-none" />
            <span className="absolute inset-1.5 rounded-full bg-brand-soft" />
            <span className="relative grid size-10 place-items-center rounded-full bg-ink text-cloud">
              <Sparkles className="size-4 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
            </span>
          </div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-brand">Orion is drafting</p>
          <h3 className="mt-2 font-display text-3xl leading-[1.05] tracking-tight text-ink sm:text-4xl">
            Your <em className="text-brand">{templateName ?? "document"}</em> is taking shape
          </h3>
          <p className="mt-2 text-sm text-mist">This usually takes 10–20 seconds.</p>

          <ol className="mt-6 space-y-2.5">
            {stages.map((label, i) => {
              const done = i < stage;
              const active = i === stage;
              return (
                <li key={label} className="flex items-center gap-3 text-sm">
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-500",
                      done && "border-brand bg-brand text-white",
                      active && "border-brand bg-brand-soft",
                      !done && !active && "border-line bg-canvas"
                    )}
                  >
                    {done ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : active ? (
                      <span className="size-1.5 animate-pulse rounded-full bg-brand" />
                    ) : null}
                  </span>
                  <span className={cn("transition-colors duration-500", done || active ? "text-ink" : "text-mist")}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div
          aria-hidden="true"
          className="hidden w-48 rotate-2 rounded-2xl border border-line bg-white p-5 shadow-bento-lift sm:block"
        >
          <div className="h-3 w-2/3 rounded-full bg-ink/80" />
          <div className="mt-4 space-y-2">
            {[100, 92, 96, 70, 0, 88, 94, 60].map((w, i) =>
              w === 0 ? (
                <div key={i} className="h-2" />
              ) : (
                <div
                  key={i}
                  className="h-1.5 animate-pulse rounded-full bg-canvas-deep motion-reduce:animate-none"
                  style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                />
              )
            )}
          </div>
          <div className="mt-5 h-6 w-20 rounded-full bg-gold-soft" />
        </div>
      </div>
    </BentoCard>
  );
}
