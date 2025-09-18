"use client";
import { isEmpty, isNumber } from "lodash";
import { ethers } from "ethers";
import { useQuery } from "@tanstack/react-query";
import { readBuildingDetails } from "@/hooks/useBuildings";
import { getTokenBalanceOf, getTokenDecimals } from "@/services/erc20Service";
import { QueryKeys } from "@/types/queries";
import { readUniswapPairs } from "@/hooks/useSwapsHistory";
import { USDC_ADDRESS } from "@/services/contracts/addresses";
import { useBuildingOwner } from "./useBuildingOwner";
import { useAccount } from "wagmi";

export const useBuildingInfo = (id?: string) => {
   const { buildingOwnerAddress, isLoading: buildingOwnerLoading } = useBuildingOwner(
      id as `0x${string}`,
   );
   const { address: evmAddress } = useAccount();

   const { data: buildingDetails, isLoading: buildingLoading } = useQuery({
      queryKey: ["BUILDING_DETAILS", id],
      queryFn: async () => {
         const buildingInfo = await readBuildingDetails(id as `0x${string}`);

         return {
            address: buildingInfo[0][0],
            auditRegistryAddress: buildingInfo[0][3],
            tokenAddress: buildingInfo[0][4],
            treasuryAddress: buildingInfo[0][5],
            governanceAddress: buildingInfo[0][6],
            vaultAddress: buildingInfo[0][7],
            autoCompounderAddress: buildingInfo[0][8] ?? ethers.ZeroAddress,
         };
      },
      enabled: Boolean(id),
      gcTime: 10 * 60 * 1000,
   });

   const { data: tokenAmountMinted, isLoading: tokenLoading } = useQuery({
      queryKey: ["TOKEN_AMOUNT", buildingDetails?.tokenAddress, evmAddress],
      queryFn: async () => {
         const [[decimals], [tokenAmountMinted]] = await Promise.all([
            getTokenDecimals(buildingDetails?.tokenAddress),
            getTokenBalanceOf(buildingDetails?.tokenAddress, evmAddress!),
         ]);

         const tokenAmountMintedFormatted = Number(ethers.formatUnits(tokenAmountMinted, decimals));

         return tokenAmountMintedFormatted;
      },
      enabled: Boolean(buildingDetails?.tokenAddress) && Boolean(evmAddress),
   });

   const { data: pairAddressData, isLoading: pairInfoLoading } = useQuery({
      queryKey: [QueryKeys.ReadUniswapPairs],
      enabled: Boolean(buildingDetails?.tokenAddress),
      queryFn: () => readUniswapPairs(buildingDetails?.tokenAddress, USDC_ADDRESS),
   });

   return {
      ...buildingDetails,
      buildingOwnerAddress,
      tokenAmountMinted,
      liquidityPairAddress: pairAddressData?.[0],
      isLoading: buildingLoading || tokenLoading || pairInfoLoading || buildingOwnerLoading,
   };
};

interface BuildingDetails {
   address?: string;
   tokenAddress?: string;
   tokenAmountMinted?: number;
   treasuryAddress?: string;
   governanceAddress?: string;
   vaultAddress?: string;
   auditRegistry?: string;
}

interface BuildingStateSummary {
   buildingDeployed: boolean;
   tokenDeployed: boolean;
   tokensMinted: boolean;
   treasuryDeployed: boolean;
   governanceDeployed: boolean;
   vaultDeployed: boolean;
}

export const getBuildingStateSummary = (buildingDetails: BuildingDetails): BuildingStateSummary => {
   return {
      buildingDeployed:
         !isEmpty(buildingDetails?.address) && buildingDetails?.address !== ethers.ZeroAddress,
      tokenDeployed:
         !isEmpty(buildingDetails?.tokenAddress) &&
         buildingDetails?.tokenAddress !== ethers.ZeroAddress,
      tokensMinted:
         isNumber(buildingDetails?.tokenAmountMinted) && buildingDetails?.tokenAmountMinted !== 0,
      treasuryDeployed:
         !isEmpty(buildingDetails?.treasuryAddress) &&
         buildingDetails?.treasuryAddress !== ethers.ZeroAddress,
      governanceDeployed:
         !isEmpty(buildingDetails?.governanceAddress) &&
         buildingDetails?.governanceAddress !== ethers.ZeroAddress,
      vaultDeployed:
         !isEmpty(buildingDetails?.vaultAddress) &&
         buildingDetails?.vaultAddress !== ethers.ZeroAddress,
   };
};
