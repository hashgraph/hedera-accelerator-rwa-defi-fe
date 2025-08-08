import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
      unoptimized: true,
      remotePatterns: [
         {
            protocol: "https",
            hostname: "gateway.pinata.cloud",
            port: "",
            pathname: "/ipfs/**", 
         },
         {
            protocol: "https",
            hostname: "plum-famous-crane-874.mypinata.cloud",
            port: "",
            pathname: "/ipfs/**",
         },
      ],
   },
};

export default nextConfig;
