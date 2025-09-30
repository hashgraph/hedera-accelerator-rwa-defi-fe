import { basicVaultAbi } from "@/services/contracts/abi/basicVaultAbi";
import { getTokenDecimals } from "@/services/erc20Service";
import { ethers } from "ethers";
import { isEmpty } from "lodash";
import { HistoryPoint, TimeFrame } from "./types";
import { readContract } from "@/services/contracts/readContract";
import { USDC_ADDRESS } from "@/services/contracts/addresses";

export const generateMockHistory = (tokenAddress: string, timeFrame: TimeFrame): HistoryPoint[] => {
   const endDate = new Date();
   let startDate = new Date();
   let numPoints = 0;
   const daysMap: Record<TimeFrame, number> = {
      "1D": 1,
      "1W": 7,
      "1M": 30,
      "3M": 90,
      "6M": 180,
      "1Y": 365,
      ALL: 365 * 3,
   };

   const days = daysMap[timeFrame] || 30;
   startDate.setDate(endDate.getDate() - days);
   numPoints = days;

   const data: HistoryPoint[] = [];
   const startValueSeed = tokenAddress.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
   let currentValue = 50 + (startValueSeed % 100);
   const timeStep = (endDate.getTime() - startDate.getTime()) / numPoints;

   for (let i = 0; i < numPoints; i++) {
      const date = new Date(startDate.getTime() + i * timeStep);
      const change = (Math.random() - 0.48) * (currentValue * 0.05);
      currentValue += change;
      currentValue = Math.max(1, currentValue);
      data.push({
         date: date.toISOString().split("T")[0],
         value: Math.round(currentValue * 100) / 100,
      });
   }
   return data;
};

export const getUserReward = async (vaultAddress: string, userAddress: string) => {
   if (isEmpty(vaultAddress) || isEmpty(userAddress)) return 0;

   const [[rewards], [decimals]] = await Promise.all([
      readContract({
         address: vaultAddress,
         abi: basicVaultAbi,
         functionName: "getClaimableReward",
         args: [userAddress, USDC_ADDRESS],
      }),
      getTokenDecimals(USDC_ADDRESS),
   ]);

   if (!rewards || !decimals) return 0;

   const formattedRewards = Number(ethers.formatUnits(rewards, decimals));

   return formattedRewards;
};
