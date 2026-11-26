import { Check, Sparkles } from "lucide-react";
import { BentoCard } from "@orion/ui/components/ui/bento-card";
import { Chip } from "@orion/ui/components/ui/chip";
import { cn } from "@orion/ui/utils";
import type { ServicePackage } from "@/lib/data/services";

/** Pricing-style bento tile. The popular package renders as the page's ink anchor. */
export function PackageCard({ service }: { service: ServicePackage }) {
  const onInk = service.popular;
  return (
    <BentoCard
      as="article"
      variant={onInk ? "ink" : "surface"}
      padding="lg"
      className={cn(
        "flex flex-col transition-all duration-300",
        onInk ? "lg:-my-3 lg:py-11" : "hover:-translate-y-1 hover:shadow-bento-lift motion-reduce:hover:translate-y-0"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={cn(
            "font-mono text-[0.7rem] uppercase tracking-[0.2em]",
            onInk ? "text-aurora" : "text-brand"
          )}
        >
          {service.name}
        </p>
        {onInk && (
          <Chip className="bg-aurora text-ink" icon={<Sparkles aria-hidden="true" />}>
            Most Popular
          </Chip>
        )}
      </div>

      <p className="mt-5 font-display text-6xl leading-none tracking-tight tabular-nums">
        <span className={cn("align-top text-3xl", onInk ? "text-[#7f918a]" : "text-mist")}>$</span>
        {service.price.toLocaleString()}
      </p>
      <p className={cn("mt-2 text-xs font-medium", onInk ? "text-[#b9c4bf]" : "text-mist")}>
        one-time · flat fee
      </p>
      <p className={cn("mt-4 text-sm leading-6", onInk ? "text-[#d7ded9]" : "text-ink-soft")}>
        {service.description}
      </p>

      <ul
        className={cn(
          "mt-6 space-y-3 border-t pt-6",
          onInk ? "border-white/[0.08]" : "border-line"
        )}
      >
        {service.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                onInk ? "bg-aurora text-ink" : "bg-brand-soft text-brand"
              )}
            >
              <Check className="size-3" strokeWidth={3} />
            </span>
            <span className={cn("text-sm", onInk ? "text-[#f4efe6]" : "text-ink-soft")}>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled
        className={cn(
          "mt-8 w-full cursor-not-allowed rounded-full px-5 py-3 text-sm font-medium",
          onInk ? "bg-white/10 text-[#d7ded9]" : "border border-line bg-canvas text-mist"
        )}
      >
        Coming soon
      </button>
    </BentoCard>
  );
}
