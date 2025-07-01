import { useEvmAddress } from "@buidlerlabs/hashgraph-react-wallets";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { basicVaultAbi } from "@/services/contracts/abi/basicVaultAbi";
import { reduce } from "lodash";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import { getTokenDecimals, getTokenName, getTokenSymbol } from "@/services/erc20Service";
import { UserClaimedReward } from "../types";

export const useUserClaimedRewards = (vaultAddress: string | undefined) => {
   const [claimedRewards, setClaimedRewards] = useState<UserClaimedReward[]>([]);
   const { data: evmAddress } = useEvmAddress();

   useEffect(() => {
      const unsubscribe = watchContractEvent({
         address: vaultAddress as `0x${string}`,
         abi: basicVaultAbi,
         eventName: "RewardClaimed",
         onLogs: async (rewards) => {
            const userRewards = reduce(
               rewards,
               (acc: Array<{ tokenAddress: string; amount: bigint }>, log) => {
                  const tokenAddress = (log as unknown as { args: any[] }).args[0];
                  const owner = (log as unknown as { args: any[] }).args[1];
                  const amount = (log as unknown as { args: any[] }).args[2];

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
