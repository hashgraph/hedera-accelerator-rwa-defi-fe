"use client";
import { usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { useWalkthroughStore } from "./WalkthroughStore";
import { walkthroughBarrier } from "./WalktroughSyncBarrier";

export const WalkthroughProvider = ({ children }: { children: ReactNode }) => {
   const initializeWalkthrough = useWalkthroughStore((state) => state.initializeWalkthrough);
   const pathname = usePathname();

   useEffect(() => {
      walkthroughBarrier.onBarrierComplete(() => {
         initializeWalkthrough();
      });

      return () => {
         walkthroughBarrier.reset();
      };
   }, [pathname]);

   return children;
};
