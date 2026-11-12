"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "@orion/ui/utils";
import { OrionMark } from "../brand/orion-mark";
import { EASE_OUT_EXPO } from "../motion/easing";
import { NAV_LINKS } from "./nav-links";

/**
 * Floating pill nav: transparent over the hero, frosted once you scroll,
 * tucks away while scrolling down and returns the moment you scroll up.
 */
export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > prev && y > 360);
  });

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden && !open ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4"
      >
        <nav
          aria-label="Main navigation"
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between rounded-full border py-2 pl-4 pr-2 transition-[background-color,border-color,box-shadow] duration-500 sm:pl-5",
            scrolled || open
              ? "glass border-white/10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]"
              : "border-transparent bg-transparent",
          )}
        >
          <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <OrionMark size={26} className="transition-transform duration-700 ease-out group-hover:rotate-[20deg]" />
            <span className="font-display text-2xl tracking-tight">Orion</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative rounded-full px-4 py-2 text-sm text-star/75 transition-colors hover:text-star"
              >
                {link.label}
                <span className="absolute inset-x-4 bottom-1.5 h-px origin-left scale-x-0 bg-aurora transition-transform duration-500 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
            <Link
              href="/signup"
              className="group ml-2 inline-flex items-center gap-1.5 rounded-full bg-star px-5 py-2.5 text-sm font-medium text-night transition-colors hover:bg-aurora-soft"
            >
              Get started
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 md:hidden"
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "circle(0% at 92% 4%)" }}
            animate={{ clipPath: "circle(150% at 92% 4%)" }}
            exit={{ clipPath: "circle(0% at 92% 4%)" }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-40 flex flex-col justify-end bg-night px-6 pb-14 pt-28 md:hidden"
          >
            <div className="aurora aurora-a left-[-20%] top-[10%] size-[80vw]" />
            <ul className="relative space-y-2">
              {[...NAV_LINKS, { href: "/signup", label: "Get started" }].map((link, i) => (
                <li key={link.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07, duration: 0.9, ease: EASE_OUT_EXPO }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between border-b border-white/10 py-4 font-display text-5xl"
                    >
                      {link.label}
                      <span className="kicker text-haze">0{i + 1}</span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <p className="kicker relative mt-10 text-haze">UK · US · Nigeria · Free Zones</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
