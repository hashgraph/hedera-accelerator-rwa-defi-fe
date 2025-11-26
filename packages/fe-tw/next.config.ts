import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "ipfs.io",
         },
         {
            protocol: "https",
            hostname: "plum-famous-crane-874.mypinata.cloud",
            port: "",
            pathname: "/**",
         },
      ],
      unoptimized: true,
   },
};

export default nextConfig;