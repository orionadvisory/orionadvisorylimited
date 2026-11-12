"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { cn } from "@orion/ui/utils";
import { EASE_OUT_EXPO } from "./easing";

/** A run of words sharing a style. Use `{ text: "\n" }` to force a line break. */
export type TextSegment = { text: string; className?: string };

type Tag = "h1" | "h2" | "h3" | "p";
type Token = { key: string; br: true } | { key: string; br: false; word: string; className?: string };

/**
 * Masked word-by-word reveal: each word rises out of its own clipping box.
 * Screen readers get the plain sentence; the animated copy is aria-hidden.
 */
export function SplitText({
  as: Tag = "h2",
  segments,
  className,
  delay = 0,
  stagger = 0.06,
  immediate = false,
}: {
  as?: Tag;
  segments: TextSegment[];
  className?: string;
  delay?: number;
  stagger?: number;
  /** Animate on mount (above the fold) instead of on scroll into view. */
  immediate?: boolean;
}) {
  const plain = segments.map((s) => (s.text === "\n" ? " " : s.text)).join(" ").replace(/\s+/g, " ").trim();

  const tokens = segments.flatMap((segment, si): Token[] =>
    segment.text === "\n"
      ? [{ key: `br-${si}`, br: true }]
      : segment.text
          .split(" ")
          .filter(Boolean)
          .map((word, wi) => ({ key: `${si}-${wi}`, br: false, word, className: segment.className })),
  );

  const trigger = immediate
    ? { animate: "show" }
    : { whileInView: "show", viewport: { once: true, margin: "0px 0px -12% 0px" } };

  return (
    <Tag className={className}>
      <span className="sr-only">{plain}</span>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        {...trigger}
        variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      >
        {tokens.map((t) =>
          t.br ? (
            <br key={t.key} />
          ) : (
            <Fragment key={t.key}>
              <span className="-mb-[0.18em] inline-block overflow-hidden pb-[0.18em] pr-[0.06em] align-bottom">
                <motion.span
                  className={cn("inline-block will-change-transform", t.className)}
                  variants={{
                    hidden: { y: "110%", rotate: 6, opacity: 0 },
                    show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 1.15, ease: EASE_OUT_EXPO } },
                  }}
                >
                  {t.word}
                </motion.span>
              </span>{" "}
            </Fragment>
          ),
        )}
      </motion.span>
    </Tag>
  );
}
