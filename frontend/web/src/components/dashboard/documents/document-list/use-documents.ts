"use client";

import { useCallback, useEffect, useState } from "react";

export interface Doc {
  id: string;
  name: string;
  type: string;
  status: string;
  content: string | null;
  source?: "generated" | "uploaded";
  createdAt: string;
}

export type SourceFilter = "all" | "generated" | "uploaded";

/** Generated docs download their text; uploads (no inline content) go via the API's signed URL. */
export function downloadDoc(doc: Doc) {
  if (!doc.content) {
    window.location.href = `/api/documents/${doc.id}/download`;
    return;
  }
  const blob = new Blob([doc.content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.name.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatDocDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** Loads /api/documents and exposes list, search and source-filter state. */
export function useDocuments() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: state is only set in async callbacks, and skipped after unmount.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/documents")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Doc[] | null) => {
        if (!cancelled && data) setDocs(data);
      })
      .catch(() => {
        // silently fail
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadedCount = docs.filter((d) => d.source === "uploaded").length;
  const counts = { all: docs.length, uploaded: uploadedCount, generated: docs.length - uploadedCount };

  const query = search.toLowerCase();
  const filtered = docs.filter((doc) => {
    if (!doc.name.toLowerCase().includes(query)) return false;
    if (sourceFilter === "uploaded") return doc.source === "uploaded";
    if (sourceFilter === "generated") return doc.source !== "uploaded";
    return true;
  });

  return { docs, loading, search, setSearch, sourceFilter, setSourceFilter, counts, filtered, fetchDocs };
}
