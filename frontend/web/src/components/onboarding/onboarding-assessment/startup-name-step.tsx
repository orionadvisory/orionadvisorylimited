"use client";

import { useState } from "react";
import { Clock3, CloudUpload, LayoutDashboard } from "lucide-react";
import { BentoCard, IconChip } from "@orion/ui/components/ui/bento-card";
import { fieldInputClass, fieldLabelClass } from "@/components/assessment/question-field/styles";
import { PrimaryPill } from "../parts/pill-buttons";
import { AssessmentTopbar } from "./assessment-topbar";

const PERKS = [
  { icon: Clock3, title: "About 10 minutes", body: "Short sections, plain-English questions." },
  { icon: CloudUpload, title: "Autosaves as you go", body: "Leave any time and pick up where you left off." },
  { icon: LayoutDashboard, title: "Builds your dashboard", body: "Scores, gaps and a prioritised plan." },
];

/** First onboarding step: capture the startup's name before the assessment. */
export function StartupNameStep({ onContinue }: { onContinue: (name: string) => void }) {
  const [name, setName] = useState("");
  const trimmed = name.trim();

  return (
    <div className="flex min-h-svh flex-col">
      <AssessmentTopbar title="Legal Health Check" />

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-10 sm:px-6 lg:py-16">
        <div className="grid w-full gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-brand">
              Step 01 <span className="text-mist">· Your company</span>
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[0.98] tracking-tight text-ink text-balance sm:text-6xl">
              What&apos;s your <em className="text-brand">startup</em> called?
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-mist">
              We&apos;ll use this across your dashboard and generated documents.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (trimmed) onContinue(trimmed);
              }}
              className="mt-8 max-w-md space-y-4"
            >
              <label className="block">
                <span className={fieldLabelClass}>Startup name</span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Inc."
                  className={fieldInputClass}
                />
              </label>
              <PrimaryPill type="submit" disabled={!trimmed} className="w-full">
                Continue
              </PrimaryPill>
            </form>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
            {PERKS.map(({ icon: Icon, title, body }) => (
              <BentoCard as="li" key={title} padding="sm" className="flex items-start gap-3">
                <IconChip tone="teal" size="sm">
                  <Icon />
                </IconChip>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-mist">{body}</p>
                </div>
              </BentoCard>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
