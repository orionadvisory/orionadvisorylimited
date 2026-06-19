import Link from "next/link";
import { ArrowRight, Check, FileText, Lightbulb, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
      <div className="pointer-events-none absolute left-[4%] top-12 hidden rotate-[-10deg] text-5xl font-black text-[#ff6b4a] lg:block" aria-hidden="true">*</div>
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
        <div>
          <div className="mb-7 inline-flex rotate-[-2deg] items-center gap-2 rounded-full border-2 border-[#17211b] bg-[#9ee8c2] px-4 py-2 text-sm font-black shadow-[3px_3px_0_#17211b]">
            <Sparkles className="size-4" aria-hidden="true" /> No wigs. No jargon. No panic.
          </div>
          <h1 className="display-type max-w-3xl text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-7xl xl:text-8xl">
            Legal stuff,
            <br /> sorted <span className="scribble-underline italic">properly.</span>
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-[#3f4a43] sm:text-xl">
            Orion gives ambitious founders a clear legal game plan, expert support, and an AI co-pilot that speaks human.
          </p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link href="/health-check" className="sticker-shadow inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#17211b] bg-[#ff6b4a] px-7 py-4 font-black text-white transition-transform duration-150 hover:-translate-y-1 sm:w-auto">
              Check my legal health <ArrowRight className="wiggle-arrow size-5" aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="inline-flex w-full items-center justify-center rounded-full border-2 border-[#17211b] bg-white px-7 py-4 font-black transition-transform duration-150 hover:-rotate-1 sm:w-auto">
              Peek at packages
            </Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm font-bold text-[#59645c]">
            <Check className="size-4" aria-hidden="true" /> Free · 5 minutes · no signup ambush
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-lg pb-8 pr-3 sm:pr-8">
          <div className="absolute -right-2 -top-8 rotate-6 rounded-full border-2 border-[#17211b] bg-[#ffd84d] px-4 py-2 text-sm font-black shadow-[3px_3px_0_#17211b] sm:right-0">your legal map ↓</div>
          <div className="rough-card rotate-[1deg] bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#17211b]/30 pb-4">
              <div>
                <p className="text-xs font-black uppercase">Project: big idea</p>
                <p className="mt-1 text-lg font-black">Launch readiness</p>
              </div>
              <span className="grid size-14 rotate-3 place-items-center rounded-full border-2 border-[#17211b] bg-[#9ee8c2] text-xl font-black">72%</span>
            </div>
            <div className="mt-5 space-y-3">
              <MapItem icon={Check} label="Company structure" note="Looking sharp" color="bg-[#9ee8c2]" done />
              <MapItem icon={FileText} label="Founder agreement" note="Needs attention" color="bg-[#ffd84d]" />
              <MapItem icon={Lightbulb} label="IP protection" note="Next on your list" color="bg-[#84b6f4]" />
            </div>
            <div className="mt-6 rotate-[-1deg] rounded-xl border-2 border-[#17211b] bg-[#fff3c4] p-4">
              <p className="text-sm font-black">Orion says:</p>
              <p className="mt-1 text-pretty text-sm leading-relaxed">Lock in founder vesting before fundraising. Future you will be very grateful.</p>
            </div>
          </div>
          <div className="absolute -bottom-1 -left-3 rotate-[-5deg] rounded-xl border-2 border-[#17211b] bg-[#84b6f4] px-4 py-3 text-sm font-black shadow-[3px_3px_0_#17211b]">less legal fog ✦</div>
        </div>
      </div>
    </section>
  );
}

function MapItem({ icon: Icon, label, note, color, done = false }: { icon: typeof Check; label: string; note: string; color: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-[#17211b] p-3">
      <span className={`grid size-10 shrink-0 place-items-center rounded-lg border-2 border-[#17211b] ${color}`}><Icon className="size-5" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1"><p className="font-black">{label}</p><p className="text-xs text-[#59645c]">{note}</p></div>
      <span className={`size-3 rounded-full border-2 border-[#17211b] ${done ? "bg-[#17211b]" : "bg-white"}`} aria-hidden="true" />
    </div>
  );
}
