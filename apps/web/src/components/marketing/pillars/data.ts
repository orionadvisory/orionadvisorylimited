export type Pillar = {
  index: string;
  kicker: string;
  title: string;
  description: string;
  points: string[];
  image: string;
  imageAlt: string;
  tint: string;
  chip: string;
};

export const PILLARS: Pillar[] = [
  {
    index: "01",
    kicker: "Set up",
    title: "Build on solid ground.",
    description: "Incorporate, split founder equity fairly, and put governance in place before the cracks appear.",
    points: ["Incorporation", "Founder agreements", "Vesting & cap table"],
    image: "/images/marketing/blocks.jpg",
    imageAlt: "Abstract landscape of extruded white blocks",
    tint: "#19d3ae",
    chip: "Company structure · sorted",
  },
  {
    index: "02",
    kicker: "Raise",
    title: "Close the round.",
    description: "Term sheets, SAFEs, diligence and deal structure — handled without losing the plot.",
    points: ["SAFEs & convertible notes", "Term sheet review", "Diligence preparation"],
    image: "/images/marketing/handshake.jpg",
    imageAlt: "Founders and investors shaking hands across a desk of documents",
    tint: "#e9c47a",
    chip: "Diligence-ready",
  },
  {
    index: "03",
    kicker: "Grow",
    title: "Stay legally ready.",
    description: "Contracts, compliance, expert backup — and an AI co-pilot that knows when to call a human.",
    points: ["Commercial contracts", "Regulatory compliance", "Expert counsel on call"],
    image: "/images/marketing/magnifier.jpg",
    imageAlt: "A magnifying glass inspecting a legal document",
    tint: "#7aa2ff",
    chip: "0 open risks",
  },
];
