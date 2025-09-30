import { useEvmAddress, useReadContract } from "@buidlerlabs/hashgraph-react-wallets";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { basicVaultAbi } from "@/services/contracts/abi/basicVaultAbi";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { useEffect } from "react";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import { autoCompounderAbi } from "@/services/contracts/abi/autoCompounderAbi";
import { USDC_ADDRESS } from "@/services/contracts/addresses";
import { find, isEmpty, zipObject } from "lodash";

export const useUserRewards = (
   vaultAddress: string | undefined,
   autoCompounderAddress: string | undefined,
) => {
   const { readContract } = useReadContract();
   const { data: evmAddress } = useEvmAddress();

   const autoCompounderQuery = useQuery({
      queryKey: ["AUTO_COMPOUNDER_REWARDS", autoCompounderAddress, evmAddress],
      queryFn: async () => {
         const allRewards = (await readContract({
            address: autoCompounderAddress as `0x${string}`,
            abi: autoCompounderAbi,
            functionName: "getUserReward",
            args: [evmAddress],
         })) as [`0x${string}`[], bigint[]];

         const zippedRewards = zipObject(allRewards[0], allRewards[1]);

         return zippedRewards?.[USDC_ADDRESS]
            ? Number(ethers.formatUnits(zippedRewards[USDC_ADDRESS] as bigint, 6))
            : 0;
      },
      enabled: Boolean(evmAddress) && Boolean(autoCompounderAddress),
   });

   const vaultQuery = useQuery({
      queryKey: ["VAULT_USER_REWARDS", evmAddress, vaultAddress],
      queryFn: async () => {
         if (!vaultAddress || !evmAddress) return 0;

         const rewards = (await readContract({
            address: vaultAddress as `0x${string}`,
            abi: basicVaultAbi,
            functionName: "getClaimableReward",
            args: [evmAddress, USDC_ADDRESS],
         })) as bigint;

         return Number(ethers.formatUnits(rewards, 6));
      },
      enabled: Boolean(vaultAddress) && Boolean(evmAddress),
   });

   useEffect(() => {
      const rewardAddedEventUnsubscribe = watchContractEvent({
         address: vaultAddress as `0x${string}`,
         abi: basicVaultAbi,
         eventName: "RewardAdded",
         onLogs: (event) => {
            autoCompounderQuery.refetch();
            vaultQuery.refetch();
         },
      });
      return () => {
         rewardAddedEventUnsubscribe();
      };
   }, [vaultAddress]);

   return {
      vault: vaultQuery,
      autoCompounder: autoCompounderQuery,
   };
};
