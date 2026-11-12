"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { SplitText } from "../motion/split-text";
import { Reveal } from "../motion/reveal";
import { EASE_OUT_EXPO } from "../motion/easing";
import { VelocityMarquee } from "./velocity-marquee";

const PLACES = [
  { name: "United Kingdom", region: "Europe" },
  { name: "United States", region: "North America" },
  { name: "Nigeria", region: "West Africa" },
  { name: "Lagos Free Zone", region: "Free zone" },
  { name: "Lekki Free Zone", region: "Free zone" },
];

export function Jurisdictions() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.25, 1.05, 1.15]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-32 sm:pt-44">
      {/* Glass cubes drifting in on the right, like cloud cover. */}
      <motion.div
        style={{ y: imageY, scale: imageScale }}
        className="absolute inset-y-0 right-0 -z-10 w-full opacity-90 [mask-image:linear-gradient(90deg,transparent,#000_55%)] lg:w-[70%]"
      >
        <Image src="/images/marketing/glass.jpg" alt="" fill sizes="70vw" className="object-cover object-[70%_40%]" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cloud via-transparent to-cloud" />

      <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div>
          <p className="kicker text-mist">(03) Where we work</p>
          <SplitText
            className="mt-6 font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.92] tracking-[-0.025em]"
            segments={[{ text: "Local knowledge." }, { text: "\n" }, { text: "Global ambition.", className: "italic text-aurora-gradient" }]}
          />
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-md text-pretty text-lg leading-relaxed text-mist">
              Founders in Lagos raise from London and San Francisco. Your legal setup should travel just as well.
            </p>
          </Reveal>
        </div>

        <ol className="border-t border-ink/10">
          {PLACES.map((place, i) => (
            <motion.li
              key={place.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -60px 0px" }}
              transition={{ duration: 1, delay: i * 0.08, ease: EASE_OUT_EXPO }}
              className="group flex items-center justify-between gap-4 border-b border-ink/10 py-5 backdrop-blur-[2px]"
            >
              <span className="flex items-baseline gap-5">
                <span className="kicker text-mist/60">0{i + 1}</span>
                <span className="font-display text-3xl transition-all duration-500 ease-out group-hover:translate-x-2 group-hover:text-aurora-deep sm:text-4xl">
                  {place.name}
                </span>
              </span>
              <span className="kicker flex items-center gap-2 text-mist">
                <span className="hidden sm:inline">{place.region}</span>
                <ArrowUpRight className="size-4 opacity-40 transition-all duration-500 group-hover:rotate-45 group-hover:text-aurora-deep group-hover:opacity-100" aria-hidden="true" />
              </span>
            </motion.li>
          ))}
        </ol>
      </div>

      <div className="text-outline mt-24 font-display text-[clamp(5rem,14vw,13rem)] leading-none sm:mt-32">
        <VelocityMarquee text="United Kingdom ✦ United States ✦ Nigeria ✦ Free Zones ✦ " />
      </div>
    </section>
  );
}
