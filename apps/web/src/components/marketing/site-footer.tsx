import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { OrionMark } from "./brand/orion-mark";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/health-check", label: "Legal health check" },
      { href: "/pricing", label: "Packages" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/signup", label: "Create account" },
    ],
  },
];

const COVERAGE = ["United Kingdom", "United States", "Nigeria", "Lagos & Lekki Free Zones"];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-ink/10 bg-cloud px-5 pt-20 sm:px-8">
      <div className="aurora aurora-a bottom-[-30%] left-1/2 size-[60rem] -translate-x-1/2 opacity-40" />

      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <OrionMark size={34} />
            <span className="font-display text-3xl">Orion</span>
          </Link>
          <p className="mt-5 max-w-xs text-pretty text-mist">
            Legal clarity for founders building ambitious things.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="kicker text-mist/70">{col.title}</p>
            <ul className="mt-5 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group inline-flex items-center gap-1 text-ink/85 transition-colors hover:text-aurora-deep">
                    {link.label}
                    <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-300 group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="kicker text-mist/70">Coverage</p>
          <ul className="mt-5 space-y-3 text-ink/85">
            {COVERAGE.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-aurora" aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative mx-auto mt-16 flex max-w-7xl flex-col justify-between gap-3 border-t border-ink/10 py-6 text-xs text-mist sm:flex-row">
        <p>© 2026 Orion. All rights reserved.</p>
        <p className="kicker">Made for founders · UK · US · NG</p>
      </div>

      {/* Oversized wordmark, cropped by the page edge. */}
      <p
        aria-hidden="true"
        className="text-aurora-gradient pointer-events-none relative -mb-[0.24em] select-none text-center font-display text-[31vw] leading-[0.8] tracking-[-0.04em] opacity-90"
      >
        Orion
      </p>
    </footer>
  );
}
