"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logOut } from "@/app/actions/auth";

interface SaveExitButtonProps {
  onSave: () => Promise<void>;
}

export function SaveExitButton({ onSave }: SaveExitButtonProps) {
  const [saving, setSaving] = useState(false);

  const handleClick = async () => {
    setSaving(true);
    try {
      await onSave();
      await logOut();
    } catch {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      className="focus-ring inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-ink hover:bg-ink hover:text-cloud disabled:cursor-wait disabled:opacity-70"
    >
      {saving ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Saving...</span>
        </>
      ) : (
        <>
          <LogOut className="size-3.5" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Save &amp; log out</span>
        </>
      )}
    </button>
  );
}
