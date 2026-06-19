import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const packages = [
  { name: "Launch", note: "Make it real", tagline: "Incorporate and structure your company properly from day one.", items: ["Company setup", "Founder foundations"], color: "bg-[#fffaf0]" },
  { name: "Fund", note: "Investor-ready", tagline: "Structure the raise, handle diligence, and get the deal closed.", items: ["Deal structure", "Round support"], color: "bg-[#ffd84d]", featured: true },
  { name: "Scale", note: "Keep growing", tagline: "Put reliable legal operations behind your next stage of growth.", items: ["Ongoing support", "Contracts & compliance"], color: "bg-[#9ee8c2]" },
];

export default function PackagesTeaser() {
  return (
    <section className="border-y-2 border-[#17211b] bg-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="text-center"><p className="mb-4 font-black uppercase text-[#ff6b4a]">Pick your chapter</p><h2 className="display-type mx-auto max-w-3xl text-balance text-4xl leading-tight sm:text-5xl lg:text-6xl">Legal help that fits where you are.</h2><p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-[#59645c]">No giant menu. No guessing which service you need.</p></div>
        <div className="mt-12 grid items-start gap-7 lg:grid-cols-3">
          {packages.map((pkg) => <article key={pkg.name} className={`rough-card relative p-7 sm:p-8 ${pkg.color} ${pkg.featured ? "lg:-translate-y-4" : ""}`}>{pkg.featured && <span className="absolute -right-3 -top-4 rotate-3 rounded-full border-2 border-[#17211b] bg-[#ff6b4a] px-3 py-1.5 text-xs font-black text-white">FOUNDER FAVE</span>}<p className="text-xs font-black uppercase">{pkg.note}</p><h3 className="display-type mt-3 text-4xl">{pkg.name}</h3><p className="mt-4 min-h-12 text-pretty leading-relaxed text-[#3f4a43]">{pkg.tagline}</p><ul className="mt-6 space-y-3 border-t-2 border-dashed border-[#17211b]/30 pt-6">{pkg.items.map(item => <li key={item} className="flex items-center gap-2 text-sm font-bold"><Check className="size-4" aria-hidden="true" />{item}</li>)}</ul></article>)}
        </div>
        <div className="mt-12 text-center"><Link href="/pricing" className="sticker-shadow inline-flex items-center gap-2 rounded-full border-2 border-[#17211b] bg-[#84b6f4] px-7 py-4 font-black transition-transform duration-150 hover:-translate-y-1">Compare all packages <ArrowRight className="size-5" aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
}
