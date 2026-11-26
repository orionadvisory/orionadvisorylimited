import { cn } from "@orion/ui/utils";

export interface StatNumeralProps {
  value: React.ReactNode;
  /** Small muted label under (or beside) the figure. */
  label?: React.ReactNode;
  /** Unit rendered small next to the figure, e.g. "/100" or "%". */
  suffix?: React.ReactNode;
  /** Chip rendered top-right of the figure (delta / status). */
  chip?: React.ReactNode;
  size?: "md" | "lg" | "xl";
  /** Set inside an `ink` card so the label stays readable. */
  onInk?: boolean;
  className?: string;
}

const sizes = {
  md: "text-4xl sm:text-5xl",
  lg: "text-5xl sm:text-6xl",
  xl: "text-6xl sm:text-7xl",
};

/** Oversized display-serif figure with a tiny label — the bento "big number". */
export function StatNumeral({
  value,
  label,
  suffix,
  chip,
  size = "md",
  onInk = false,
  className,
}: StatNumeralProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-start gap-2">
        <p
          className={cn(
            "font-display leading-[0.9] tracking-tight tabular-nums",
            sizes[size],
            onInk ? "text-[#f4efe6]" : "text-ink"
          )}
        >
          {value}
          {suffix && (
            <span
              className={cn(
                "ml-1 align-baseline font-sans text-sm font-medium tracking-normal",
                onInk ? "text-[#b9c4bf]" : "text-mist"
              )}
            >
              {suffix}
            </span>
          )}
        </p>
        {chip && <div className="pt-0.5">{chip}</div>}
      </div>
      {label && (
        <p
          className={cn(
            "mt-2 text-xs font-medium",
            onInk ? "text-[#b9c4bf]" : "text-mist"
          )}
        >
          {label}
        </p>
      )}
    </div>
  );
}
