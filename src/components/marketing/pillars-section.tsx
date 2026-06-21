import { Bot, Building2, Handshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const pillars: { icon: LucideIcon; kicker: string; title: string; description: string; color: string }[] = [
  { icon: Building2, kicker: "01 · SET UP", title: "Build on solid ground", description: "Incorporate, sort founder equity, and put governance in place before the cracks appear.", color: "bg-[#f4d66f]/55" },
  { icon: Handshake, kicker: "02 · RAISE", title: "Close the round", description: "Get term sheets, SAFEs, diligence, and deal structure handled without losing the plot.", color: "bg-[#f3b2a4]/55" },
  { icon: Bot, kicker: "03 · GROW", title: "Stay legally ready", description: "Contracts, compliance, expert backup, and an AI co-pilot that knows when to call a human.", color: "bg-[#a9ddc3]/55" },
];

export default function PillarsSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="mb-4 font-black uppercase text-[#e95f44]">The useful bits</p>
          <h2 className="display-type text-balance text-4xl leading-tight sm:text-5xl lg:text-6xl">From “we have an idea” to “we closed the round.”</h2>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-[#59645c]">One legal home for the messy, exciting, slightly terrifying business of building a startup.</p>
        </div>
        <div className="mt-12 grid gap-7 lg:grid-cols-3 lg:gap-8">
          {pillars.map(({ icon: Icon, kicker, title, description, color }) => (
            <article key={title} className={`rough-card ${color} p-6 sm:p-8`}>
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-black">{kicker}</span>
                <span className="grid size-14 place-items-center rounded-full border border-[#17211b]/20 bg-white"><Icon className="size-7" aria-hidden="true" /></span>
              </div>
              <h3 className="display-type mt-12 text-balance text-3xl leading-tight">{title}</h3>
              <p className="mt-4 text-pretty leading-relaxed text-[#344039]">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
