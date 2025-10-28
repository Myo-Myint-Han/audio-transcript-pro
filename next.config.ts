import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    serverComponentsExternalPackages: ["@prisma/client", "@prisma/engines"],
  },
  output: "standalone",
};

export default nextConfig;
