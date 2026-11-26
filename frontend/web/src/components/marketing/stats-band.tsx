import { CountUp } from "./motion/count-up";
import { Reveal } from "./motion/reveal";

const STATS = [
  { value: 200, suffix: "+", label: "Startups structured" },
  { value: 80, prefix: "$", suffix: "M+", label: "In deals supported" },
  { value: 3, label: "Countries covered" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "Founder satisfaction" },
];

export function StatsBand() {
  return (
    <section aria-label="Orion by the numbers" className="px-5 sm:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 border-y border-ink/10 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.08}
            className="border-ink/10 px-4 py-10 odd:border-r sm:px-8 sm:py-14 lg:border-r lg:last:border-r-0 [&:nth-child(-n+2)]:border-b lg:[&:nth-child(-n+2)]:border-b-0"
          >
            <p className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-none tracking-tight">
              <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
            </p>
            <p className="kicker mt-4 text-mist">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
