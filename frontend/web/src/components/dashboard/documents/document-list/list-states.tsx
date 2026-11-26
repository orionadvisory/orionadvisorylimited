import { FileText, Plus, SearchX, X } from "lucide-react";
import { IconChip } from "@orion/ui/components/ui/bento-card";

export function GenerateButton({ onClick, label = "Generate document" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring group inline-flex shrink-0 items-center gap-2 rounded-full bg-ink py-1.5 pl-4 pr-1.5 text-sm font-medium text-cloud shadow-[0_18px_40px_-18px_rgba(12,26,23,0.55)] transition-colors hover:bg-brand"
    >
      <span>{label}</span>
      <span className="grid size-8 place-items-center rounded-full bg-cloud text-brand transition-transform duration-500 group-hover:rotate-90">
        <Plus className="size-4" aria-hidden="true" />
      </span>
    </button>
  );
}

export function ListSkeleton() {
  return (
    <ul className="space-y-1" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex items-center gap-4 p-2.5">
          <span className="size-10 shrink-0 animate-pulse rounded-full bg-canvas-deep" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-1/2 animate-pulse rounded-full bg-canvas-deep" />
            <span className="block h-2.5 w-1/3 animate-pulse rounded-full bg-canvas" />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({ hasDocs, onGenerate, onClear }: { hasDocs: boolean; onGenerate: () => void; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-bento-sm border border-dashed border-line-strong bg-canvas/60 px-6 py-12 text-center">
      <IconChip tone={hasDocs ? "white" : "gold"} size="lg">
        {hasDocs ? <SearchX /> : <FileText />}
      </IconChip>
      <div>
        <p className="font-display text-2xl leading-tight text-ink sm:text-3xl">
          {hasDocs ? "Nothing matches that search" : "Your library is waiting"}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-mist">
          {hasDocs
            ? "Try a different name, or clear the filters to see everything."
            : "Generate your first agreement in minutes — Orion drafts it from your startup profile."}
        </p>
      </div>
      {hasDocs ? (
        <button
          type="button"
          onClick={onClear}
          className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          <X className="size-3.5" aria-hidden="true" /> Clear filters
        </button>
      ) : (
        <GenerateButton onClick={onGenerate} label="Generate your first document" />
      )}
    </div>
  );
}
