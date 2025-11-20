import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: path.join(__dirname, "../../.."),
  },
  output: "standalone",
  experimental: {
    scrollRestoration: true,
  },
};

export default nextConfig;
