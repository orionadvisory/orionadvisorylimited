"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { completeObligation } from "@/app/actions/compliance";

export function CompleteObligationButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(async () => { await completeObligation(id); })}
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-brand/30 hover:text-brand disabled:opacity-50"
    >
      <Check className="h-3.5 w-3.5" />
      {pending ? "Saving…" : "Mark complete"}
    </button>
  );
}
