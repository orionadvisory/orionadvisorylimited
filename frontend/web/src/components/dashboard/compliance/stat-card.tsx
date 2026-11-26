import { BentoCard } from "@orion/ui/components/ui/bento-card";

export function StatCard({ label, value, hint, variant = "surface" }: {
  label: string;
  value: number;
  hint: string;
  variant?: "ink" | "tinted-gold" | "surface";
}) {
  const dark = variant === "ink";
  return (
    <BentoCard variant={variant}>
      <p className={`text-xs font-medium ${dark ? "text-[#b9c4bf]" : "text-mist"}`}>{label}</p>
      <p className={`mt-4 font-display text-4xl ${dark ? "text-[#f4efe6]" : "text-ink"}`}>{value}</p>
      <p className={`mt-2 text-xs ${dark ? "text-[#b9c4bf]" : "text-mist"}`}>{hint}</p>
    </BentoCard>
  );
}
