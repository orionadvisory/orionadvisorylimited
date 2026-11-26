import { Download, Eye, Sparkles, Upload } from "lucide-react";
import { IconChip } from "@orion/ui/components/ui/bento-card";
import { Chip, type ChipTone } from "@orion/ui/components/ui/chip";
import { type Doc, formatDocDate } from "./use-documents";

const statusConfig: Record<string, { label: string; tone: ChipTone }> = {
  ready: { label: "Ready", tone: "teal" },
  draft: { label: "Draft", tone: "gold" },
  generating: { label: "Generating", tone: "neutral" },
  signed: { label: "Signed", tone: "teal" },
  expired: { label: "Expired", tone: "ember" },
};

const actionBtn =
  "focus-ring grid size-9 place-items-center rounded-full border border-line bg-white text-ink-soft transition-colors hover:border-ink hover:bg-ink hover:text-cloud";

/** One document row: icon chip, name + meta, source/status chips and always-visible actions. */
export function DocRow({ doc, onView, onDownload }: { doc: Doc; onView: () => void; onDownload: () => void }) {
  const uploaded = doc.source === "uploaded";
  const status = statusConfig[doc.status] || statusConfig.draft;

  return (
    <li className="group flex items-center gap-3 rounded-[22px] p-2 pr-2.5 transition-colors hover:bg-canvas sm:gap-4 sm:p-2.5 sm:pr-3">
      <button
        type="button"
        onClick={onView}
        className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-full text-left sm:gap-4"
      >
        <IconChip tone={uploaded ? "ember" : "gold"} className="transition-transform duration-300 group-hover:scale-105">
          {uploaded ? <Upload /> : <Sparkles />}
        </IconChip>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{doc.name}</span>
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-mist">
            <span className="truncate">{doc.type}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{formatDocDate(doc.createdAt)}</span>
          </span>
        </span>
      </button>

      <div className="hidden shrink-0 items-center gap-1.5 md:flex">
        <Chip tone={uploaded ? "ember" : "gold"}>{uploaded ? "Uploaded" : "Generated"}</Chip>
        <Chip tone={status.tone}>{status.label}</Chip>
      </div>
      <span className="md:hidden">
        <span
          className={`block size-2 rounded-full ${status.tone === "teal" ? "bg-brand" : status.tone === "ember" ? "bg-ember" : "bg-gold"}`}
          title={status.label}
        />
        <span className="sr-only">{status.label}</span>
      </span>

      <div className="flex shrink-0 items-center gap-1.5">
        <button type="button" onClick={onView} className={`${actionBtn} hidden sm:grid`} aria-label={`View ${doc.name}`}>
          <Eye className="size-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={onDownload} className={actionBtn} aria-label={`Download ${doc.name}`}>
          <Download className="size-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
