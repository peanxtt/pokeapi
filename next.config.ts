import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
