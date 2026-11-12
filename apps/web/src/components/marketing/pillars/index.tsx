"use client";

import { useRef } from "react";
import { useScroll } from "motion/react";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { PillarCard } from "./pillar-card";
import { PILLARS } from "./data";

export function Pillars() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end end"] });

  return (
    <section className="relative px-3 pt-32 sm:px-8 sm:pt-44">
      <div className="mx-auto max-w-7xl px-2 sm:px-0">
        <p className="kicker text-haze">(02) What we do</p>
        <SplitText
          className="mt-6 max-w-4xl font-display text-[clamp(2.8rem,6.5vw,6rem)] leading-[0.95] tracking-[-0.025em]"
          segments={[
            { text: "From “we have an idea” to" },
            { text: "“we closed the round.”", className: "italic text-aurora-gradient" },
          ]}
        />
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-haze">
            One legal home for the messy, exciting, slightly terrifying business of building a startup.
          </p>
        </Reveal>
      </div>

      <div ref={container} className="relative mx-auto max-w-7xl">
        {PILLARS.map((pillar, i) => (
          <PillarCard
            key={pillar.index}
            pillar={pillar}
            i={i}
            progress={scrollYProgress}
            range={[i / PILLARS.length, 1]}
            targetScale={1 - (PILLARS.length - 1 - i) * 0.05}
          />
        ))}
      </div>
    </section>
  );
}
