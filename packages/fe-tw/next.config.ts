import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "ipfs.io",
         },
      ],
      unoptimized: true,
   },
};

export default nextConfig;