import { cn } from "@orion/ui/utils";

export type ChipTone = "neutral" | "teal" | "gold" | "ember" | "ink" | "on-ink" | "aurora";

const tones: Record<ChipTone, string> = {
  neutral: "bg-canvas text-ink-soft border border-line",
  teal: "bg-brand-soft text-brand",
  gold: "bg-gold-soft text-gold-deep",
  ember: "bg-ember-soft text-ember-deep",
  ink: "bg-ink text-[#f4efe6]",
  "on-ink": "bg-white/10 text-[#f4efe6]",
  aurora: "bg-aurora text-ink",
};

/** Small pill for deltas and statuses ("+3 resolved", "High risk"). */
export function Chip({
  children,
  tone = "neutral",
  icon,
  className,
}: {
  children: React.ReactNode;
  tone?: ChipTone;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-5 [&_svg]:h-3 [&_svg]:w-3",
        tones[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
