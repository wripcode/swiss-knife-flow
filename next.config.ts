import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["level", "classic-level"],
  devIndicators: false,
  experimental: {
    useTypeScriptCli: true,
  },
};

export default nextConfig;
