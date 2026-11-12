/**
 * The Orion constellation, normalised to a unit box (x → right, y → down),
 * with each star standing in for a legal domain Orion checks.
 * `mag` scales the glow; `color` tints it (Betelgeuse warm, Rigel blue-white).
 */
export type ConstellationStar = {
  name: string;
  label: string;
  x: number;
  y: number;
  mag: number;
  color: [number, number, number];
};

const MINT: [number, number, number] = [25, 211, 174];

export const ORION_STARS: ConstellationStar[] = [
  { name: "Meissa", label: "Formation", x: 0.47, y: 0.02, mag: 0.8, color: MINT },
  { name: "Betelgeuse", label: "Equity", x: 0.14, y: 0.18, mag: 1.5, color: [240, 140, 90] },
  { name: "Bellatrix", label: "Fundraising", x: 0.76, y: 0.23, mag: 1.05, color: MINT },
  { name: "Alnitak", label: "Tax", x: 0.37, y: 0.58, mag: 1, color: MINT },
  { name: "Alnilam", label: "IP", x: 0.48, y: 0.535, mag: 1.05, color: MINT },
  { name: "Mintaka", label: "Contracts", x: 0.59, y: 0.495, mag: 0.9, color: MINT },
  { name: "Saiph", label: "Compliance", x: 0.24, y: 0.96, mag: 1, color: MINT },
  { name: "Rigel", label: "Disputes", x: 0.82, y: 0.9, mag: 1.5, color: [100, 150, 255] },
];

/** Index pairs into ORION_STARS, in the order the lines draw in. */
export const ORION_LINKS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 5],
  [3, 4],
  [4, 5],
  [3, 6],
  [5, 7],
];
