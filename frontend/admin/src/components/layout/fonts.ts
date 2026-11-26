import { Instrument_Serif } from "next/font/google";

/**
 * Display serif for the admin shell. Admin's root layout doesn't load fonts,
 * so this declares `--font-display` directly on the shell wrapper — the
 * `font-display` utility from the shared Orion theme then resolves to it.
 */
export const displayFont = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
