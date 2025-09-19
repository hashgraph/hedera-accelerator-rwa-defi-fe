import { useMutation, useQuery } from "@tanstack/react-query";
import { tokenAbi } from "@/services/contracts/abi/tokenAbi";
import { executeTransaction } from "@/hooks/useExecuteTransaction";
import useWriteContract from "@/hooks/useWriteContract";
import { BigNumberish, ethers } from "ethers";
import { autoCompounderAbi } from "@/services/contracts/abi/autoCompounderAbi";
import { useAccount } from "wagmi";
import { config } from "@/config";
import { readContract } from "wagmi/actions";

export const useAutoCompounder = (
   autoCompounderAddress: `0x${string}` | undefined,
   tokenAddress: `0x${string}` | undefined,
   tokenDecimals: number | undefined,
) => {
   const { address: evmAddress } = useAccount();
   const { writeContract } = useWriteContract();

   const { data: aTokenInfo, refetch } = useQuery({
      queryKey: ["A_TOKENS", autoCompounderAddress, evmAddress],
      queryFn: async () => {
         const [totalSupply, balanceOfAToken, decimals, exchangeRate] = await Promise.all([
            readContract(config, {
               address: autoCompounderAddress as `0x${string}`,
               abi: autoCompounderAbi,
               functionName: "totalSupply",
            }),
            readContract(config, {
               address: autoCompounderAddress as `0x${string}`,
               abi: autoCompounderAbi,
               functionName: "balanceOf",
               args: [evmAddress!],
            }),
            readContract(config, {
               address: autoCompounderAddress as `0x${string}`,
               abi: autoCompounderAbi,
               functionName: "decimals",
            }),
            readContract(config, {
               address: autoCompounderAddress as `0x${string}`,
               abi: autoCompounderAbi,
               functionName: "exchangeRate",
            }),
         ]);

         const aTokenBalance = Number(
            ethers.formatUnits(balanceOfAToken as BigNumberish, decimals),
         );
         const totalSupplyFormatted = Number(
            ethers.formatUnits(totalSupply as BigNumberish, decimals),
         );
         const exchangeRateFormatted = Number(ethers.formatUnits(exchangeRate as BigNumberish, 18));

         return { totalSupplyFormatted, aTokenBalance, exchangeRate: exchangeRateFormatted };
      },
      enabled: Boolean(autoCompounderAddress) && Boolean(evmAddress),
   });

   const { mutateAsync: unstakeAutoCompound, isPending: isWithdrawing } = useMutation({
      mutationFn: async ({ amount }: { amount: number }) => {
         if (!autoCompounderAddress || !evmAddress || !tokenDecimals) {
            throw new Error("Required addresses or token decimals not available");
         }
         const bigIntAmount = ethers.parseUnits(String(amount), tokenDecimals || 18);
         return executeTransaction(() =>
            writeContract({
               address: autoCompounderAddress,
               abi: autoCompounderAbi,
               functionName: "withdraw",
               args: [bigIntAmount, evmAddress],
            }),
         );
      },
   });

   const { mutateAsync: stakeAutoCompound, isPending: isDepositing } = useMutation({
      mutationFn: async ({ amount }: { amount: number }) => {
         if (!autoCompounderAddress || !tokenAddress || !evmAddress || !tokenDecimals) {
            throw new Error("Required addresses or token decimals not available");
         }

         const bigIntAmount = ethers.parseUnits(String(amount), tokenDecimals || 18);

         const approveTx = await executeTransaction(() =>
            writeContract({
               address: tokenAddress,
               abi: tokenAbi,
               functionName: "approve",
               args: [autoCompounderAddress, bigIntAmount],
            }),
         );

         const depositTx = await executeTransaction(() =>
            writeContract({
               address: autoCompounderAddress,
               abi: autoCompounderAbi,
               functionName: "deposit",
               args: [bigIntAmount, evmAddress],
            }),
         );

         return { approveTx, depositTx };
      },
   });

   const { mutateAsync: claimAutoCompounder, isPending: isClaiming } = useMutation({
      mutationFn: async () => {
         if (!autoCompounderAddress || !evmAddress) {
            throw new Error("Required addresses not available");
         }

         return await executeTransaction(() =>
            writeContract({
               address: autoCompounderAddress,
               abi: autoCompounderAbi,
               functionName: "claim",
               args: [],
            }),
         );
      },
   });

   const {
      mutateAsync: claimAutoCompounderUserRewards,
      isPending: isClaimAutoCompounderUserRewards,
   } = useMutation({
      mutationFn: async () => {
         if (!autoCompounderAddress || !evmAddress) {
            throw new Error("Required addresses not available");
         }

         return await executeTransaction(() =>
            writeContract({
               address: autoCompounderAddress,
               abi: autoCompounderAbi,
               functionName: "claimExactUserReward",
               args: [evmAddress],
            }),
         );
      },
   });

   return {
      stake: stakeAutoCompound,
      unstake: unstakeAutoCompound,
      claim: claimAutoCompounder,
      claimUserRewards: claimAutoCompounderUserRewards,
      isDepositing,
      isWithdrawing,
      isClaiming: isClaiming,
      isClaimingUserRewards: isClaimAutoCompounderUserRewards,
      aTokenTotalSupply: aTokenInfo?.totalSupplyFormatted,
      aTokenBalance: aTokenInfo?.aTokenBalance,
      aTokenExchangeRate: aTokenInfo?.exchangeRate,
      refetch,
   };
};
