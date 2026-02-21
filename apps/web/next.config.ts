import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: path.join(import.meta.dirname, "../../"),
  },
  outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
  output: "standalone",
  experimental: {
    scrollRestoration: true,
    authInterrupts: true,
  },
  devIndicators: {
    position: "top-left",
  },
};

export default nextConfig;
