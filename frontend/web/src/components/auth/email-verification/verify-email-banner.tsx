"use client";

import { useState, useTransition } from "react";
import { Loader2, MailWarning } from "lucide-react";
import { resendConfirmationEmail } from "@/app/actions/email-verification";

/** Shown across the app until the signed-in user confirms their email address. */
export function VerifyEmailBanner({ email }: { email: string }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const resend = () =>
    startTransition(async () => {
      const result = await resendConfirmationEmail();
      if ("error" in result) setMessage(result.error ?? "Unable to send the email");
      else setMessage(result.status === "already_verified" ? "Your email is already confirmed." : `Sent. Check ${email}.`);
    });

  return (
    <div role="status" className="flex flex-wrap items-center gap-3 border-b border-gold/20 bg-gold-soft px-4 py-2.5 text-sm text-ink-soft sm:px-6 lg:px-8">
      <MailWarning className="h-4 w-4 shrink-0 text-gold-deep" />
      <span className="min-w-0 flex-1">
        Confirm your email address <strong className="font-medium text-ink">{email}</strong> using the link we sent you.
      </span>
      {message ? (
        <span className="text-xs text-mist">{message}</span>
      ) : (
        <button type="button" onClick={resend} disabled={pending} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-white px-3 py-1 text-xs font-medium text-ink hover:border-gold disabled:opacity-60">
          {pending && <Loader2 className="h-3 w-3 animate-spin" />}
          Resend email
        </button>
      )}
    </div>
  );
}
