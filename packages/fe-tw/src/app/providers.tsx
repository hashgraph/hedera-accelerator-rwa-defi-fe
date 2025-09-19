"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { WalkthroughProvider } from "@/components/Walkthrough";
import { wagmiAdapter } from "@/config";
import WagmiContextProvider from "@/config/WagmiContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type React from "react";
import { Config, cookieToInitialState, WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

export function Providers({
   children,
   cookies,
}: Readonly<{
   children: React.ReactNode;
   cookies: string | null;
}>) {
   const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

   return (
      <QueryClientProvider client={queryClient}>
         <WagmiContextProvider initialState={initialState}>
            <WalkthroughProvider>
               <NuqsAdapter>
                  <SidebarProvider>{children}</SidebarProvider>
               </NuqsAdapter>
            </WalkthroughProvider>
         </WagmiContextProvider>
      </QueryClientProvider>
   );
}
