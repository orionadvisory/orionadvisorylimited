/** Illustrative sample report shown on the landing page — not real client data. */
export const SAMPLE_SCORE = 72;

export const SAMPLE_DOMAINS = [
  { label: "Formation", score: 92 },
  { label: "Equity & vesting", score: 48 },
  { label: "Fundraising", score: 66 },
  { label: "IP & data", score: 58 },
  { label: "Tax & filings", score: 84 },
  { label: "Contracts", score: 77 },
];

export const SAMPLE_ACTIONS = [
  { severity: "High", title: "Add founder vesting before the raise", domain: "Equity" },
  { severity: "High", title: "Assign pre-incorporation IP to the company", domain: "IP" },
  { severity: "Medium", title: "Paper your two biggest customer contracts", domain: "Contracts" },
] as const;

export function scoreTone(score: number) {
  if (score >= 75) return { bar: "bg-aurora", text: "text-aurora" };
  if (score >= 55) return { bar: "bg-gold", text: "text-gold" };
  return { bar: "bg-ember", text: "text-ember" };
}
