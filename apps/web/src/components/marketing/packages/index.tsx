import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/lib/data/services";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { PackageCard } from "./package-card";

export function PackagesSection() {
  return (
    <section className="relative px-5 py-32 sm:px-8 sm:py-44">
      <div className="aurora aurora-b inset-x-0 top-1/3 mx-auto size-[40rem] opacity-40" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="kicker text-mist">(06) Pick your chapter</p>
          <SplitText
            className="mt-6 font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.025em]"
            segments={[{ text: "Legal help that fits" }, { text: "where you are.", className: "italic text-aurora-gradient" }]}
          />
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-lg text-pretty text-lg text-mist">Flat fees. Clear scope. No billing roulette.</p>
          </Reveal>
        </div>

        <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <PackageCard key={service.id} service={service} index={i} variant="teaser" />
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <Link href="/pricing" className="group inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-ink/90 transition-colors hover:border-aurora hover:text-aurora-deep">
            Compare all packages
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
