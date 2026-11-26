"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { BentoCard, IconChip } from "@orion/ui/components/ui/bento-card";
import { ghostPillClass, PillArrow, primaryPillClass } from "../shared/pill";

/** Shown when a visitor tries to act on a finding: sign up / sign in to continue. */
export function AuthGateModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm print:hidden"
      onClick={onClose}
    >
      <BentoCard
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-gate-title"
        padding="lg"
        className="w-full max-w-sm text-center shadow-bento-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <IconChip tone="teal" size="lg" className="mx-auto">
          <Lock />
        </IconChip>
        <h3 id="auth-gate-title" className="mt-5 font-display text-3xl leading-tight tracking-tight text-ink">
          Sign up to take action
        </h3>
        <p className="mt-2 text-sm leading-6 text-mist">
          Create a free account to generate documents, get AI guidance, request expert help, and
          save your assessment.
        </p>
        <div className="mt-6 space-y-2.5">
          <Link href="/signup" className={`${primaryPillClass} w-full`} autoFocus>
            <span>Create free account</span>
            <PillArrow />
          </Link>
          <Link href="/login" className={`${ghostPillClass} w-full justify-center py-3`}>
            Already have an account? Sign in
          </Link>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring mt-4 rounded-full px-2 text-xs text-mist transition-colors hover:text-ink"
        >
          Continue browsing results
        </button>
      </BentoCard>
    </div>
  );
}
