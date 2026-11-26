import Link from "next/link";
import { ArrowButton } from "@orion/ui/components/ui/arrow-button";
import { BentoCard, type BentoVariant } from "@orion/ui/components/ui/bento-card";
import { StatNumeral } from "@orion/ui/components/ui/stat-numeral";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Small line under the figure. */
  hint?: string;
  /** When set, the card gets a ↗ link in its corner. */
  href?: string;
  linkLabel?: string;
  variant?: Exclude<BentoVariant, "ink">;
  chip?: React.ReactNode;
}

/** Admin stat tile: label, oversized numeral, optional ↗ link. */
export function StatCard({
  label,
  value,
  hint,
  href,
  linkLabel,
  variant = "surface",
  chip,
}: StatCardProps) {
  return (
    <BentoCard variant={variant} padding="sm" className="flex min-h-40 flex-col">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <div className="min-w-0">
          <StatNumeral value={value} chip={chip} />
          {hint && <p className="mt-2 text-xs text-ink-soft">{hint}</p>}
        </div>
        {href && (
          <ArrowButton
            href={href}
            label={linkLabel ?? `Open ${label.toLowerCase()}`}
            linkComponent={Link}
            className={variant === "surface" ? undefined : "border-transparent"}
          />
        )}
      </div>
    </BentoCard>
  );
}
