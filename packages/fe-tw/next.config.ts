import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "ipfs.io",
         }
      ],
      unoptimized: true,
   },
   webpack: (config) => {
      // Suppress warnings for React Native modules used by MetaMask SDK
      config.resolve.fallback = {
         ...config.resolve.fallback,
         "@react-native-async-storage/async-storage": false,
      };
      return config;
   },
};

export default nextConfig;