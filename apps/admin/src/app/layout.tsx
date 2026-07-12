import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orion Admin",
  description: "Administration console for the Orion legal operating system.",
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
