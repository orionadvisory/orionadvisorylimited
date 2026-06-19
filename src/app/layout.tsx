import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
