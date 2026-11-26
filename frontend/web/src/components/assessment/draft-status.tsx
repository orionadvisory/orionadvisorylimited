"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, AlertCircle, Cloud } from "lucide-react";
import { cn } from "@orion/ui/utils";
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

function StatusPill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] [&_svg]:size-3",
        className
      )}
    >
      {children}
    </span>
  );
}

export function DraftStatus({ state, lastSavedAt }: DraftStatusProps) {
  const [, force] = useState(0);

  // Re-render periodically so the "x ago" label stays fresh
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (state === "saving") {
    return (
      <StatusPill className="text-mist">
        <Loader2 className="animate-spin" aria-hidden="true" />
        Saving...
      </StatusPill>
    );
  }

  if (state === "error") {
    return (
      <StatusPill className="bg-ember-soft text-ember-deep">
        <AlertCircle aria-hidden="true" />
        Couldn&apos;t save
      </StatusPill>
    );
  }

  if (state === "saved" && lastSavedAt) {
    return (
      <StatusPill className="bg-brand-soft text-brand">
        <Check aria-hidden="true" />
        Saved {formatRelative(lastSavedAt)}
      </StatusPill>
    );
  }

  if (lastSavedAt) {
    return (
      <StatusPill className="text-mist">
        <Cloud aria-hidden="true" />
        Resumed from {formatRelative(lastSavedAt)}
      </StatusPill>
    );
  }

  return null;
}
