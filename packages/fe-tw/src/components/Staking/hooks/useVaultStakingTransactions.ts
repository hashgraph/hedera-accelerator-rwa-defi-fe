import { useMutation } from "@tanstack/react-query";
import { tokenAbi } from "@/services/contracts/abi/tokenAbi";
import { basicVaultAbi } from "@/services/contracts/abi/basicVaultAbi";
import { ContractId } from "@hashgraph/sdk";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { useAccount } from "wagmi";
import useWriteContract from "@/hooks/useWriteContract";
import { executeTransaction } from "@/hooks/useExecuteTransaction";

export const useVaultStakingTransactions = (
   tokenAddress: `0x${string}` | undefined,
   vaultAddress: `0x${string}` | undefined,
) => {
   const { decimals: tokenDecimals } = useTokenInfo(tokenAddress as `0x${string}`);
   const { writeContract } = useWriteContract();
   const { address: evmAddress } = useAccount();

   const parseAmount = (amount: number) => {
      if (!tokenDecimals) throw new Error("Token decimals not available");
      return BigInt(Math.floor(amount * 10 ** tokenDecimals));
   };

   const stake = useMutation({
      mutationFn: async ({ amount }: { amount: number }) => {
         if (!tokenAddress || !vaultAddress || !evmAddress) {
            throw new Error("Required addresses not available");
         }

         const bigIntAmount = parseAmount(amount);

         const approveTx = await executeTransaction(() =>
            writeContract({
               address: tokenAddress,
               abi: tokenAbi,
               functionName: "approve",
               args: [vaultAddress, bigIntAmount],
            }),
         );

         const depositTx = await executeTransaction(() =>
            writeContract({
               address: vaultAddress,
               abi: basicVaultAbi,
               functionName: "deposit",
               args: [bigIntAmount, evmAddress],
            }),
         );

         return { approveTx, depositTx };
      },
   });

   const unstake = useMutation({
      mutationFn: async ({ amount }: { amount: number }) => {
         if (!vaultAddress || !evmAddress) {
            throw new Error("Required addresses not available");
         }

         const bigIntAmount = parseAmount(amount);

         return await executeTransaction(() =>
            writeContract({
               address: vaultAddress,
               abi: basicVaultAbi,
               functionName: "withdraw",
               args: [bigIntAmount, evmAddress, evmAddress],
            }),
         );
      },
   });

   const claim = useMutation({
      mutationFn: async () => {
         if (!vaultAddress || !evmAddress) {
            throw new Error("Required addresses not available");
         }

         return await executeTransaction(() =>
            writeContract({
               address: vaultAddress,
               abi: basicVaultAbi,
               functionName: "claimAllReward",
               args: [0, evmAddress],
            }),
         );
      },
   });

   return {
      stake: stake.mutateAsync,
      unstake: unstake.mutateAsync,
      claim: claim.mutateAsync,
      isDepositing: stake.isPending,
      isWithdrawing: unstake.isPending,
      isClaiming: claim.isPending,
   };
};
