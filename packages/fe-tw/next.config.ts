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
         {
            protocol: "https",
            hostname: "plum-famous-crane-874.mypinata.cloud",
            port: "",
            pathname: "/**",
         },
      ],
   },
};

export default nextConfig;