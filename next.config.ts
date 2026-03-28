import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
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
