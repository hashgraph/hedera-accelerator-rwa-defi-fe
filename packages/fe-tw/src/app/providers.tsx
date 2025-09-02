"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { WalkthroughProvider } from "@/components/Walkthrough";
import { ReactWalletsProvider } from "@/services/wallets/ReactWalletsProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type React from "react";

const queryClient = new QueryClient();

export function Providers({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <QueryClientProvider client={queryClient}>
         <WalkthroughProvider>
            <ReactWalletsProvider>
               <NuqsAdapter>
                  <SidebarProvider>{children}</SidebarProvider>
               </NuqsAdapter>
            </ReactWalletsProvider>
         </WalkthroughProvider>
      </QueryClientProvider>
   );
}
