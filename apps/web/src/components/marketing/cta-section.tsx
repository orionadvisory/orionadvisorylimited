import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28">
      <div className="rough-card mx-auto max-w-5xl bg-[#f3b2a4]/65 px-6 py-14 text-center sm:px-12 sm:py-20">
        <p className="font-black uppercase">Your five-minute legal reality check</p>
        <h2 className="display-type mx-auto mt-4 max-w-3xl text-balance text-4xl leading-tight sm:text-5xl lg:text-6xl">Find the legal gaps before somebody else does.</h2>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed">Get a clear, instant snapshot of what’s sorted, what’s risky, and what to do next.</p>
        <Link href="/health-check" className="sticker-shadow mt-8 inline-flex items-center gap-2 rounded-full bg-[#17211b] px-7 py-4 font-bold text-white transition-colors hover:bg-[#2b3830]">Start my free check <ArrowRight className="wiggle-arrow size-5" aria-hidden="true" /></Link>
        <p className="mt-5 text-sm font-bold">No signup · no card · no legal dictionary</p>
      </div>
    </section>
  );
}
