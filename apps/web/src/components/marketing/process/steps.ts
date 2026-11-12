import { Compass, ListChecks, Rocket, type LucideIcon } from "lucide-react";

export const STEPS: { n: string; icon: LucideIcon; title: string; description: string; meta: string }[] = [
  {
    n: "01",
    icon: Compass,
    title: "Show us the chaos",
    description: "Answer a guided health check about your stage, location and goals. No legal vocabulary test required.",
    meta: "≈ 5 minutes",
  },
  {
    n: "02",
    icon: ListChecks,
    title: "Get the game plan",
    description: "A scored report across every legal domain: what’s sorted, what’s risky, and exactly what to tackle next.",
    meta: "Instant report",
  },
  {
    n: "03",
    icon: Rocket,
    title: "Build without the fog",
    description: "Guided workflows, generated documents and real experts — every legal loose end visible in one place.",
    meta: "Ongoing",
  },
];
