import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: "top-left",
  },
  experimental: {
    authInterrupts: true,
    scrollRestoration: true,
  },
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  /* config options here */
  turbopack: {
    root: path.join(import.meta.dirname, "../../"),
  },
};

export default nextConfig;
