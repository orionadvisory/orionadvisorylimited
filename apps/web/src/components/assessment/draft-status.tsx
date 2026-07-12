"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, AlertCircle, Cloud } from "lucide-react";
import type { SaveState } from "./use-assessment-draft";

interface DraftStatusProps {
  state: SaveState;
  lastSavedAt: Date | null;
}

function formatRelative(date: Date): string {
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function DraftStatus({ state, lastSavedAt }: DraftStatusProps) {
  const [, force] = useState(0);

  // Tick the "x seconds ago" label once a minute
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
        <Loader2 className="w-3 h-3 animate-spin" />
        Saving...
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-red-500">
        <AlertCircle className="w-3 h-3" />
        Couldn&apos;t save
      </span>
    );
  }

  if (state === "saved" && lastSavedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
        <Check className="w-3 h-3" />
        Saved {formatRelative(lastSavedAt)}
      </span>
    );
  }

  if (lastSavedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
        <Cloud className="w-3 h-3" />
        Resumed from {formatRelative(lastSavedAt)}
      </span>
    );
  }

  return null;
}
