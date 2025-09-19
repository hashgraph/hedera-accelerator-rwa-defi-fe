import type { BuildingToken, SliceAllocation } from "@/types/erc3643/types";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import {
   getTokenBalanceOf,
   getTokenDecimals,
   getTokenName,
   getTokenSymbol,
} from "@/services/erc20Service";
import { readSliceAllocations, readSliceBaseToken } from "@/services/sliceService";
import { prepareStorageIPFSfileURL } from "@/utils/helpers";
import { readBuildingDetails } from "./useBuildings";
import { fetchJsonFromIpfs } from "@/services/ipfsService";
import { sliceAbi } from "@/services/contracts/abi/sliceAbi";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

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
   const [sliceBuildings, setSliceBuildings] = useState<BuildingToken[]>([]);
   const { address: evmAddress } = useAccount();
   const [totalDeposits, setTotalDeposits] = useState({
      user: 0,
      total: 0,
   });

   useEffect(() => {
      const unwatch = watchContractEvent({
         address: sliceAddress,
         abi: sliceAbi,
         eventName: "Deposit",
         onLogs: (logs) => {
            const userDeposits = logs
               .filter((log) => log.args[1].toLowerCase() === evmAddress?.toLowerCase())
               .reduce((acc, log) => {
                  return (acc += Number(ethers.formatUnits(log.args[2], 18)));
               }, 0);
            const totalDeposits = logs.reduce((acc, log) => {
               return (acc += Number(ethers.formatUnits(log.args[2], 18)));
            }, 0);

            setTotalDeposits((prev) => ({
               total: prev.total + totalDeposits,
               user: prev.user + userDeposits,
            }));
         },
      });

      return () => unwatch();
   }, []);

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
            const tokenBalance = await getTokenBalanceOf(sliceBaseToken, evmAddress!);
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

   const { data: sliceAllocations } = useQuery<SliceAllocation[]>({
      refetchInterval: 10000,
      queryKey: ["sliceAllocations"],
      queryFn: async () => {
         const [allocations] = await readSliceAllocations(sliceAddress);
         const allocationTokenNames = await Promise.allSettled(
            allocations
               .filter((allocationLog) => allocationLog.length > 0)
               .map((allocationLog) => getTokenSymbol(allocationLog[0] as `0x${string}`)),
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
               idealAllocation: calculateIdealAllocation(allocations.length),
               actualAllocation: Number(allocationLog[2]) / 100,
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
   };
};
