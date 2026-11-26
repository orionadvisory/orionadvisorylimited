import { Files, Sparkles, Upload } from "lucide-react";
import { IconChip } from "@orion/ui/components/ui/bento-card";
import { StatNumeral } from "@orion/ui/components/ui/stat-numeral";
import { cn } from "@orion/ui/utils";
import type { SourceFilter } from "./use-documents";

const tiles = [
  { key: "all", label: "All documents", sub: "Your legal library", icon: Files, tint: "bg-brand-soft border-brand/10" },
  { key: "generated", label: "Generated", sub: "Drafted by Orion AI", icon: Sparkles, tint: "bg-gold-soft border-gold/15" },
  { key: "uploaded", label: "Uploaded", sub: "Your existing files", icon: Upload, tint: "bg-ember-soft border-ember/15" },
] as const;

/** Tinted bento stat tiles that double as a source filter. */
export function DocStats({
  counts,
  loading,
  active,
  onChange,
}: {
  counts: Record<SourceFilter, number>;
  loading: boolean;
  active: SourceFilter;
  onChange: (f: SourceFilter) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4" role="group" aria-label="Filter documents by source">
      {tiles.map((t) => {
        const Icon = t.icon;
        const selected = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected && t.key !== "all" ? "all" : t.key)}
            className={cn(
              "focus-ring group relative flex min-h-32 min-w-0 flex-col rounded-bento-sm border p-3.5 text-left transition-all duration-300 sm:min-h-40 sm:rounded-bento sm:p-5",
              t.tint,
              "hover:-translate-y-0.5 hover:shadow-bento-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0",
              selected ? "ring-2 ring-ink/80 ring-offset-2 ring-offset-canvas" : ""
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 text-xs font-semibold leading-tight text-ink sm:text-sm">{t.label}</p>
              <IconChip tone="white" size="sm" className="hidden border-transparent sm:inline-flex">
                <Icon />
              </IconChip>
            </div>
            <div className="mt-auto pt-3">
              <StatNumeral value={loading ? "—" : counts[t.key]} />
              <p className="mt-1.5 hidden text-xs text-ink-soft sm:block">{t.sub}</p>
              <p
                className={cn(
                  "mt-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] transition-colors sm:mt-2",
                  selected ? "text-ink" : "text-ink-soft/60 group-hover:text-ink-soft"
                )}
              >
                {selected ? "Showing" : "Show"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
