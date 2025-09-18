"use client";

import { convertBuildingNFTsData, readBuildingsList } from "@/services/buildingService";
import { useQuery } from "@tanstack/react-query";
import { fetchBuildingInfo, fetchBuildingNFTsMetadata, readBuildingDetails } from "./helpers";
import { getTokenBalanceOf, getTokenDecimals, getTokenName } from "@/services/erc20Service";
import { useAccount } from "wagmi";

export function useBuildings() {
   const { address: evmAddress } = useAccount();

   const { data: buildingsList } = useQuery({
      queryKey: ["buildingsList"],
      queryFn: async () => {
         const buildings = await readBuildingsList();
         const buildingsList: `0x${string}`[][] = await buildings.slice(-1)[0];
         const { buildingAddressesProxiesData, buildingNFTsData } = await fetchBuildingNFTsMetadata(
            buildingsList?.map((building) => building[0]),
            [],
         );

         return convertBuildingNFTsData(
            buildingNFTsData.map((data, id) => ({
               ...data,
               address: buildingAddressesProxiesData[id][0][0],
               copeIpfsHash: buildingAddressesProxiesData[id][0][2],
            })),
         );
      },
      enabled: true,
   });

   const { data: buildingsInfo } = useQuery({
      queryKey: ["buildingsInfo"],
      queryFn: async () => {
         if (buildingsList && buildingsList.length > 0) {
            const buildingsInfo = await Promise.allSettled(
               buildingsList?.map((building) => readBuildingDetails(building.address!)),
            );

            return buildingsInfo
               .filter((promise) => promise.status === "fulfilled")
               .map((info) => ({
                  buildingAddress: info.value[0][0],
                  acAddress: info.value[0][8],
                  tokenAddress: info.value[0][4],
               }));
         }
      },
      enabled: !!buildingsList?.length,
   });

   const { data: buildingsTokensInfo } = useQuery({
      queryKey: ["buildingsTokensInfo"],
      queryFn: async () => {
         if (buildingsInfo) {
            const buildingTokenNames = await Promise.allSettled(
               buildingsInfo?.map((info) => getTokenName(info.tokenAddress!)),
            );
            const buildingTokenDecimals = await Promise.allSettled(
               buildingsInfo?.map((info) => getTokenDecimals(info.tokenAddress!)),
            );
            const buildingTokenBalances = await Promise.allSettled(
               buildingsInfo?.map((info) => getTokenBalanceOf(info.tokenAddress!, evmAddress!)),
            );

            return buildingsInfo.map((info, index) => ({
               tokenAddress: info.tokenAddress,
               tokenName:
                  buildingTokenNames[index].status === "fulfilled"
                     ? buildingTokenNames[index].value[0]
                     : null,
               tokenDecimals:
                  buildingTokenDecimals[index].status === "fulfilled"
                     ? buildingTokenDecimals[index].value[0]
                     : null,
               tokenBalance:
                  buildingTokenBalances[index].status === "fulfilled"
                     ? buildingTokenBalances[index].value[0]
                     : null,
            }));
         }
      },
      enabled: !!buildingsInfo?.length && !!evmAddress,
   });

   return {
      buildings: buildingsList,
      buildingsTokensInfo,
      buildingsInfo,
   };
}

export const useBuilding = (id: string) => {
   const query = useQuery({
      queryKey: ["building", id],
      queryFn: () => fetchBuildingInfo(id),
      enabled: !!id,
   });

   return query;
};
