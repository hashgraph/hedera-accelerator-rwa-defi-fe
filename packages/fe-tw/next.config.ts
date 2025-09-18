import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   async headers() {
      return [
         {
            source: "/(.*)",
            headers: [
               {
                  key: "Cross-Origin-Opener-Policy",
                  value: "same-origin-allow-popups",
               },
               {
                  key: "Cross-Origin-Embedder-Policy",
                  value: "unsafe-none",
               },
            ],
         },
      ];
   },
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
