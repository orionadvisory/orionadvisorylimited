import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@orion/auth", "@orion/core", "@orion/db", "@orion/ui"],
};

export default nextConfig;
