import Link from "next/link";
import { ArrowRight, Bot, Check, ShieldAlert, UserRoundCheck } from "lucide-react";

const bullets = ["UK, US, Nigeria & Free Zone expertise", "Real humans when judgment matters", "Flat-fee packages without billing roulette", "AI guidance grounded in your actual startup"];

export default function WhyOrionSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="relative order-2 lg:order-1">
          <div className="rough-card rotate-[-1deg] bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3 border-b-2 border-dashed border-[#17211b]/30 pb-4"><span className="grid size-10 place-items-center rounded-full border-2 border-[#17211b] bg-[#ffd84d]"><Bot className="size-5" aria-hidden="true" /></span><div><p className="font-black">Orion co-pilot</p><p className="text-xs text-[#59645c]">Legal translator · online</p></div></div>
            <div className="mt-5 rounded-2xl rounded-tl-sm border-2 border-[#17211b] bg-[#fff3c4] p-4"><p className="text-pretty text-sm leading-relaxed">Your founder shares have no vesting schedule. Investors will spot that during diligence. Let’s fix it before the raise.</p></div>
            <div className="ml-auto mt-4 max-w-[85%] rounded-2xl rounded-tr-sm border-2 border-[#17211b] bg-[#84b6f4] p-4"><p className="text-sm font-bold">Explain that without the lawyer voice?</p></div>
            <div className="mt-4 flex items-start gap-3 rounded-2xl rounded-tl-sm border-2 border-[#17211b] bg-[#9ee8c2] p-4"><UserRoundCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" /><p className="text-pretty text-sm leading-relaxed"><strong>Basically:</strong> vesting makes sure everyone earns their shares over time. It protects the company if a founder leaves early.</p></div>
          </div>
          <span className="absolute -bottom-5 right-2 rotate-3 rounded-full border-2 border-[#17211b] bg-[#ff9c87] px-4 py-2 text-sm font-black shadow-[3px_3px_0_#17211b] sm:right-[-1rem]">human backup included</span>
        </div>
        <div className="order-1 lg:order-2">
          <p className="mb-4 flex items-center gap-2 font-black uppercase text-[#ff6b4a]"><ShieldAlert className="size-5" aria-hidden="true" /> Not just another chatbot</p>
          <h2 className="display-type text-balance text-4xl leading-tight sm:text-5xl lg:text-6xl">Smart tech. Serious expertise. Normal words.</h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-[#59645c]">Orion combines structured legal services, expert support, and useful AI. You stay informed without becoming your own lawyer.</p>
          <ul className="mt-7 space-y-4">{bullets.map((item) => <li key={item} className="flex items-start gap-3 font-bold"><span className="grid size-6 shrink-0 place-items-center rounded-full border-2 border-[#17211b] bg-[#ffd84d]"><Check className="size-3.5" aria-hidden="true" /></span><span>{item}</span></li>)}</ul>
          <Link href="/pricing" className="mt-9 inline-flex items-center gap-2 border-b-2 border-[#17211b] pb-1 font-black hover:border-[#ff6b4a]">See how we can help <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
