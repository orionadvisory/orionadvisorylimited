"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MailCheck, XCircle } from "lucide-react";
import { confirmEmail } from "@/app/actions/email-verification";

/**
 * Confirmation needs a click: email security scanners open links automatically,
 * and consuming the single-use token on page load would let them spend it first.
 */
export function ConfirmEmailCard({ token }: { token: string | null }) {
  const [state, setState] = useState<"idle" | "done" | "error">(token ? "idle" : "error");
  const [error, setError] = useState(token ? "" : "This confirmation link is incomplete. Open the link from your email again.");
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await confirmEmail(token!);
      if ("error" in result) {
        setError(result.error ?? "This confirmation link is invalid or has expired");
        setState("error");
      } else {
        setState("done");
      }
    });

  const Icon = state === "done" ? CheckCircle2 : state === "error" ? XCircle : MailCheck;

  return (
    <div className="w-full max-w-md rounded-bento border border-line bg-white p-8 text-center shadow-bento">
      <Icon className={`mx-auto h-10 w-10 ${state === "error" ? "text-ember-deep" : "text-brand"}`} />
      <h1 className="mt-5 font-display text-3xl text-ink">
        {state === "done" ? "Email confirmed" : state === "error" ? "Link not valid" : "Confirm your email"}
      </h1>
      <p className="mt-3 text-sm leading-6 text-ink-soft">
        {state === "done"
          ? "Thanks — your email address is confirmed. Your team can now add you to their workspace."
          : state === "error"
            ? `${error} You can request a new link from your dashboard.`
            : "Press the button below to confirm this is your email address."}
      </p>
      {state === "idle" && (
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-brand disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Confirming…" : "Confirm my email"}
        </button>
      )}
      {state !== "idle" && (
        <Link href="/dashboard" className="mt-7 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-brand">
          Go to ORION
        </Link>
      )}
    </div>
  );
}
