import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },

  serverExternalPackages: ["@prisma/client", "@prisma/engines"],

  // Keep standalone for optimal performance
  output: "standalone",

  turbopack: {},
};

export default nextConfig;
