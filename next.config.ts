import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "pub-8fdd3bcad3174a3ea4bc50d0c50d283e.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
