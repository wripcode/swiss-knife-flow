import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["level", "classic-level"],
  devIndicators: false,
};

export default nextConfig;
