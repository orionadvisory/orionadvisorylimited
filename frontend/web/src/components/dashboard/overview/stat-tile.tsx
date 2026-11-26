import Link from "next/link";
import { ArrowButton } from "@orion/ui/components/ui/arrow-button";
import { BentoCard, IconChip, type BentoVariant } from "@orion/ui/components/ui/bento-card";
import { StatNumeral } from "@orion/ui/components/ui/stat-numeral";

interface StatTileProps {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  href: string;
  linkLabel: string;
  variant: Extract<BentoVariant, "tinted-teal" | "tinted-gold" | "tinted-ember">;
  chip?: React.ReactNode;
}

/** Tinted bento stat: label + icon, big numeral, sub-line and ↗ link. */
export function StatTile({ label, value, sub, icon, href, linkLabel, variant, chip }: StatTileProps) {
  return (
    <BentoCard variant={variant} padding="sm" className="flex min-h-36 flex-col sm:min-h-44">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <IconChip tone="white" size="sm" className="border-transparent">
          {icon}
        </IconChip>
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <div className="min-w-0">
          <StatNumeral value={value} chip={chip} />
          <p className="mt-2 text-xs text-ink-soft">{sub}</p>
        </div>
        <ArrowButton href={href} label={linkLabel} linkComponent={Link} className="border-transparent" />
      </div>
    </BentoCard>
  );
}
