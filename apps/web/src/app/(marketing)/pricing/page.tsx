import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/lib/data/services";
import { PackageCard } from "@/components/marketing/packages/package-card";
import { SplitText } from "@/components/marketing/motion/split-text";
import { Reveal } from "@/components/marketing/motion/reveal";

export const metadata: Metadata = {
  title: "Legal Packages | Orion",
  description: "Clear, flat-fee legal packages for launching, funding, and scaling your company.",
};

export default function PricingPage() {
  return (
    <div className="relative isolate overflow-hidden px-5 pb-32 pt-40 sm:px-8 sm:pt-48">
      <div className="horizon-grid absolute inset-0 -z-10 opacity-60" />
      <div className="aurora aurora-a -z-10 left-[-10%] top-[-20%] size-[48rem]" />
      <div className="aurora aurora-b -z-10 right-[-15%] top-[20%] size-[44rem]" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className="kicker text-mist">Straightforward packages</p>
          <SplitText
            as="h1"
            immediate
            delay={0.15}
            className="mt-6 font-display text-[clamp(3.2rem,8vw,7.5rem)] leading-[0.9] tracking-[-0.03em]"
            segments={[{ text: "Legal support" }, { text: "\n" }, { text: "built for" }, { text: "your stage.", className: "italic text-aurora-gradient" }]}
          />
          <Reveal delay={0.6}>
            <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-mist">
              From setting up your company to closing your first round — a clear scope and a flat fee, without
              hourly surprises.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto mt-20 grid max-w-6xl items-stretch gap-6 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <PackageCard key={service.id} service={service} index={i} variant="full" />
          ))}
        </div>

        <Reveal className="glass mx-auto mt-20 flex max-w-3xl flex-col items-center gap-6 rounded-[2rem] px-8 py-10 text-center sm:flex-row sm:text-left">
          <div className="flex-1">
            <h2 className="font-display text-4xl">Not sure which fits?</h2>
            <p className="mt-2 text-pretty leading-relaxed text-mist">
              Take the free five-minute health check. We’ll show you what needs attention and which support makes sense.
            </p>
          </div>
          <Link
            href="/health-check"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-medium text-cloud transition-colors hover:bg-aurora-deep"
          >
            Check my legal health
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Reveal>

        <p className="kicker mt-12 text-center text-mist/70">Supporting founders in the UK, US, Nigeria & selected Free Zones</p>
      </div>
    </div>
  );
}
