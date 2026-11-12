"use client";

import { motion } from "motion/react";
import { EASE_OUT_EXPO } from "./easing";

/** Fades, de-blurs and lifts its children into place the first time they scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 1.1, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}
