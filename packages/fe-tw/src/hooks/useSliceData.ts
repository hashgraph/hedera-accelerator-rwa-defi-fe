import type { BuildingToken, SliceAllocation } from "@/types/erc3643/types";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import {
   getTokenBalanceOf,
   getTokenDecimals,
   getTokenName,
   getTokenSymbol,
} from "@/services/erc20Service";
import { readSliceAllocations, readSliceBaseToken } from "@/services/sliceService";
import { useEvmAddress, useReadContract } from "@buidlerlabs/hashgraph-react-wallets";
import { prepareStorageIPFSfileURL } from "@/utils/helpers";
import { readBuildingDetails } from "./useBuildings";
import { fetchJsonFromIpfs } from "@/services/ipfsService";
import { sliceAbi } from "@/services/contracts/abi/sliceAbi";
import { ethers } from "ethers";
import { autoCompounderAbi } from "@/services/contracts/abi/autoCompounderAbi";
import { map } from "lodash";

const calculateIdealAllocation = (totalAllocationsCount: number) => {
   switch (totalAllocationsCount) {
      case 1:
         return 100;
      default:
         return 100 / totalAllocationsCount;
   }
};

export const useSliceData = (
   sliceAddress: `0x${string}`,
   buildingDeployedTokens?: BuildingToken[],
) => {
   const { readContract } = useReadContract();
   const [sliceBuildings, setSliceBuildings] = useState<BuildingToken[]>([]);
   const { data: evmAddress } = useEvmAddress();
   const [totalDeposits, setTotalDeposits] = useState({
      user: 0,
      total: 0,
   });
   const [sliceTokenDeposits, setSliceTokenDeposits] = useState<
      Record<
         string,
         {
            tokenAddress: `0x${string}`;
            amountInSlice: {
               user: number;
               total: number;
            };
         }
      >
   >({});
   const tokenDecimalsCacheRef = useRef<Record<string, number>>({});

   useEffect(() => {
      if (!sliceAddress) {
         return;
      }

      setTotalDeposits({ user: 0, total: 0 });
      setSliceTokenDeposits({});
      tokenDecimalsCacheRef.current = {};

      const unwatch = watchContractEvent({
         address: sliceAddress,
         abi: sliceAbi,
         eventName: "Deposit",
         onLogs: async (logs) => {
            if (!logs?.length) {
               return;
            }

            const normalizedUserAddress = evmAddress?.toLowerCase();

            const deposits = await Promise.all(
               logs.map(async (log) => {
                  const tokenAddress = (log.args?.[0] ?? "") as `0x${string}`;
                  const depositor = String(log.args?.[1] ?? "").toLowerCase();
                  const rawAmount = log.args?.[2] as bigint;

                  if (!tokenDecimalsCacheRef.current[tokenAddress]) {
                     try {
                        const decimalsResult = await getTokenDecimals(tokenAddress);
                        const decimalsValue = Array.isArray(decimalsResult)
                           ? Number(decimalsResult?.[0])
                           : Number(decimalsResult);
                        tokenDecimalsCacheRef.current[tokenAddress] = Number.isFinite(decimalsValue)
                           ? decimalsValue
                           : 18;
                     } catch (error) {
                        console.error("Failed to load token decimals", error);
                        tokenDecimalsCacheRef.current[tokenAddress] = 18;
                     }
                  }

                  const decimals = tokenDecimalsCacheRef.current[tokenAddress] ?? 18;
                  const formattedAmount = Number(ethers.formatUnits(rawAmount, decimals));

                  return {
                     tokenAddress,
                     depositor,
                     amount: formattedAmount,
                  };
               }),
            );

            const totalIncrement = deposits.reduce((acc, deposit) => acc + deposit.amount, 0);
            const userIncrement = deposits
               .filter((deposit) => deposit.depositor === normalizedUserAddress)
               .reduce((acc, deposit) => acc + deposit.amount, 0);

            setTotalDeposits((prev) => ({
               total: prev.total + totalIncrement,
               user: prev.user + userIncrement,
            }));

            setSliceTokenDeposits((prev) => {
               const updated = { ...prev };

               deposits.forEach(({ tokenAddress, amount, depositor }) => {
                  if (!tokenAddress) {
                     return;
                  }

                  const currentEntry = updated[tokenAddress] ?? {
                     tokenAddress,
                     amountInSlice: {
                        total: 0,
                        user: 0,
                     },
                  };

                  const isUserDeposit = depositor === normalizedUserAddress;

                  updated[tokenAddress] = {
                     tokenAddress,
                     amountInSlice: {
                        total: currentEntry.amountInSlice.total + amount,
                        user: currentEntry.amountInSlice.user + (isUserDeposit ? amount : 0),
                     },
                  };
               });

               return updated;
            });
         },
      });

      return () => unwatch();
   }, [evmAddress, sliceAddress]);

   const { data: sliceBaseToken } = useQuery<`0x${string}`>({
      queryKey: ["sliceBaseToken"],
      queryFn: async () => {
         const baseToken = await readSliceBaseToken(sliceAddress);

         return baseToken[0];
      },
      enabled: !!sliceAddress,
   });

   const { data: sliceBuildingsDetails } = useQuery({
      queryKey: ["sliceBuildingsDetails", sliceBuildings.map((b) => b?.buildingAddress)],
      queryFn: async () => {
         const buildings = await Promise.all(
            sliceBuildings.map((b) => readBuildingDetails(b.buildingAddress)),
         );
         const buildingsIPFSData = await Promise.all(
            buildings.map((b) => fetchJsonFromIpfs(b[0][2])),
         );

         return buildingsIPFSData.map((b, bId) => ({
            ...b,
            address: buildings[bId]?.[0]?.[0],
            image: prepareStorageIPFSfileURL(b.image?.replace("ipfs://", "")),
         }));
      },
      enabled: sliceBuildings?.length > 0,
      initialData: [],
   });

   const { data: sliceTokenInfo } = useQuery<any>({
      queryKey: ["sliceTokenInfo"],
      queryFn: async () => {
         if (sliceBaseToken) {
            const tokenBalance = await getTokenBalanceOf(sliceBaseToken, evmAddress);
            const tokenName = await getTokenName(sliceBaseToken);
            const tokenDecimals = await getTokenDecimals(sliceBaseToken);

            return {
               tokenBalance,
               tokenName,
               tokenDecimals,
            };
         }
      },
      enabled: !!sliceBaseToken && !!evmAddress,
   });

   const fetchActualAllocation = async (sliceAddress: string, aTokenAddress: `0x${string}`) => {
      const [aTokenBalance] = await getTokenBalanceOf(aTokenAddress, sliceAddress);
      const exchangeRate = (await readContract({
         abi: autoCompounderAbi,
         functionName: "exchangeRate",
         address: aTokenAddress,
         args: [],
      })) as bigint;

      const underlyingAmount = (aTokenBalance * exchangeRate) / ethers.parseUnits("1", 18);

      return underlyingAmount;
   };

   const { data: sliceAllocations } = useQuery<SliceAllocation[]>({
      refetchInterval: 10000,
      queryKey: ["sliceAllocations"],
      queryFn: async () => {
         const [allocations] = await readSliceAllocations(sliceAddress);

         const allocationBalance = await Promise.all(
            map(allocations, (allocation) =>
               fetchActualAllocation(sliceAddress, allocation[0] as `0x${string}`),
            ),
         );

         const allocationTokenNames = await Promise.allSettled(
            allocations
               .filter((allocationLog) => allocationLog.length > 0)
               .map((allocationLog) => getTokenSymbol(allocationLog[0] as `0x${string}`)),
         );

         const buildingTokenNames = await Promise.allSettled(
            allocations
               .filter((allocationLog) => allocationLog.length > 0)
               .map((allocationLog) => getTokenName(allocationLog[1] as `0x${string}`)),
         );

         return allocations
            .filter((allocationLog) => allocationLog[0].length > 0)
            .map((allocationLog, index: number) => ({
               aToken: allocationLog[0] as `0x${string}`,
               aTokenName:
                  allocationTokenNames[index].status === "fulfilled"
                     ? allocationTokenNames[index].value[0]
                     : null,
               buildingToken: allocationLog[1] as `0x${string}`,
               buildingTokenName:
                  buildingTokenNames[index].status === "fulfilled"
                     ? buildingTokenNames[index].value[0]
                     : null,
               idealAllocation: calculateIdealAllocation(allocations.length),
               actualAllocation: Number(allocationLog[2]) / 100,
               balance: Number(ethers.formatUnits(allocationBalance[index], 18)),
            }));
      },
      enabled: !!sliceAddress,
      initialData: [],
   });

   useEffect(() => {
      if (sliceAllocations?.length) {
         if (
            buildingDeployedTokens &&
            buildingDeployedTokens?.length > 0 &&
            sliceAllocations?.length > 0
         ) {
            setSliceBuildings(
               sliceAllocations.map(
                  (allocation) =>
                     buildingDeployedTokens.find(
                        (tok) => tok.tokenAddress === allocation.buildingToken,
                     )!,
               ),
            );
         }
      }
   }, [buildingDeployedTokens, sliceAllocations]);

   return {
      sliceAllocations,
      sliceBaseToken,
      sliceTokenInfo,
      sliceBuildings,
      sliceBuildingsDetails,
      totalDeposits,
      sliceTokenDeposits,
   };
};
