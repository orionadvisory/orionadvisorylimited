import { ArrowLeft, Download } from "lucide-react";
import { Chip } from "@orion/ui/components/ui/chip";
import { cn } from "@orion/ui/utils";

/** Renders the lightweight markdown our generator emits (##, ###, -, **bold** lines). */
function renderLines(content: string) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("## "))
      return (
        <h2 key={i} className="mt-8 mb-3 font-display text-2xl leading-tight tracking-tight text-ink first:mt-0">
          {line.replace("## ", "")}
        </h2>
      );
    if (line.startsWith("### "))
      return (
        <h3 key={i} className="mt-6 mb-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-brand">
          {line.replace("### ", "")}
        </h3>
      );
    if (line.startsWith("- "))
      return (
        <li key={i} className="ml-5 list-disc pl-1 marker:text-gold">
          {line.replace("- ", "")}
        </li>
      );
    if (line.startsWith("**") && line.endsWith("**"))
      return (
        <p key={i} className="font-semibold text-ink">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    if (line.trim() === "") return <div key={i} aria-hidden="true" className="h-3" />;
    return <p key={i}>{line}</p>;
  });
}

interface PaperDocumentProps {
  name: string;
  /** Mono meta line, e.g. "NDA · 12 Mar 2026". */
  meta: string;
  content: string | null;
  sourceLabel?: string;
  onBack: () => void;
  backLabel?: string;
  onDownload: () => void;
  /** Optional footer below the paper (e.g. a disclaimer). */
  footer?: React.ReactNode;
}

/** Document viewer: a sticky toolbar above a white "paper" sheet with editorial typography. */
export function PaperDocument({
  name,
  meta,
  content,
  sourceLabel,
  onBack,
  backLabel = "Back to documents",
  onDownload,
  footer,
}: PaperDocumentProps) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="focus-ring group inline-flex items-center gap-2 rounded-full border border-line bg-white/80 py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-white"
        >
          <span className="grid size-7 place-items-center rounded-full bg-canvas transition-transform duration-300 group-hover:-translate-x-0.5">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
          </span>
          {backLabel}
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="focus-ring group inline-flex items-center gap-2 rounded-full bg-ink py-1.5 pl-4 pr-1.5 text-sm font-medium text-cloud transition-colors hover:bg-brand"
        >
          Download
          <span className="grid size-7 place-items-center rounded-full bg-cloud text-brand transition-transform duration-300 group-hover:translate-y-0.5">
            <Download className="size-3.5" aria-hidden="true" />
          </span>
        </button>
      </div>

      <article className="rounded-bento border border-line bg-white shadow-bento-lift">
        <header className="border-b border-line px-5 pb-6 pt-7 sm:px-10 sm:pt-10">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-mist">{meta}</p>
            {sourceLabel && <Chip tone="gold">{sourceLabel}</Chip>}
          </div>
          <h1 className="mt-3 break-words font-display text-3xl leading-[1.05] tracking-tight text-ink sm:text-4xl">
            {name}
          </h1>
        </header>
        <div
          className={cn(
            "px-5 py-7 text-[0.95rem] leading-7 text-ink-soft sm:px-10 sm:py-10",
            "break-words [&_p+p]:mt-3"
          )}
        >
          {content ? (
            renderLines(content)
          ) : (
            <div className="flex flex-col items-start gap-2 rounded-bento-sm border border-dashed border-line-strong bg-canvas/60 p-5">
              <p className="font-display text-xl text-ink">No preview for this file</p>
              <p className="text-sm text-mist">Uploaded files open in their original format — use Download to view it.</p>
            </div>
          )}
        </div>
      </article>

      {footer}
    </div>
  );
}
