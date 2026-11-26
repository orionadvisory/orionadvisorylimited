"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Search } from "lucide-react";
import { BentoCard, BentoCardHeader } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import DocumentGenerator from "../document-generator";
import { PaperDocument } from "../paper-document";
import { DocStats } from "./doc-stats";
import { DocRow } from "./doc-row";
import { EmptyState, GenerateButton, ListSkeleton } from "./list-states";
import { type Doc, downloadDoc, formatDocDate, useDocuments } from "./use-documents";

export default function DocumentList() {
  const [mode, setMode] = useState<"list" | "generate" | "view">("list");
  const [viewDoc, setViewDoc] = useState<Doc | null>(null);
  const { docs, loading, search, setSearch, sourceFilter, setSourceFilter, counts, filtered, fetchDocs } =
    useDocuments();

  if (mode === "generate") {
    return (
      <div>
        <button
          type="button"
          onClick={() => setMode("list")}
          className="focus-ring group mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/80 py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-white"
        >
          <span className="grid size-7 place-items-center rounded-full bg-canvas transition-transform duration-300 group-hover:-translate-x-0.5">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
          </span>
          Back to documents
        </button>
        <DocumentGenerator
          onDocGenerated={() => {
            fetchDocs();
          }}
        />
      </div>
    );
  }

  if (mode === "view" && viewDoc) {
    return (
      <PaperDocument
        name={viewDoc.name}
        meta={`${viewDoc.type} · ${formatDocDate(viewDoc.createdAt)}`}
        content={viewDoc.content}
        sourceLabel={viewDoc.source === "uploaded" ? "Uploaded" : "Generated"}
        onDownload={() => downloadDoc(viewDoc)}
        onBack={() => {
          setMode("list");
          setViewDoc(null);
        }}
      />
    );
  }

  const filtering = search !== "" || sourceFilter !== "all";

  return (
    <div className="space-y-4 sm:space-y-5">
      <DocStats counts={counts} loading={loading} active={sourceFilter} onChange={setSourceFilter} />

      <BentoCard as="section" aria-labelledby="doc-library-title" padding="none" className="p-3 sm:p-5">
        <div className="flex flex-col gap-3 px-1 pb-3 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-1.5 sm:pb-4">
          <BentoCardHeader
            title={<span id="doc-library-title">Library</span>}
            description={
              loading
                ? "Loading your documents…"
                : `${filtered.length} of ${docs.length} document${docs.length === 1 ? "" : "s"}`
            }
            action={sourceFilter !== "all" ? <Chip tone="ink">{sourceFilter}</Chip> : undefined}
            className="sm:flex-1"
          />
          <div className="flex items-center gap-2">
            <label className="group relative flex min-w-0 flex-1 items-center sm:w-72 sm:flex-none">
              <span className="sr-only">Search documents</span>
              <Search
                className="pointer-events-none absolute left-4 size-4 text-mist transition-colors group-focus-within:text-brand"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search documents…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-line bg-canvas/60 py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-all placeholder:text-mist/60 hover:border-line-strong focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
              />
            </label>
            <span className="hidden sm:inline-flex">
              <GenerateButton onClick={() => setMode("generate")} />
            </span>
            <button
              type="button"
              onClick={() => setMode("generate")}
              aria-label="Generate document"
              className="focus-ring grid size-11 shrink-0 place-items-center rounded-full bg-ink text-cloud transition-colors hover:bg-brand sm:hidden"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {loading ? (
          <ListSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            hasDocs={docs.length > 0}
            onGenerate={() => setMode("generate")}
            onClear={() => {
              setSearch("");
              setSourceFilter("all");
            }}
          />
        ) : (
          <ul className="space-y-1">
            {filtered.map((doc) => (
              <DocRow
                key={doc.id}
                doc={doc}
                onView={() => {
                  setViewDoc(doc);
                  setMode("view");
                }}
                onDownload={() => downloadDoc(doc)}
              />
            ))}
          </ul>
        )}

        {!loading && filtering && filtered.length > 0 && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSourceFilter("all");
              }}
              className="focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-mist transition-colors hover:bg-canvas hover:text-ink"
            >
              Show all documents <ArrowRight className="size-3" aria-hidden="true" />
            </button>
          </div>
        )}
      </BentoCard>
    </div>
  );
}
