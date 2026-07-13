import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@orion/auth", "@orion/core", "@orion/db", "@orion/ui"],
  // pdf-parse/pdfjs must not be bundled — keep it external so it loads via Node.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
