import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SERVICES } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "Legal Packages | Orion",
  description: "Clear, flat-fee legal packages for launching, funding, and scaling your company.",
};

const cardColors = ["bg-white", "bg-[#f4d66f]/45", "bg-[#a9ddc3]/45"];

export default function PricingPage() {
  return (
    <div className="px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-black uppercase text-[#e95f44]">Straightforward packages</p>
          <h1 className="display-type text-balance text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Legal support built for your stage.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-[#59645c]">
            From setting up your company to closing your first round, get a clear scope and a
            flat fee without hourly surprises.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl gap-7 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <article
              key={service.id}
              className={`rough-card relative flex flex-col p-7 sm:p-8 ${cardColors[index]}`}
            >
              {service.popular && (
                <span className="absolute -top-4 right-5 rounded-full bg-[#e95f44] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                  MOST POPULAR
                </span>
              )}

              <div>
                <p className="text-xs font-black uppercase text-[#59645c]">For your next stage</p>
                <h2 className="display-type mt-3 text-4xl">{service.name}</h2>
                <p className="mt-3 min-h-12 text-pretty leading-relaxed text-[#3f4a43]">
                  {service.description}
                </p>
                <div className="mt-6 border-b border-[#17211b]/15 pb-6">
                  <span className="display-type text-4xl tabular-nums">
                    ${service.price.toLocaleString()}
                  </span>
                  <span className="ml-2 text-sm text-[#59645c]">one-time</span>
                </div>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#17211b] text-white">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold transition-colors ${
                  service.popular
                    ? "bg-[#17211b] text-white hover:bg-[#2b3830]"
                    : "border border-[#17211b]/30 bg-white/70 hover:bg-white"
                }`}
              >
                {service.cta}
                <ArrowRight className="wiggle-arrow size-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-[#17211b]/15 bg-white/70 px-6 py-7 text-center shadow-sm">
          <h2 className="display-type text-2xl">Not sure which package fits?</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#59645c]">
            Start with a free five-minute health check. We’ll show you what needs attention and
            which support makes sense.
          </p>
          <Link
            href="/health-check"
            className="mt-5 inline-flex items-center gap-2 border-b border-[#17211b] pb-1 font-bold hover:border-[#e95f44]"
          >
            Check my legal health <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-[#59645c]">
          Supporting founders in the UK, US, Nigeria, and selected Free Zones.
        </p>
      </div>
    </div>
  );
}
