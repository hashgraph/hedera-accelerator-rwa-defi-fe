"use client";
import { createAppKit } from "@reown/appkit";
import { hederaTestnet } from "viem/chains";
import { WagmiProvider, Config, State } from "wagmi";
import { wagmiAdapter, projectId } from ".";

const metadata = {
   name: "RWA Demo UI",
   description: "RWA Demo UI",
   url: "http://localhost:3000/",
   icons: ["http://localhost:3000/logo192.png"],
};

const modal = createAppKit({
   features: {
      emailShowWallets: false,
      email: false,
      socials: false,
   },
   adapters: [wagmiAdapter],
   projectId: projectId!,
   networks: [hederaTestnet],
   defaultNetwork: hederaTestnet,
   metadata: metadata,
   themeMode: "light",
   themeVariables: {
      "--w3m-font-family": "geistMono sans-serif",
   },
});

const WagmiContextProvider = ({
   children,
   initialState,
}: {
   children: React.ReactNode;
   initialState?: State;
}) => {
   return (
      <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
         {children}
      </WagmiProvider>
   );
};

export default WagmiContextProvider;
