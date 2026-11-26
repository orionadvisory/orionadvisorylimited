import Link from "next/link";
import { Logo } from "@orion/ui/components/ui/logo";
import { NightSkyCanvas } from "./night-sky";
import { SkyCounter } from "./night-sky/sky-counter";

/**
 * The night-sky half of the auth screens. Deep ink sky with aurora haze; the Orion
 * figure connects itself as the form on the other half is filled in.
 */
export function AuthShowcase({ eyebrow, title, accent }: { eyebrow: string; title: string; accent: string }) {
  return (
    <aside className="relative isolate flex h-[300px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#06100e] p-6 text-cloud sm:h-[360px] lg:sticky lg:top-3 lg:h-[calc(100svh-1.5rem)] lg:p-10">
      {/* Haze + vignette */}
      <div className="pointer-events-none absolute -left-1/4 -top-1/3 -z-10 size-[42rem] rounded-full bg-[radial-gradient(closest-side,rgba(25,211,174,0.22),transparent)] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-1/3 -right-1/4 -z-10 size-[38rem] rounded-full bg-[radial-gradient(closest-side,rgba(100,150,255,0.16),transparent)] blur-2xl" />
      <div className="pointer-events-none absolute right-[18%] top-[22%] -z-10 size-[18rem] rounded-full bg-[radial-gradient(closest-side,rgba(240,140,90,0.10),transparent)] blur-2xl" />
      <NightSkyCanvas className="absolute inset-0 -z-10 size-full" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(3,8,7,0.75))]" />

      <Link href="/" className="flex w-fit items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 backdrop-blur-md transition-colors hover:bg-white/10">
        <span className="grid size-8 place-items-center rounded-full bg-ink">
          <Logo size={20} />
        </span>
        <span className="font-display text-xl leading-none">Orion</span>
      </Link>

      <div className="max-w-md">
        <p className="kicker mb-3 hidden font-mono text-[0.7rem] uppercase tracking-[0.22em] text-aurora-soft/60 sm:block">{eyebrow}</p>
        <h2 className="font-display text-[clamp(2.4rem,4.6vw,4.4rem)] leading-[0.92] tracking-[-0.02em] text-balance">
          {title} <em className="text-aurora-gradient bg-gradient-to-r from-aurora to-[#9be8ff] bg-clip-text pr-1 text-transparent">{accent}</em>
        </h2>
        <div className="mt-5 hidden sm:block">
          <SkyCounter />
        </div>
      </div>
    </aside>
  );
}
