import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OrionMark } from "./brand/orion-mark";
import { Magnetic } from "./motion/magnetic";
import { Reveal } from "./motion/reveal";
import { SplitText } from "./motion/split-text";

export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden px-5 py-36 text-center sm:px-8 sm:py-52">
      <div className="aurora aurora-a inset-0 -z-10 m-auto size-[46rem]" />
      <div className="aurora aurora-c inset-0 -z-10 m-auto size-[34rem] translate-x-1/3" />
      <div className="absolute inset-0 -z-10 grid place-items-center opacity-[0.08]" aria-hidden="true">
        <OrionMark size={620} className="mark-spin max-w-[140vw]" />
      </div>

      <p className="kicker text-mist">Your five-minute legal reality check</p>
      <SplitText
        className="mx-auto mt-8 max-w-5xl font-display text-[clamp(3.2rem,8.5vw,8rem)] leading-[0.9] tracking-[-0.03em]"
        segments={[
          { text: "Find the gaps" },
          { text: "\n" },
          { text: "before" },
          { text: "somebody else", className: "italic text-aurora-gradient" },
          { text: "does." },
        ]}
      />
      <Reveal delay={0.2}>
        <p className="mx-auto mt-8 max-w-lg text-pretty text-lg leading-relaxed text-mist">
          A clear, instant snapshot of what’s sorted, what’s risky, and what to do next.
        </p>
        <div className="mt-11">
          <Magnetic strength={0.35}>
            <Link
              href="/health-check"
              className="btn-shine group inline-flex items-center gap-3 rounded-full bg-ink py-2.5 pl-8 pr-2.5 text-lg font-medium text-cloud shadow-[0_20px_50px_-16px_rgba(12,26,23,0.5)] transition-colors hover:bg-aurora-deep"
            >
              Start my free check
              <span className="grid size-11 place-items-center rounded-full bg-cloud text-aurora-deep transition-transform duration-500 group-hover:-rotate-45">
                <ArrowRight className="size-5" aria-hidden="true" />
              </span>
            </Link>
          </Magnetic>
        </div>
        <p className="kicker mt-8 text-mist/70">No signup · no card · no legal dictionary</p>
      </Reveal>
    </section>
  );
}
