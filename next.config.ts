import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  // Fixed: Moved from experimental to root level
  serverExternalPackages: ["@prisma/client", "@prisma/engines"],

  output: "standalone",

  // Fixed: Add turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
