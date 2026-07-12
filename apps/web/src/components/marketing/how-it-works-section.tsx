import { Compass, ListChecks, Rocket } from "lucide-react";

const steps = [
  { number: "01", icon: Compass, title: "Show us the chaos", description: "Tell us your stage, location, and goals. No legal vocabulary test required." },
  { number: "02", icon: ListChecks, title: "Get the game plan", description: "See what matters now, what can wait, and exactly what to tackle next." },
  { number: "03", icon: Rocket, title: "Build without the fog", description: "Follow guided workflows, bring in experts, and keep every legal loose end visible." },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-[#17211b] px-4 py-20 text-[#fdfbf7] sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><p className="mb-4 font-black uppercase text-[#f4d66f]">How it works</p><h2 className="display-type max-w-3xl text-balance text-4xl leading-tight sm:text-5xl lg:text-6xl">Three steps. Zero mysterious billable hours.</h2></div>
          <p className="max-w-md text-pretty text-[#fdfbf7]/70 lg:text-right">A visible path from legal uncertainty to properly sorted.</p>
        </div>
        <ol className="relative mt-14 grid gap-8 lg:grid-cols-3">
          <div className="absolute left-[15%] right-[15%] top-12 hidden border-t border-[#fdfbf7]/25 lg:block" aria-hidden="true" />
          {steps.map(({ number, icon: Icon, title, description }, index) => (
            <li key={number} className="relative z-10 flex gap-5 lg:block">
              <div className={`grid size-20 shrink-0 place-items-center rounded-full border border-[#fdfbf7]/50 text-[#17211b] shadow-lg lg:size-24 ${index === 0 ? "bg-[#f4d66f]" : index === 1 ? "bg-[#f3b2a4]" : "bg-[#a9ddc3]"}`}><Icon className="size-8 lg:size-10" aria-hidden="true" /></div>
              <div className="pt-1 lg:pt-8"><p className="text-xs font-black text-[#f4d66f]">STEP {number}</p><h3 className="display-type mt-2 text-balance text-2xl sm:text-3xl">{title}</h3><p className="mt-3 max-w-sm text-pretty leading-relaxed text-[#fdfbf7]/70">{description}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
