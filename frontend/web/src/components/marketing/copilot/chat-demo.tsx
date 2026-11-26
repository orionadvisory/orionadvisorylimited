"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Sparkles, UserRoundCheck } from "lucide-react";
import { cn } from "@orion/ui/utils";
import { EASE_OUT_EXPO } from "../motion/easing";

type Message = { from: "ai" | "user"; text: string; reviewed?: boolean };

const SCRIPT: Message[] = [
  { from: "ai", text: "Your founder shares have no vesting schedule. Investors will spot that in diligence — let’s fix it before the raise." },
  { from: "user", text: "Explain that without the lawyer voice?" },
  {
    from: "ai",
    text: "Basically: vesting means everyone earns their shares over time. It protects the company if a co-founder walks away early.",
    reviewed: true,
  },
];

/** A conversation that plays itself out (with typing indicators) once scrolled into view. */
export function ChatDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -120px 0px" });
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!inView) return;
    // Reduced motion: same sequence, zero delays — everything appears at once.
    const pace = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = 300 * pace;
    SCRIPT.forEach((msg, i) => {
      if (msg.from === "ai" && pace) {
        timers.push(setTimeout(() => setTyping(true), t));
        t += 1300;
      } else {
        t += 900 * pace;
      }
      timers.push(
        setTimeout(() => {
          setTyping(false);
          setShown(i + 1);
        }, t),
      );
      t += 700 * pace;
    });
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div ref={ref} className="glass relative w-full max-w-md rounded-3xl p-5 shadow-[0_40px_100px_-30px_rgba(12,26,23,0.22)]">
      <div className="flex items-center gap-3 border-b border-ink/10 pb-4">
        <span className="grid size-10 place-items-center rounded-full bg-aurora/15 text-aurora-deep">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-medium">Orion co-pilot</p>
          <p className="flex items-center gap-1.5 text-xs text-mist">
            <span className="pulse-dot size-1.5 rounded-full bg-aurora" /> Legal translator · online
          </p>
        </div>
      </div>

      <div className="flex min-h-[19rem] flex-col justify-end gap-3 pt-4" aria-live="polite">
        <AnimatePresence initial={false}>
          {SCRIPT.slice(0, shown).map((m, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
              className={cn(
                "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                m.from === "ai" ? "rounded-tl-sm bg-ink/[0.06] text-ink/90" : "ml-auto rounded-tr-sm bg-ink text-cloud",
              )}
            >
              {m.text}
              {m.reviewed && (
                <span className="mt-2.5 flex items-center gap-1.5 text-xs text-aurora-deep">
                  <UserRoundCheck className="size-3.5" aria-hidden="true" /> Reviewed by a human lawyer
                </span>
              )}
            </motion.div>
          ))}
          {typing && (
            <motion.div
              key="typing"
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex w-fit gap-1 rounded-2xl rounded-tl-sm bg-ink/[0.06] px-4 py-3.5"
              aria-label="Orion is typing"
            >
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="size-1.5 rounded-full bg-mist"
                  animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
