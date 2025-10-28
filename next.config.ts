import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  // Force output to standalone mode (this often fixes Prisma on Vercel)
  output: "standalone",
};

export default nextConfig;
