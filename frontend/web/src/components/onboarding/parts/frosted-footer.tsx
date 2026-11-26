import { cn } from "@orion/ui/utils";

/** Fixed, frosted action bar pinned to the bottom of the viewport. */
export function FrostedFooter({
  start,
  end,
  hint,
  className,
}: {
  /** Left slot — usually the Back pill. */
  start?: React.ReactNode;
  /** Right slot — the primary action. */
  end: React.ReactNode;
  /** Optional muted line shown between the actions on wider screens. */
  hint?: React.ReactNode;
  /** Width constraint for the inner row (defaults to max-w-6xl). */
  className?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line/70 bg-canvas/80 backdrop-blur-xl">
      <div className={cn("mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6", className)}>
        <div className="shrink-0">{start}</div>
        {hint ? (
          <p className="hidden flex-1 text-center font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mist md:block">
            {hint}
          </p>
        ) : (
          <span className="flex-1" />
        )}
        <div className="shrink-0">{end}</div>
      </div>
    </div>
  );
}
