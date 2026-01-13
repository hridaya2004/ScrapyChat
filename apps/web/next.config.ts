import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: path.join(__dirname, "../../"),
  },
  outputFileTracingRoot: path.join(__dirname, "../../"),
  output: "standalone",
  experimental: {
    scrollRestoration: true,
    authInterrupts: true,
    turbopackFileSystemCacheForBuild: true,
  },
  devIndicators: {
    position: "top-left",
  },
};

export default nextConfig;
