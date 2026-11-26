import { cn } from "@orion/ui/utils";

export type SegmentTone = "ink" | "teal" | "gold" | "ember" | "aurora" | "muted" | "outline";

export interface PillSegment {
  label: string;
  value: number;
  tone?: SegmentTone;
}

const toneClasses: Record<SegmentTone, string> = {
  ink: "bg-ink text-[#f4efe6]",
  teal: "bg-brand text-white",
  gold: "bg-gold text-ink",
  ember: "bg-ember text-ink",
  aurora: "bg-aurora text-ink",
  muted:
    "bg-[repeating-linear-gradient(135deg,#e7dfd2_0,#e7dfd2_2px,transparent_2px,transparent_8px)] text-ink-soft",
  outline: "border border-line-strong bg-transparent text-ink-soft",
};

/**
 * Crextio-style segmented pill bar: each segment's width is proportional to
 * its value and shows its percentage inside. Labels sit above each segment.
 * Accessible as a single labelled list.
 */
export function PillSegments({
  segments,
  ariaLabel,
  showLabels = true,
  className,
}: {
  segments: PillSegment[];
  ariaLabel: string;
  showLabels?: boolean;
  className?: string;
}) {
  const visible = segments.filter((s) => s.value > 0);
  const total = visible.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  return (
    <ul aria-label={ariaLabel} className={cn("flex w-full gap-1.5", className)}>
      {visible.map((s) => {
        const pct = Math.round((s.value / total) * 100);
        return (
          <li
            key={s.label}
            className="min-w-[3.25rem]"
            style={{ flexGrow: s.value, flexBasis: 0 }}
          >
            {showLabels && (
              <span className="mb-1.5 block truncate text-[11px] font-medium text-mist">
                {s.label}
              </span>
            )}
            <span
              className={cn(
                "flex h-10 items-center rounded-full px-3 text-xs font-semibold tabular-nums",
                toneClasses[s.tone ?? "ink"]
              )}
            >
              <span className="sr-only">
                {s.label}: {s.value} ({pct}%)
              </span>
              <span aria-hidden="true">{pct}%</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
