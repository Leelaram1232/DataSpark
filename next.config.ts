import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16+ default)
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
