"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";
import Select from "react-select";
import { useOneSidedExchangeSwaps } from "@/hooks/useOneSidedExchangeSwaps";
import { Input } from "@/components/ui/input";
import { colourStyles } from "@/consts/theme";

type Props = {
   buildingTokens: `0x${string}`[];
};

export default function TradeFormOneSidedExchange({ buildingTokens }: Props) {
   const { checkBalanceOfLiquidityToken, handleSwapTokens, estimateTokensSwapSpendings } =
      useOneSidedExchangeSwaps();
   const [txResult, setTxResult] = useState<string>();
   const [txError, setTxError] = useState<string>();
   const [maxSwapTokenAmount, setMaxSwapTokenAmount] = useState<string>();
   const [tradeFormData, setTradeFormData] = useState({
      amount: "",
      tokenA: "",
      tokenB: "",
   });

   const checkIfSwapAllowed = async () => {
      const { tokenA, tokenB, amount } = tradeFormData;
      const exchangeTokenBalance = await checkBalanceOfLiquidityToken(tokenB as `0x${string}`);
      const [_, tokenBAmount] = await estimateTokensSwapSpendings(
         tokenA as `0x${string}`,
         tokenB as `0x${string}`,
         ethers.parseEther(amount.toString()),
      );

      if (exchangeTokenBalance >= tokenBAmount) {
         return true;
      } else {
         toast.error(
            `Not enough token balance to make a swap, it has only ${ethers.formatUnits(exchangeTokenBalance, 18)}`,
         );
         setMaxSwapTokenAmount(ethers.formatUnits(exchangeTokenBalance, 18));

         return false;
      }
   };

   const handleSwapSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const amount = tradeFormData.amount;
      const tokenB = tradeFormData.tokenB;

      if (!amount || !tradeFormData.tokenA || !tokenB) {
         toast.error("All fields in trade form are required");
      } else {
         try {
            setTxError("");
            setTxResult("");

            const isSwapAllowed = await checkIfSwapAllowed();

            if (isSwapAllowed) {
               const transactionId = await handleSwapTokens({
                  tokenA: tradeFormData.tokenA as `0x${string}`,
                  tokenB: tokenB as `0x${string}`,
                  amount: ethers.parseEther(amount.toString()),
               });

               toast.success(`Successfully sold ${amount} tokens for ${tokenB}!`);
               setTradeFormData({
                  amount: "",
                  tokenA: "",
                  tokenB: "",
               });
               setTxResult(transactionId);
            }
         } catch (err) {
            const message = (err as { message: string })?.message?.slice(0, 28);
            toast.error(`Failed to sell tokens: ${message}`);
            setTxError(message);
         }
      }
   };

   useEffect(() => {
      setMaxSwapTokenAmount(undefined);
   }, [tradeFormData]);

   return (
      <div className="flex-1 flex-col gap-4 w-6/12">
         <form
            onSubmit={handleSwapSubmit}
            className="bg-white rounded-lg p-10 border border-gray-300"
         >
            <h1 className="text-2xl font-bold mb-4">Trade Token via One Sided Exchange</h1>
            <span className="text-sm text-gray-900">
               Select a building token you hold and swap it to another building token or USDC
            </span>
            <div className="mt-5">
               <label
                  className="text-gray-500 text-md block mb-1 font-semibold"
                  htmlFor="tokenASelect"
               >
                  Select token A
               </label>
               <Select
                  placeholder="Select..."
                  onChange={(value) => {
                     setTradeFormData((prev) => ({
                        ...prev,
                        tokenA: value?.value as `0x${string}`,
                     }));
                  }}
                  options={buildingTokens.map((token) => ({
                     value: token,
                     label: token,
                  }))}
                  styles={colourStyles}
               />
            </div>
            <div className="mt-5">
               <label
                  className="text-gray-500 text-md block mb-1 font-semibold"
                  htmlFor="tokenBSelect"
               >
                  Select token B
               </label>
               <Select
                  onChange={(value) => {
                     setTradeFormData((prev) => ({
                        ...prev,
                        tokenB: value?.value as `0x${string}`,
                     }));
                  }}
                  options={buildingTokens.map((token) => ({
                     value: token,
                     label: token,
                  }))}
                  styles={colourStyles}
                  placeholder="Select..."
               />
            </div>
            <div className="mt-5">
               <label className="text-gray-500 text-md block mb-1 font-semibold" htmlFor="amount">
                  Amount of tokens to sell
               </label>
               <Input
                  className="input input-bordered w-full input-lg"
                  placeholder="e.g. 0.00001"
                  style={{
                     fontSize: 15,
                  }}
                  name="amount"
               />
               {maxSwapTokenAmount ? (
                  <p className="mt-2 text-purple-400 text-md">
                     Max amount of tokens to sell: {maxSwapTokenAmount}
                  </p>
               ) : (
                  <></>
               )}
               <button
                  type="submit"
                  className="px-6 py-3 mt-5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full"
               >
                  Swap tokens
               </button>
            </div>

            {txError && (
               <div className="flex mt-5">
                  <p className="text-md font-bold text-purple-600">Deployed Tx Error: {txError}</p>
               </div>
            )}
         </form>
      </div>
   );
}
