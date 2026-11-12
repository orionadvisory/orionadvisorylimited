import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

// Font variables are exposed on <html>; only surfaces that opt in (the
// marketing site via `font-display` / `font-body`) actually use them.
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});
const body = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Orion — Legal OS for Startups",
  description: "The legal operating system for ambitious startups. AI-powered legal guidance, document generation, and workflow automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
