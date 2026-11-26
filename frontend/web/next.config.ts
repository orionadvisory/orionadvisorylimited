import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@orion/api", "@orion/contracts", "@orion/core", "@orion/session", "@orion/ui"],
  // pdf-parse/pdfjs must not be bundled — keep it external so it loads via Node.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
