import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { basicVaultAbi } from "@/services/contracts/abi/basicVaultAbi";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { useEffect } from "react";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import { autoCompounderAbi } from "@/services/contracts/abi/autoCompounderAbi";
import { useAccount } from "wagmi";
import { config } from "@/config";
import { readContract } from "wagmi/actions";

export const useUserRewards = (
   vaultAddress: string | undefined,
   rewardTokenAddress: string | undefined,
   autoCompounderAddress: string | undefined,
) => {
   const { address: evmAddress } = useAccount();
   const { decimals: rewardsDecimals } = useTokenInfo(rewardTokenAddress as `0x${string}`);

   const autoCompounderQuery = useQuery({
      queryKey: [
         "AUTO_COMPOUNDER_REWARDS",
         rewardTokenAddress,
         autoCompounderAddress,
         vaultAddress,
      ],
      queryFn: async () => {
         const rewards = await readContract(config, {
            address: autoCompounderAddress as `0x${string}`,
            abi: autoCompounderAbi,
            functionName: "getPendingReward",
            args: [evmAddress!],
         });

         return Number(ethers.formatUnits(BigInt(rewards), 6));
      },
      enabled:
         Boolean(vaultAddress) &&
         Boolean(rewardTokenAddress) &&
         Boolean(autoCompounderAddress) &&
         Boolean(rewardsDecimals),
   });

   const vaultQuery = useQuery({
      queryKey: ["VAULT_USER_REWARDS", evmAddress, rewardTokenAddress, vaultAddress],
      queryFn: async () => {
         if (!vaultAddress || !rewardTokenAddress || !evmAddress || !rewardsDecimals) return 0;

         const rewards = await readContract(config, {
            address: vaultAddress as `0x${string}`,
            abi: basicVaultAbi,
            functionName: "getAllRewards",
            args: [evmAddress],
         });

         return Number(ethers.formatUnits(BigInt(rewards[0]), 6));
      },
      enabled:
         Boolean(vaultAddress) &&
         Boolean(rewardTokenAddress) &&
         Boolean(evmAddress) &&
         Boolean(rewardsDecimals),
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
