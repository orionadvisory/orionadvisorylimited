import { MapPin } from "lucide-react";

const jurisdictions = ["United Kingdom", "United States", "Nigeria", "Lagos Free Zone", "Lekki Free Zone"];

export default function JurisdictionsStrip() {
  return (
    <section className="border-y-2 border-[#17211b] bg-[#84b6f4] px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-7 lg:flex-row lg:justify-between">
        <div className="flex items-center gap-3 text-center lg:text-left">
          <MapPin className="hidden size-8 shrink-0 sm:block" aria-hidden="true" />
          <p className="display-type text-balance text-2xl sm:text-3xl">Local knowledge. Global ambition.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {jurisdictions.map((name, index) => (
            <span key={name} className={`rounded-full border-2 border-[#17211b] bg-[#fffaf0] px-4 py-2 text-sm font-black shadow-[2px_2px_0_#17211b] ${index % 2 ? "rotate-1" : "rotate-[-1deg]"}`}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
