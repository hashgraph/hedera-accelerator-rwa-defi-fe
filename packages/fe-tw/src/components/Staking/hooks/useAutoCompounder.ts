import { useEvmAddress, useReadContract } from "@buidlerlabs/hashgraph-react-wallets";
import { useMutation, useQuery } from "@tanstack/react-query";
import { tokenAbi } from "@/services/contracts/abi/tokenAbi";
import { ContractId } from "@hashgraph/sdk";
import { useExecuteTransaction } from "@/hooks/useExecuteTransaction";
import useWriteContract from "@/hooks/useWriteContract";
import { BigNumberish, ethers } from "ethers";
import { autoCompounderAbi } from "@/services/contracts/abi/autoCompounderAbi";

export const useAutoCompounder = (
   autoCompounderAddress: string | undefined,
   tokenAddress: string | undefined,
   tokenDecimals: number | undefined,
) => {
   const { data: evmAddress } = useEvmAddress();
   const { executeTransaction } = useExecuteTransaction();
   const { writeContract } = useWriteContract();
   const { readContract } = useReadContract();

   const { data: aTokenInfo, refetch } = useQuery({
      queryKey: ["A_TOKENS", autoCompounderAddress, evmAddress],
      queryFn: async () => {
         const [totalSupply, balanceOfAToken, decimals, exchangeRate] = await Promise.all([
            readContract({
               address: autoCompounderAddress as `0x${string}`,
               abi: autoCompounderAbi,
               functionName: "totalSupply",
            }),
            readContract({
               address: autoCompounderAddress as `0x${string}`,
               abi: autoCompounderAbi,
               functionName: "balanceOf",
               args: [evmAddress],
            }),
            readContract({
               address: autoCompounderAddress as `0x${string}`,
               abi: autoCompounderAbi,
               functionName: "decimals",
            }),
            readContract({
               address: autoCompounderAddress as `0x${string}`,
               abi: autoCompounderAbi,
               functionName: "exchangeRate",
            }),
         ]);

         const aTokenBalance = Number(
            ethers.formatUnits(balanceOfAToken as BigNumberish, decimals as string),
         );
         const totalSupplyFormatted = Number(
            ethers.formatUnits(totalSupply as BigNumberish, decimals as string),
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
         return await executeTransaction(() =>
            writeContract({
               contractId: ContractId.fromEvmAddress(0, 0, autoCompounderAddress),
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
               contractId: ContractId.fromEvmAddress(0, 0, tokenAddress),
               abi: tokenAbi,
               functionName: "approve",
               args: [autoCompounderAddress, bigIntAmount],
            }),
         );

         const depositTx = await executeTransaction(() =>
            writeContract({
               contractId: ContractId.fromEvmAddress(0, 0, autoCompounderAddress),
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
               contractId: ContractId.fromEvmAddress(0, 0, autoCompounderAddress),
               abi: autoCompounderAbi,
               functionName: "autoCompound",
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
               contractId: ContractId.fromEvmAddress(0, 0, autoCompounderAddress),
               abi: autoCompounderAbi,
               functionName: "claimUserRewards",
               args: [],
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
