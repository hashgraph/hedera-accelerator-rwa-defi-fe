import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "ipfs.io",
            port: "",
            pathname: "/**",
         },
      ],
   },
};

export default nextConfig;
