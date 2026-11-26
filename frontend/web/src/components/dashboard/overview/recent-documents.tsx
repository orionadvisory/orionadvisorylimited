import Link from "next/link";
import { FileText, Sparkles, Upload } from "lucide-react";
import { ArrowButton } from "@orion/ui/components/ui/arrow-button";
import { BentoCard, BentoCardHeader, IconChip } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { formatDomain, formatShortDate } from "./overview-model";

interface RecentDoc {
  id: string;
  name: string;
  type: string;
  status: string;
  source?: "generated" | "uploaded";
  createdAt: Date;
}

export default function RecentDocuments({
  docs,
  className,
}: {
  docs: RecentDoc[];
  className?: string;
}) {
  return (
    <BentoCard as="section" aria-labelledby="recent-docs-title" className={className}>
      <BentoCardHeader
        title={<span id="recent-docs-title">Recent documents</span>}
        description={docs.length > 0 ? "Latest generated and uploaded files" : undefined}
        action={<ArrowButton href="/dashboard/documents" label="View all documents" linkComponent={Link} size="sm" />}
      />

      {docs.length === 0 ? (
        <div className="mt-5 flex flex-col items-start gap-3 rounded-bento-sm border border-dashed border-line-strong bg-canvas/60 p-5">
          <IconChip tone="white">
            <FileText />
          </IconChip>
          <div>
            <p className="text-sm font-semibold text-ink">No documents yet</p>
            <p className="mt-1 text-sm text-mist">
              Generate your first agreement or upload an existing one to keep everything in one place.
            </p>
          </div>
          <Link
            href="/dashboard/documents"
            className="focus-ring inline-flex items-center rounded-full bg-ink px-4 py-2 text-sm font-medium text-[#f4efe6] transition-colors hover:bg-brand"
          >
            Create a document
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {docs.map((doc) => {
            const uploaded = doc.source === "uploaded";
            return (
              <li key={doc.id}>
                <Link
                  href="/dashboard/documents"
                  className="focus-ring group flex items-center gap-3 rounded-full bg-canvas/70 p-1.5 pr-4 transition-colors hover:bg-canvas-deep"
                >
                  <IconChip tone={uploaded ? "teal" : "gold"}>{uploaded ? <Upload /> : <Sparkles />}</IconChip>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{doc.name}</span>
                    <span className="block truncate text-xs text-mist">
                      {formatDomain(doc.type)} · {formatShortDate(doc.createdAt)}
                    </span>
                  </span>
                  <Chip tone={uploaded ? "teal" : "gold"} className="hidden sm:inline-flex">
                    {uploaded ? "Uploaded" : "Generated"}
                  </Chip>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </BentoCard>
  );
}
