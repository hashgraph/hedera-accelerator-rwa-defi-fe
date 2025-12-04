"use client";

import { useOneSidedExchangeFactoryAbi } from "@/services/contracts/abi/oneSidedExchangeFactoryAbi";
import {
   ONE_SIDED_EXCHANGE_ADDRESS,
   UNISWAP_FACTORY_ADDRESS,
} from "@/services/contracts/addresses";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import type { SwapTradeItem } from "@/types/erc3643/types";
import {
   DEFAULT_TOKEN_DECIMALS,
   useEvmAddress,
   useReadContract,
} from "@buidlerlabs/hashgraph-react-wallets";
import { useQuery } from "@tanstack/react-query";
import { ethers, ZeroAddress } from "ethers";
import { useEffect, useState } from "react";
import { uniswapFactoryAbi } from "@/services/contracts/abi/uniswapFactoryAbi";
import { uniswapPairAbi } from "@/services/contracts/abi/uniswapPairAbi";
import { type Log, QueryKeys } from "@/types/queries";
import { tokens } from "@/consts/tokens";
import { useTokenInfo } from "./useTokenInfo";
import { readContract as oldReadContract } from "@/services/contracts/readContract";

const filterSwapHistoryItems = (swapItems: Log[], trader: `0x${string}`) => {
   return swapItems
      .filter((item) => item.args[0] === trader)
      .map((item) => ({
         tokenA: item.args[1],
         tokenB: item.args[2],
         tokenAAmount: ethers.formatUnits(item.args[3], DEFAULT_TOKEN_DECIMALS),
         tokenBAmount: ethers.formatUnits(item.args[4], DEFAULT_TOKEN_DECIMALS),
      }));
};

export const readUniswapPairs = (tokenAAddress: `0x${string}`, tokenBAddress: `0x${string}`) =>
   oldReadContract({
      address: UNISWAP_FACTORY_ADDRESS,
      abi: uniswapFactoryAbi,
      functionName: "getPair",
      args: [tokenAAddress, tokenBAddress],
   });

export const useSwapsHistory = (
   selectedTokensPair: { tokenA?: `0x${string}`; tokenB?: `0x${string}` },
   buildingTokenDecimals: {
      [key: `0x${string}`]: string;
   },
) => {
   const [oneSidedExchangeSwapsHistory, setOneSidedExchangeSwapsHistory] = useState<
      SwapTradeItem[]
   >([]);
   const [uniswapExchangeHistory, setUniswapExchangeHistory] = useState<SwapTradeItem[]>([]);
   const { readContract } = useReadContract();

   const { data: pairAddressData } = useQuery({
      queryKey: [
         QueryKeys.ReadUniswapPairs,
         selectedTokensPair?.tokenA,
         selectedTokensPair?.tokenB,
      ],
      refetchInterval: 10000,
      enabled:
         !!selectedTokensPair?.tokenA &&
         !!selectedTokensPair?.tokenB &&
         selectedTokensPair?.tokenA !== ZeroAddress &&
         selectedTokensPair?.tokenB !== ZeroAddress,
      queryFn: async () => {
         const pairAddress = (await readContract({
            address: UNISWAP_FACTORY_ADDRESS,
            abi: uniswapFactoryAbi,
            functionName: "getPair",
            args: [selectedTokensPair.tokenA, selectedTokensPair.tokenB],
         })) as `0x${string}`;

         const [token0, token1] = (await Promise.all([
            readContract({
               address: pairAddress,
               abi: uniswapPairAbi,
               functionName: "token0",
            }),
            readContract({
               address: pairAddress,
               abi: uniswapPairAbi,
               functionName: "token1",
            }),
         ])) as `0x${string}`[];

         return {
            pairAddress,
            token0,
            token1,
         };
      },
   });

   const token0Info = useTokenInfo(pairAddressData?.token0);
   const token1Info = useTokenInfo(pairAddressData?.token1);

   const { data: evmAddress } = useEvmAddress();

   useEffect(() => {
      if (
         Boolean(pairAddressData?.pairAddress) &&
         pairAddressData?.pairAddress !== ethers.ZeroAddress &&
         token0Info.symbol &&
         token1Info.symbol
      ) {
         // Reset history when pair changes
         setUniswapExchangeHistory([]);

         const unwatch = watchContractEvent({
            address: pairAddressData?.pairAddress,
            abi: uniswapPairAbi,
            eventName: "Swap",
            onLogs: (data) => {
               const newSwaps = data.map((log) => ({
                  isSell: log.args[1] !== BigInt(0),
                  tokenA: token0Info.symbol,
                  tokenB: token1Info.symbol,
                  tokenAAmount:
                     log.args[1] !== BigInt(0)
                        ? ethers.formatUnits(log.args[1], token0Info.decimals).toString()
                        : ethers.formatUnits(log.args[3], token0Info.decimals).toString(),
                  tokenBAmount:
                     log.args[2] !== BigInt(0)
                        ? ethers.formatUnits(log.args[2], 6).toString()
                        : ethers.formatUnits(log.args[4], 6).toString(),
                  id: log.rawLog?.transaction_hash || log.rawLog?.timestamp || Math.random().toString(),
               }));
               setUniswapExchangeHistory((prev) => {
                  // Avoid duplicates by checking if we already have these swaps
                  const existingIds = new Set(prev.map((s) => s.id));
                  const uniqueNewSwaps = newSwaps.filter((s) => !existingIds.has(s.id));
                  return [...prev, ...uniqueNewSwaps];
               });
            },
         });

         return () => {
            unwatch();
         };
      }
   }, [pairAddressData, token0Info.symbol, token1Info.symbol, token0Info.decimals]);

   useEffect(() => {
      if (!evmAddress) return;

      const unwatch = watchContractEvent({
         address: ONE_SIDED_EXCHANGE_ADDRESS as `0x${string}`,
         abi: useOneSidedExchangeFactoryAbi,
         eventName: "SwapSuccess",
         onLogs: (data) => {
            setOneSidedExchangeSwapsHistory((prev) => [
               ...prev,
               ...filterSwapHistoryItems(data, evmAddress),
            ]);
         },
      });

      return () => {
         unwatch();
      };
   }, [evmAddress]);

   // useEffect(() => {
   //    if (selectedTokensPair?.tokenA && selectedTokensPair?.tokenB) {
   //       setUniswapExchangeHistory([]);
   //    }
   // }, [selectedTokensPair?.tokenA, selectedTokensPair?.tokenB]);

   return { oneSidedExchangeSwapsHistory, uniswapExchangeHistory };
};

