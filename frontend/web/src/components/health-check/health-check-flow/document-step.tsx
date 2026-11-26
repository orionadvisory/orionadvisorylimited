import { useMemo } from "react";
import { getRelevantDocuments } from "@orion/core/health-check/questions";
import type { ProfileData } from "@orion/core/health-check/types";
import { ToggleRow } from "./choice";

export function DocumentStep({
  profile,
  documentsHeld,
  onToggle,
}: {
  profile: ProfileData;
  documentsHeld: Set<string>;
  onToggle: (docId: string) => void;
}) {
  const relevantDocs = useMemo(() => getRelevantDocuments(profile), [profile]);

  // Group by domain
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
    <div className="space-y-7">
      <p className="rounded-2xl border border-brand/15 bg-brand-soft px-4 py-3 text-sm leading-6 text-ink-soft">
        <span className="font-semibold text-ink">Tick the documents you already have.</span>{" "}
        Don&apos;t worry if you&apos;re missing some — that&apos;s what we&apos;re here to find out.
      </p>

      {grouped.map(([domain, docs]) => (
        <section key={domain}>
          <h3 className="mb-3 flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-mist">
            {domain}
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <span className="tabular-nums">
              {docs.filter((d) => documentsHeld.has(d.id)).length}/{docs.length}
            </span>
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {docs.map((doc) => (
              <ToggleRow
                key={doc.id}
                checked={documentsHeld.has(doc.id)}
                onToggle={() => onToggle(doc.id)}
                title={doc.name}
                description={doc.description}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
