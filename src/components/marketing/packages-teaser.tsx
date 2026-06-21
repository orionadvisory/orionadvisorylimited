import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const packages = [
  { name: "Launch", note: "Make it real", tagline: "Incorporate and structure your company properly from day one.", items: ["Company setup", "Founder foundations"], color: "bg-[#fdfbf7]" },
  { name: "Fund", note: "Investor-ready", tagline: "Structure the raise, handle diligence, and get the deal closed.", items: ["Deal structure", "Round support"], color: "bg-[#f4d66f]/55", featured: true },
  { name: "Scale", note: "Keep growing", tagline: "Put reliable legal operations behind your next stage of growth.", items: ["Ongoing support", "Contracts & compliance"], color: "bg-[#a9ddc3]/55" },
];

export default function PackagesTeaser() {
  return (
    <section className="border-y border-[#17211b]/15 bg-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="text-center"><p className="mb-4 font-black uppercase text-[#e95f44]">Pick your chapter</p><h2 className="display-type mx-auto max-w-3xl text-balance text-4xl leading-tight sm:text-5xl lg:text-6xl">Legal help that fits where you are.</h2><p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-[#59645c]">No giant menu. No guessing which service you need.</p></div>
        <div className="mt-12 grid items-start gap-7 lg:grid-cols-3">
          {packages.map((pkg) => <article key={pkg.name} className={`rough-card relative p-7 sm:p-8 ${pkg.color}`}>{pkg.featured && <span className="absolute -right-2 -top-4 rounded-full bg-[#e95f44] px-3 py-1.5 text-xs font-bold text-white shadow-sm">MOST POPULAR</span>}<p className="text-xs font-black uppercase">{pkg.note}</p><h3 className="display-type mt-3 text-4xl">{pkg.name}</h3><p className="mt-4 min-h-12 text-pretty leading-relaxed text-[#3f4a43]">{pkg.tagline}</p><ul className="mt-6 space-y-3 border-t border-[#17211b]/15 pt-6">{pkg.items.map(item => <li key={item} className="flex items-center gap-2 text-sm font-bold"><Check className="size-4" aria-hidden="true" />{item}</li>)}</ul></article>)}
        </div>
        <div className="mt-12 text-center"><Link href="/pricing" className="sticker-shadow inline-flex items-center gap-2 rounded-full bg-[#17211b] px-7 py-4 font-bold text-white transition-colors hover:bg-[#2b3830]">Compare all packages <ArrowRight className="wiggle-arrow size-5" aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
}
