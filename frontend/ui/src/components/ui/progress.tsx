import { cn } from "@orion/ui/utils";

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  /** Accessible name for the bar (recommended when no visible label is associated). */
  label?: string;
}

export function Progress({ value, className, indicatorClassName, label }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full bg-canvas-deep rounded-full overflow-hidden", className)}
    >
      <div
        className={cn("h-full bg-brand rounded-full transition-all duration-500 motion-reduce:transition-none", indicatorClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
