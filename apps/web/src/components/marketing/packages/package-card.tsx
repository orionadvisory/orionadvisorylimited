import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@orion/ui/utils";
import type { ServicePackage } from "@/lib/data/services";
import { Reveal } from "../motion/reveal";
import { SpotlightCard } from "../motion/spotlight-card";

/**
 * Shared by the landing teaser (first three features, links to /pricing)
 * and the pricing page (every feature, links to signup).
 */
export function PackageCard({
  service,
  index,
  variant,
}: {
  service: ServicePackage;
  index: number;
  variant: "teaser" | "full";
}) {
  const features = variant === "teaser" ? service.features.slice(0, 3) : service.features;
  const hidden = service.features.length - features.length;

  return (
    <Reveal delay={index * 0.1} className="h-full">
      <div className={cn("relative h-full rounded-[1.75rem]", service.popular && "conic-border lg:-my-4")}>
        {service.popular && <span className="conic-ring" aria-hidden="true" />}
        <SpotlightCard
          className={cn(
            "flex h-full flex-col rounded-[1.75rem] border p-7 sm:p-9",
            service.popular ? "border-transparent bg-gradient-to-b from-[#0f2622] to-night-2" : "border-white/10 bg-night-2",
          )}
        >
          <div className="flex items-center justify-between">
            <p className="kicker text-haze">0{index + 1}</p>
            {service.popular && (
              <span className="rounded-full bg-aurora px-3 py-1 text-xs font-medium text-night">Most popular</span>
            )}
          </div>

          <h3 className="mt-8 font-display text-6xl tracking-tight">{service.name}</h3>
          <p className="mt-3 min-h-12 text-pretty leading-relaxed text-haze">{service.description}</p>

          <p className="mt-8 flex items-baseline gap-2 border-b border-white/10 pb-8">
            <span className="font-display text-5xl tabular-nums">${service.price.toLocaleString("en-US")}</span>
            <span className="text-sm text-haze">one-time</span>
          </p>

          <ul className="mt-8 flex-1 space-y-3.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed text-star/85">
                <Check className="mt-0.5 size-4 shrink-0 text-aurora" aria-hidden="true" />
                {feature}
              </li>
            ))}
            {hidden > 0 && <li className="pl-7 text-sm text-haze">+ {hidden} more</li>}
          </ul>

          <Link
            href={variant === "teaser" ? "/pricing" : "/signup"}
            className={cn(
              "group relative z-[2] mt-9 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-medium transition-colors",
              service.popular ? "btn-shine bg-aurora text-night hover:bg-aurora-soft" : "border border-white/15 bg-white/[0.03] text-star hover:bg-white/10",
            )}
          >
            {variant === "teaser" ? "See what’s included" : service.cta}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </SpotlightCard>
      </div>
    </Reveal>
  );
}
