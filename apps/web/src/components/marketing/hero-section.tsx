import Link from "next/link";
import { ArrowRight, Check, FileText, Lightbulb, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#17211b]/20 bg-[#a9ddc3]/60 px-4 py-2 text-sm font-bold">
            <Sparkles className="size-4" aria-hidden="true" /> Clear legal support for ambitious founders
          </div>
          <h1 className="display-type max-w-3xl text-balance text-5xl leading-[0.98] sm:text-6xl lg:text-7xl xl:text-8xl">
            Legal stuff,
            <br /> sorted <span className="scribble-underline italic">properly.</span>
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-[#3f4a43] sm:text-xl">
            Orion gives ambitious founders a clear legal game plan, expert support, and an AI co-pilot that speaks human.
          </p>
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link href="/health-check" className="sticker-shadow inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e95f44] px-7 py-4 font-bold text-white transition-colors hover:bg-[#d95138] sm:w-auto">
              Check my legal health <ArrowRight className="wiggle-arrow size-5" aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="inline-flex w-full items-center justify-center rounded-full border border-[#17211b]/30 bg-white px-7 py-4 font-bold transition-colors hover:bg-[#f7f4ed] sm:w-auto">
              View packages
            </Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm font-bold text-[#59645c]">
            <Check className="size-4" aria-hidden="true" /> Free · 5 minutes · no signup ambush
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-lg pb-8 pr-3 sm:pr-8">
          <div className="absolute -right-2 -top-7 rounded-full border border-[#17211b]/20 bg-[#f4d66f] px-4 py-2 text-sm font-bold shadow-sm sm:right-0">Your legal map</div>
          <div className="rough-card bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-[#17211b]/15 pb-4">
              <div>
                <p className="text-xs font-black uppercase">Project: big idea</p>
                <p className="mt-1 text-lg font-black">Launch readiness</p>
              </div>
              <span className="grid size-14 place-items-center rounded-full border border-[#17211b]/25 bg-[#a9ddc3] text-xl font-black">72%</span>
            </div>
            <div className="mt-5 space-y-3">
              <MapItem icon={Check} label="Company structure" note="Looking sharp" color="bg-[#a9ddc3]" done />
              <MapItem icon={FileText} label="Founder agreement" note="Needs attention" color="bg-[#f4d66f]" />
              <MapItem icon={Lightbulb} label="IP protection" note="Next on your list" color="bg-[#a7c8ed]" />
            </div>
            <div className="mt-6 rounded-xl border border-[#17211b]/15 bg-[#fff3c4] p-4">
              <p className="text-sm font-black">Orion says:</p>
              <p className="mt-1 text-pretty text-sm leading-relaxed">Lock in founder vesting before fundraising. Future you will be very grateful.</p>
            </div>
          </div>
          <div className="absolute -bottom-1 -left-3 rotate-[-2deg] rounded-xl border border-[#17211b]/20 bg-[#a7c8ed] px-4 py-3 text-sm font-bold shadow-md">Less legal fog ✦</div>
        </div>
      </div>
    </section>
  );
}

function MapItem({ icon: Icon, label, note, color, done = false }: { icon: typeof Check; label: string; note: string; color: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#17211b]/15 p-3">
      <span className={`grid size-10 shrink-0 place-items-center rounded-lg border border-[#17211b]/20 ${color}`}><Icon className="size-5" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1"><p className="font-black">{label}</p><p className="text-xs text-[#59645c]">{note}</p></div>
      <span className={`size-3 rounded-full border border-[#17211b] ${done ? "bg-[#17211b]" : "bg-white"}`} aria-hidden="true" />
    </div>
  );
}
