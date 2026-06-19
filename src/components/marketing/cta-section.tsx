import Link from "next/link";
import { ArrowRight, Asterisk } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28">
      <Asterisk className="absolute left-[8%] top-12 hidden size-14 rotate-12 text-[#ff6b4a] lg:block" aria-hidden="true" />
      <div className="rough-card mx-auto max-w-5xl rotate-[-1deg] bg-[#ff9c87] px-6 py-14 text-center sm:px-12 sm:py-20">
        <p className="font-black uppercase">Your five-minute legal reality check</p>
        <h2 className="display-type mx-auto mt-4 max-w-3xl text-balance text-4xl leading-tight sm:text-5xl lg:text-6xl">Find the legal gaps before somebody else does.</h2>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed">Get a clear, instant snapshot of what’s sorted, what’s risky, and what to do next.</p>
        <Link href="/health-check" className="sticker-shadow mt-8 inline-flex items-center gap-2 rounded-full border-2 border-[#17211b] bg-[#17211b] px-7 py-4 font-black text-white transition-transform duration-150 hover:-translate-y-1">Start my free check <ArrowRight className="wiggle-arrow size-5" aria-hidden="true" /></Link>
        <p className="mt-5 text-sm font-bold">No signup · no card · no legal dictionary</p>
      </div>
    </section>
  );
}
