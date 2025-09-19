"use client";

import { useOneSidedExchangeFactoryAbi } from "@/services/contracts/abi/oneSidedExchangeFactoryAbi";
import {
   ONE_SIDED_EXCHANGE_ADDRESS,
   UNISWAP_FACTORY_ADDRESS,
} from "@/services/contracts/addresses";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import type { SwapTradeItem } from "@/types/erc3643/types";
import { useQuery } from "@tanstack/react-query";
import { ethers, ZeroAddress } from "ethers";
import { useEffect, useState } from "react";
import { uniswapFactoryAbi } from "@/services/contracts/abi/uniswapFactoryAbi";
import { uniswapPairAbi } from "@/services/contracts/abi/uniswapPairAbi";
import { type Log, QueryKeys } from "@/types/queries";
import { useTokenInfo } from "./useTokenInfo";
import { readContract as oldReadContract } from "@/services/contracts/readContract";
import { useAccount } from "wagmi";
import { readContract } from "wagmi/actions";
import { config } from "@/config";

const filterSwapHistoryItems = (swapItems: Log[], trader: `0x${string}`) => {
   return swapItems
      .filter((item) => item.args[0] === trader)
      .map((item) => ({
         tokenA: item.args[1],
         tokenB: item.args[2],
         tokenAAmount: ethers.formatUnits(item.args[3], 8),
         tokenBAmount: ethers.formatUnits(item.args[4], 8),
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
         const pairAddress = (await readContract(config, {
            address: UNISWAP_FACTORY_ADDRESS,
            abi: uniswapFactoryAbi,
            functionName: "getPair",
            args: [selectedTokensPair.tokenA!, selectedTokensPair.tokenB!],
         })) as `0x${string}`;

         const [token0, token1] = (await Promise.all([
            readContract(config, {
               address: pairAddress,
               abi: uniswapPairAbi,
               functionName: "token0",
            }),
            readContract(config, {
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

   const { address: evmAddress } = useAccount();

   useEffect(() => {
      if (
         Boolean(pairAddressData?.pairAddress) &&
         pairAddressData?.pairAddress !== ethers.ZeroAddress
      ) {
         const unwatch = watchContractEvent({
            address: pairAddressData?.pairAddress,
            abi: uniswapPairAbi,
            eventName: "Swap",
            onLogs: (data) => {
               setUniswapExchangeHistory(
                  data.map((log, logId) => ({
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
                     id: logId.toString(),
                  })),
               );
            },
         });

         return () => {
            unwatch();
         };
      }
   }, [pairAddressData]);

   useEffect(() => {
      const unwatch = watchContractEvent({
         address: ONE_SIDED_EXCHANGE_ADDRESS as `0x${string}`,
         abi: useOneSidedExchangeFactoryAbi,
         eventName: "SwapSuccess",
         onLogs: (data) => {
            setOneSidedExchangeSwapsHistory((prev) => [
               ...prev,
               ...filterSwapHistoryItems(data, evmAddress!),
            ]);
         },
      });

      return () => {
         unwatch();
      };
   }, []);

   // useEffect(() => {
   //    if (selectedTokensPair?.tokenA && selectedTokensPair?.tokenB) {
   //       setUniswapExchangeHistory([]);
   //    }
   // }, [selectedTokensPair?.tokenA, selectedTokensPair?.tokenB]);

   return { oneSidedExchangeSwapsHistory, uniswapExchangeHistory };
};
