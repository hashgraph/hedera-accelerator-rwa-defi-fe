"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { WalkthroughProvider } from "@/components/Walkthrough";
import { ReactWalletsProvider } from "@/services/wallets/ReactWalletsProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
               <SidebarProvider>{children}</SidebarProvider>
            </ReactWalletsProvider>
         </WalkthroughProvider>
      </QueryClientProvider>
   );
}
