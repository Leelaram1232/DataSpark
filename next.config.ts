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
  // Proxy /api/backend/* to local FastAPI server during development
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://localhost:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
