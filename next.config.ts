import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  cacheLife: {
    aggressive: {
      stale: 60 * 60 * 2,            // 2 hours (session-level)
      revalidate: 60 * 60 * 24 * 365, // 1 year
      expire: 60 * 60 * 24 * 365 * 2, // 2 years
    },
  },
  // logging: {
  //   fetches: {
  //     fullUrl: true
  //   }
  // },
  cacheComponents: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev",
        pathname: "/**",
      },
    ],
    unoptimized: true
  },
};

export default withSerwist(nextConfig);
