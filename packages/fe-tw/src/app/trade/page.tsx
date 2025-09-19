"use client";

import TradeView from "@/components/Trade/TradeView";
import { useAccount } from "wagmi";

export default function TradeViewPage() {
   const { address: evmAddress } = useAccount();

   return (
      <div className="flex flex-col mt-20 gap-10">
         {!evmAddress ? (
            <p className="font-bold">This page available only for authorized users</p>
         ) : (
            <>
               <h1 className="text-4xl font-bold mb-4">Trade Tokens Page</h1>
               <TradeView />
            </>
         )}
      </div>
   );
}
