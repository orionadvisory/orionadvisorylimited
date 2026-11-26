import { ArrowRight } from "lucide-react";
import { cn } from "@orion/ui/utils";

/**
 * Pill buttons shared by the health check flows and results page. Same language as
 * the auth screens: an ink pill with a round arrow chip that tilts on hover, and a
 * quiet ghost pill for secondary actions.
 */
export const primaryPillClass =
  "focus-ring group inline-flex items-center justify-between gap-3 rounded-full bg-ink py-1.5 pl-5 pr-1.5 text-sm font-medium text-cloud shadow-[0_18px_40px_-14px_rgba(12,26,23,0.55)] transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:bg-ink/35 disabled:shadow-none";

export const ghostPillClass =
  "focus-ring inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-line-strong hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/70";

/** The round chip at the end of a primary pill. */
export function PillArrow({ icon, still = false }: { icon?: React.ReactNode; still?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-cloud text-brand transition-transform duration-500 [&_svg]:size-4",
        !still && "group-hover:-rotate-45"
      )}
    >
      {icon ?? <ArrowRight />}
    </span>
  );
}

interface PrimaryPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export function PrimaryPill({ icon, className, children, disabled, ...props }: PrimaryPillProps) {
  return (
    <button type="button" disabled={disabled} className={cn(primaryPillClass, className)} {...props}>
      <span className="truncate">{children}</span>
      <PillArrow icon={icon} still={disabled} />
    </button>
  );
}

export function GhostPill({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn(ghostPillClass, className)} {...props}>
      {children}
    </button>
  );
}
