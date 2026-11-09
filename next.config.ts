import type { NextConfig } from "next";
import path from "path";
import { applyDatabaseUrl } from "./src/lib/database-url";

applyDatabaseUrl();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    cpus: 1,
    webpackMemoryOptimizations: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [];
  },
};

export default nextConfig;
