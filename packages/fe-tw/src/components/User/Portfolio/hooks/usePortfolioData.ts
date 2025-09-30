import { useQuery } from "@tanstack/react-query";
import { filter, isEmpty, map } from "lodash";
import { readBuildingDetails, readBuildingsList } from "@/services/buildingService";
import { getTokenBalanceOf, getTokenDecimals, getTokenSymbol } from "@/services/erc20Service";
import { PortfolioToken } from "@/components/User/Portfolio/types";
import { ethers } from "ethers";
import { readContract } from "@/services/contracts/readContract";
import { buildingTreasuryAbi } from "@/services/contracts/abi/buildingTreasuryAbi";
import { basicVaultAbi } from "@/services/contracts/abi/basicVaultAbi";
import { getUserReward } from "../helpers";
import { useAccount } from "wagmi";

export const usePortfolioData = () => {
   const { address: evmAddress } = useAccount();

   return useQuery<PortfolioToken[] | null>({
      queryKey: ["PORTFOLIO_TOKENS", evmAddress],
      queryFn: async () => {
         if (!evmAddress) return null;

         const buildingsData = await readBuildingsList();
         const buildingAddresses = (
            buildingsData?.[0] ? map(buildingsData[0], (building) => building?.[0]) : []
         ) as `0x${string}`[];

         if (!buildingAddresses || buildingAddresses.length === 0) return [];

         const portfolioDataPromises = buildingAddresses.map(async (buildingAddress) => {
            const buildingInfo = await readBuildingDetails(buildingAddress);
            const tokenAddress = buildingInfo?.[0]?.[4];
            const treasuryAddress = buildingInfo?.[0]?.[5];

            const [vaultAddress] = await readContract({
               address: treasuryAddress,
               abi: buildingTreasuryAbi,
               functionName: "vault",
            });

            const [[tokenBalance], [tokenDecimals], symbol, pendingRewards] = await Promise.all([
               getTokenBalanceOf(tokenAddress, evmAddress),
               getTokenDecimals(tokenAddress),
               getTokenSymbol(tokenAddress),
               getUserReward(vaultAddress, evmAddress),
            ]);

            const tokenBalanceFormatted = Number(ethers.formatUnits(tokenBalance, tokenDecimals));

            return {
               tokenAddress,
               balance: tokenBalanceFormatted,
               symbol: String(symbol || "N/A"),
               exchangeRateUSDC: 1,
               pendingRewards,
            };
         });

         const portfolioDataResults = await Promise.all(portfolioDataPromises);
         const tokensUserHasBalance = filter(portfolioDataResults, ({ balance }) => balance !== 0);

         return tokensUserHasBalance as PortfolioToken[];
      },
      enabled: !!evmAddress,
   });
};
