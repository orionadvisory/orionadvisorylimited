"use client";

import { useState, type InputHTMLAttributes } from "react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

export function AuthField({ label, type = "text", ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const [shown, setShown] = useState(false);
  const isPassword = type === "password";
  return (
    <label className="group block">
      <span className="mb-2 block font-mono text-[0.68rem] uppercase tracking-[0.18em] text-mist">{label}</span>
      <span className="relative block">
        <input
          {...props}
          type={isPassword && shown ? "text" : type}
          className="peer w-full rounded-2xl border border-line bg-white/80 px-4 py-3.5 text-[0.95rem] text-ink shadow-[0_1px_0_rgba(12,26,23,0.03)] outline-none transition-all placeholder:text-mist/50 hover:border-line-strong focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            className="absolute inset-y-0 right-3 my-auto grid size-8 place-items-center rounded-full text-mist transition-colors hover:bg-canvas-deep hover:text-ink"
            aria-label={shown ? "Hide password" : "Show password"}
          >
            {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </span>
    </label>
  );
}

export function AuthSubmit({ pending, idle, busy }: { pending: boolean; idle: string; busy: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="group mt-2 flex w-full items-center justify-between rounded-full bg-ink py-2 pl-6 pr-2 font-medium text-cloud shadow-[0_18px_40px_-14px_rgba(12,26,23,0.55)] transition-colors hover:bg-brand disabled:cursor-wait disabled:opacity-90"
    >
      <span>{pending ? busy : idle}</span>
      <span className="grid size-10 place-items-center rounded-full bg-cloud text-brand transition-transform duration-500 group-hover:-rotate-45">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
      </span>
    </button>
  );
}

export function AuthError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-2xl border border-ember/20 bg-ember-soft px-4 py-3 text-sm text-ember-deep">
      {message}
    </p>
  );
}
