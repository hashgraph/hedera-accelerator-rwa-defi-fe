"use client";

import { useOneSidedExchangeFactoryAbi } from "@/services/contracts/abi/oneSidedExchangeFactoryAbi";
import { tokenAbi } from "@/services/contracts/abi/tokenAbi";
import { ONE_SIDED_EXCHANGE_ADDRESS } from "@/services/contracts/addresses";
import type {
   SwapTokenAddLiquidityRequestBody,
   SwapTokenPriceRequestBody,
   SwapTokenSwapRequestBody,
} from "@/types/erc3643/types";
import { useState } from "react";
import useWriteContract from "./useWriteContract";
import { readContract } from "wagmi/actions";
import { config } from "@/config";
import { executeTransaction } from "./useExecuteTransaction";

export const useOneSidedExchangeSwaps = () => {
   const { writeContract } = useWriteContract();

   const [isSwapTokensLoading, setSwapTokensLoading] = useState(false);
   const [isAddLiquidityLoading, setAddLiquidityLoading] = useState(false);
   const [isSetPriceForTokenLoading, setIsSetPriceForTokenLoading] = useState(false);

   const checkBalanceOfLiquidityToken = async (token: `0x${string}`): Promise<bigint> => {
      const balance = await readContract(config, {
         address: token,
         abi: tokenAbi,
         functionName: "balanceOf",
         args: [ONE_SIDED_EXCHANGE_ADDRESS],
      });

      return balance as bigint;
   };

   const estimateTokensSwapSpendings = async (
      tokenA: `0x${string}`,
      tokenB: `0x${string}`,
      amount: bigint,
   ) => {
      const [tokenAAmount, tokenBAmount] = await readContract(config, {
         address: ONE_SIDED_EXCHANGE_ADDRESS,
         abi: useOneSidedExchangeFactoryAbi,
         functionName: "estimateTokenReturns",
         args: [tokenA, tokenB, amount],
      });

      return [tokenAAmount, tokenBAmount];
   };

   const handleSetTokenPrice = (body: SwapTokenPriceRequestBody) => {
      setIsSetPriceForTokenLoading(true);

      const result = executeTransaction(() =>
         writeContract({
            address: ONE_SIDED_EXCHANGE_ADDRESS,
            abi: useOneSidedExchangeFactoryAbi,
            functionName: body.isSell ? "setSellPrice" : "setBuyPrice",
            args: [body.token, body.amount, body.thresholdIntervalInSeconds],
         }),
      );
      setIsSetPriceForTokenLoading(false);

      return result;
   };

   const handleAddTokenLiquidity = async (body: SwapTokenAddLiquidityRequestBody) => {
      setAddLiquidityLoading(true);

      const approveTx = await executeTransaction(() =>
         writeContract({
            address: body.tokenA,
            abi: tokenAbi,
            functionName: "approve",
            args: [ONE_SIDED_EXCHANGE_ADDRESS, body.amount],
         }),
      );

      const addLiquidityForTokenTx = await executeTransaction(() =>
         writeContract({
            address: ONE_SIDED_EXCHANGE_ADDRESS,
            abi: useOneSidedExchangeFactoryAbi,
            functionName: "addLiquidityForToken",
            args: [body.tokenA, body.amount],
         }),
      );

      setAddLiquidityLoading(false);

      const liquidityTxResults = {
         approval: approveTx.transactionHash,
         liquidity: addLiquidityForTokenTx.transactionHash,
      };

      return liquidityTxResults;
   };

   const handleSwapTokens = async (body: SwapTokenSwapRequestBody): Promise<string> => {
      setSwapTokensLoading(true);

      const result = await executeTransaction(() =>
         writeContract({
            address: ONE_SIDED_EXCHANGE_ADDRESS,
            abi: useOneSidedExchangeFactoryAbi,
            functionName: "swap",
            args: [body.tokenA, body.tokenB, body.amount],
         }),
      );

      setAddLiquidityLoading(false);

      return result.transactionHash;
   };

   return {
      isSwapTokensLoading,
      isAddLiquidityLoading,
      isSetPriceForTokenLoading,
      estimateTokensSwapSpendings,
      checkBalanceOfLiquidityToken,
      handleAddTokenLiquidity,
      handleSwapTokens,
      handleSetTokenPrice,
   };
};
