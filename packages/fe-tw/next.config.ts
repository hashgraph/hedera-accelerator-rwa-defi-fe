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
   // Add security headers configuration
   async headers() {
      return [
         {
            source: "/(.*)",
            headers: [
               {
                  key: "Cross-Origin-Opener-Policy",
                  value: "same-origin-allow-popups", // or "unsafe-none" for testing
               },
               {
                  key: "Cross-Origin-Embedder-Policy",
                  value: "require-corp",
               },
            ],
         },
      ];
   },
};

export default nextConfig;
