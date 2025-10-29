import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },

  serverExternalPackages: ["@prisma/client", "@prisma/engines"],

  // REMOVED: output: "standalone",

  turbopack: {},
};

export default nextConfig;
