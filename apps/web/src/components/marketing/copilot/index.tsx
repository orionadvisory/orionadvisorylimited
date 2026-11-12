import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { ChatDemo } from "./chat-demo";

const BULLETS = [
  "UK, US, Nigeria & Free Zone expertise",
  "Real humans when judgment matters",
  "Flat-fee packages — no billing roulette",
  "AI guidance grounded in your actual startup",
];

export function Copilot() {
  return (
    <section className="relative px-5 py-32 sm:px-8 sm:py-44">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative flex min-h-[36rem] items-end justify-center overflow-hidden rounded-[2rem] border border-white/10 p-5 sm:p-10">
            <Image
              src="/images/marketing/gavel.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover opacity-50 saturate-[0.6]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/10" />
            <div className="aurora aurora-a -left-20 -top-20 size-80 opacity-60" />
            <ChatDemo />
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <p className="kicker text-haze">(05) Not just another chatbot</p>
          <SplitText
            className="mt-6 font-display text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.025em]"
            segments={[{ text: "Smart tech." }, { text: "\n" }, { text: "Serious expertise." }, { text: "\n" }, { text: "Normal words.", className: "italic text-aurora-gradient" }]}
          />
          <Reveal delay={0.15}>
            <p className="mt-7 max-w-lg text-pretty text-lg leading-relaxed text-haze">
              Orion combines structured legal services, expert support and genuinely useful AI. You stay informed
              without having to become your own lawyer.
            </p>
          </Reveal>
          <ul className="mt-9 space-y-4">
            {BULLETS.map((item, i) => (
              <Reveal key={item} delay={0.2 + i * 0.07}>
                <li className="flex items-center gap-3 border-b border-white/[0.07] pb-4 text-star/90">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-aurora/15 text-aurora">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.5}>
            <Link href="/pricing" className="group mt-9 inline-flex items-center gap-2 border-b border-aurora/60 pb-1 text-aurora-soft transition-colors hover:border-aurora hover:text-aurora">
              See how we can help
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
