import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { basicVaultAbi } from "@/services/contracts/abi/basicVaultAbi";
import { reduce } from "lodash";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import { getTokenDecimals, getTokenName, getTokenSymbol } from "@/services/erc20Service";
import { UserClaimedReward } from "../types";
import { useAccount } from "wagmi";

export const useUserClaimedRewards = (vaultAddress: string | undefined) => {
   const [claimedRewards, setClaimedRewards] = useState<UserClaimedReward[]>([]);
   const { address: evmAddress } = useAccount();

   useEffect(() => {
      const unsubscribe = watchContractEvent({
         address: vaultAddress as `0x${string}`,
         abi: basicVaultAbi,
         eventName: "RewardClaimed",
         onLogs: async (rewards) => {
            const userRewards = reduce(
               rewards,
               (acc: Array<{ tokenAddress: string; amount: bigint }>, log) => {
                  const tokenAddress = log.args[0];
                  const owner = log.args[1];
                  const amount = log.args[2];

                  if (owner.toLowerCase() === evmAddress?.toLowerCase() && amount > BigInt(1)) {
                     acc.push({
                        tokenAddress,
                        amount,
                     });
                  }
                  return acc;
               },
               [],
            );

            const rewardWithTokensInfo: UserClaimedReward[] = await Promise.all(
               userRewards.map(async ({ tokenAddress, ...rest }) => {
                  const tokenName = await getTokenName(tokenAddress as `0x${string}`);
                  const tokenSymbol = await getTokenSymbol(tokenAddress as `0x${string}`);
                  const tokenDecimals = await getTokenDecimals(tokenAddress as `0x${string}`);

                  return {
                     ...rest,
                     tokenAddress,
                     amount: ethers.formatUnits(rest.amount, tokenDecimals[0]),
                     name: tokenName[0],
                     symbol: tokenSymbol[0],
                     decimals: Number(tokenDecimals[0]),
                  };
               }),
            );

            setClaimedRewards((prev) => [...prev, ...rewardWithTokensInfo]);
         },
      });
      return () => {
         if (unsubscribe) {
            unsubscribe();
         }
      };
   }, [vaultAddress, evmAddress]);

   return claimedRewards;
};
