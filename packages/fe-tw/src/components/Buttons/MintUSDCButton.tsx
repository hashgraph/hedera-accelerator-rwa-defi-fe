"use client";

import { useState } from "react";
import { useEvmAddress, useWriteContract } from "@buidlerlabs/hashgraph-react-wallets";
import { Button } from "@/components/ui/button";
import { tokenAbi } from "@/services/contracts/abi/tokenAbi";
import { ContractId } from "@hashgraph/sdk";
import { useExecuteTransaction } from "@/hooks/useExecuteTransaction";
import { TxResultToastView } from "../CommonViews/TxResultView";
import { toast } from "sonner";
import { CoinsIcon } from "lucide-react";
import { USDC_ADDRESS } from "@/services/contracts/addresses";
import { TransactionExtended } from "@/types/common";
import { WalkthroughStep } from "../Walkthrough";
import { on } from "events";
import { useWalkthroughStore } from "../Walkthrough/WalkthroughStore";

const MINT_AMOUNT = 1000000000;
const DECIMALS = 6;

export const MintUSDCButton = () => {
   const currentGuide = useWalkthroughStore((state) => state.currentGuide);
   const { writeContract } = useWriteContract();
   const { executeTransaction } = useExecuteTransaction();
   const { data: evmAddress } = useEvmAddress();
   const [isLoading, setIsLoading] = useState(false);

   const handleMint = async ({ onSuccess }: { onSuccess: () => void }) => {
      if (!evmAddress) {
         toast.error("Please connect your wallet first.");
         return;
      }

      setIsLoading(true);

      try {
         console.log(`Using hardcoded decimals: ${DECIMALS}`);

         const amountAsBigInt = BigInt(MINT_AMOUNT) * BigInt(10) ** BigInt(DECIMALS);

         console.log(`Attempting to mint ${amountAsBigInt.toString()} base units to ${evmAddress}`);

         const tx = (await executeTransaction(() =>
            writeContract({
               contractId: ContractId.fromEvmAddress(0, 0, USDC_ADDRESS),
               args: [evmAddress as `0x${string}`, amountAsBigInt],
               functionName: "mint",
               abi: tokenAbi,
            }),
         )) as TransactionExtended;

         onSuccess();
         toast.success(<TxResultToastView title={`${MINT_AMOUNT} USDC minted!`} txSuccess={tx} />);
      } catch (err) {
         toast.error(
            <TxResultToastView title="Error minting tokens" txError={(err as { tx: string }).tx} />,
            {
               duration: 10000,
            },
         );
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="bg-white rounded-xl shadow-lg border border-indigo-100 w-full max-w-md p-6 space-y-4">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
               <CoinsIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
               <h3 className="text-xl font-semibold text-indigo-900">Mint Demo USDC</h3>
               <p className="text-sm text-indigo-700/70">
                  Click the button to get {MINT_AMOUNT} test tokens.
               </p>
            </div>
         </div>

         {!evmAddress && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
               <p className="font-medium text-red-800">
                  Please connect your wallet to mint tokens.
               </p>
            </div>
         )}

         <WalkthroughStep
            guideId={"USER_LOGIN_FLOW"}
            stepIndex={5}
            title="Mint yourself some USDC"
            description={"Now you are ready to experience the platform."}
            side="right"
         >
            {({ confirmUserFinishedGuide }) => (
               <Button
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                  disabled={isLoading || !evmAddress}
                  onClick={() =>
                     handleMint({
                        onSuccess: confirmUserFinishedGuide,
                     })
                  }
               >
                  {isLoading ? "Minting..." : `Mint ${MINT_AMOUNT} USDC`}
               </Button>
            )}
         </WalkthroughStep>
      </div>
   );
};
