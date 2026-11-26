"use client";

import { ArrowRight, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@orion/ui/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Primary ink pill with a round arrow chip (matches the auth submit button). */
export function PrimaryPill({
  children,
  icon,
  busy = false,
  className,
  type = "button",
  ...props
}: ButtonProps & { icon?: React.ReactNode; busy?: boolean }) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        "group focus-ring inline-flex items-center justify-between gap-3 rounded-full bg-ink py-1.5 pl-5 pr-1.5 text-sm font-medium text-cloud shadow-[0_18px_40px_-14px_rgba(12,26,23,0.55)] transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:bg-ink/35 disabled:shadow-none disabled:hover:bg-ink/35",
        className
      )}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-full bg-cloud text-brand transition-transform duration-500 group-enabled:group-hover:-rotate-45 [&_svg]:size-4"
      >
        {busy ? <Loader2 className="animate-spin" /> : (icon ?? <ArrowRight />)}
      </span>
    </button>
  );
}

/** Quiet outline pill, used for "Back". */
export function GhostPill({ children, className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        "focus-ring inline-flex items-center gap-1.5 rounded-full border border-line bg-white/70 py-2.5 pl-3 pr-4 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/70",
        className
      )}
    >
      <ChevronLeft className="size-4" aria-hidden="true" />
      {children}
    </button>
  );
}
