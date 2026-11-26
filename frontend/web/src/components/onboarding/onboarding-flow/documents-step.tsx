"use client";

import { useMemo } from "react";
import { Info } from "lucide-react";
import { BentoCard, IconChip } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { getRelevantDocuments } from "@orion/core/health-check/questions";
import type { ProfileData } from "@orion/core/health-check/types";
import { FormError } from "../parts/form-error";
import { CheckTile } from "./option-tiles";

interface DocumentsStepProps {
  profile: ProfileData;
  documentsHeld: Set<string>;
  onToggle: (docId: string) => void;
  error: string;
}

/** Step 2: tick the documents already held, grouped by legal domain. */
export function DocumentsStep({ profile, documentsHeld, onToggle, error }: DocumentsStepProps) {
  const relevantDocs = useMemo(() => getRelevantDocuments(profile), [profile]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof relevantDocs> = {};
    for (const doc of relevantDocs) {
      const domain = doc.domain.replace("_", " ");
      if (!map[domain]) map[domain] = [];
      map[domain].push(doc);
    }
    return Object.entries(map);
  }, [relevantDocs]);

  return (
    <>
      <header className="mb-8">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-brand">
          Step 02 <span className="text-mist">/ 02 · Your documents</span>
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.02] tracking-tight text-ink text-balance sm:text-5xl">
          Which documents do you <em className="text-brand">have</em>?
        </h1>
        <p className="mt-4 max-w-2xl border-l-2 border-brand/40 pl-4 text-sm leading-relaxed text-mist">
          Based on your profile, these are relevant to your startup. Showing {relevantDocs.length} documents.
        </p>
      </header>

      <BentoCard variant="tinted-teal" padding="sm" className="mb-4 flex items-start gap-3">
        <IconChip tone="white" size="sm">
          <Info />
        </IconChip>
        <p className="text-sm leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">Tick the documents you already have.</span> Don&apos;t worry if
          you&apos;re missing some — our AI will identify the gaps and prioritise what matters.
        </p>
      </BentoCard>

      <FormError message={error} className="mb-4" />

      <div className="space-y-4">
        {grouped.map(([domain, docs]) => {
          const held = docs.filter((d) => documentsHeld.has(d.id)).length;
          return (
            <BentoCard as="section" key={domain} aria-label={domain}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-mist">{domain}</p>
                <Chip tone={held === docs.length ? "teal" : "neutral"}>
                  {held}/{docs.length} held
                </Chip>
              </div>
              <div className="grid gap-2.5">
                {docs.map((doc) => (
                  <CheckTile
                    key={doc.id}
                    checked={documentsHeld.has(doc.id)}
                    label={doc.name}
                    description={doc.description}
                    onClick={() => onToggle(doc.id)}
                  />
                ))}
              </div>
            </BentoCard>
          );
        })}
      </div>
    </>
  );
}
