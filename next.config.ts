import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  serverExternalPackages: ["@prisma/client", "@prisma/engines"],

  // CRITICAL: Change output mode
  output: "standalone",

  // Add this to ensure Prisma binaries are copied
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/.prisma/client/**/*"],
  },

  turbopack: {},
};

export default nextConfig;
