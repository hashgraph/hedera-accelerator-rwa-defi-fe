import { useEvmAddress } from "@buidlerlabs/hashgraph-react-wallets";
import { useMutation } from "@tanstack/react-query";
import { tokenAbi } from "@/services/contracts/abi/tokenAbi";
import { basicVaultAbi } from "@/services/contracts/abi/basicVaultAbi";
import { ContractId } from "@hashgraph/sdk";
import { useExecuteTransaction } from "@/hooks/useExecuteTransaction";
import useWriteContract from "@/hooks/useWriteContract";
import { useTokenInfo } from "@/hooks/useTokenInfo";

export const useVaultStakingTransactions = (
   tokenAddress: string | undefined,
   vaultAddress: string | undefined,
) => {
   const { decimals: tokenDecimals } = useTokenInfo(tokenAddress as `0x${string}`);
   const { writeContract } = useWriteContract();
   const { executeTransaction } = useExecuteTransaction();
   const { data: evmAddress } = useEvmAddress();

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
               contractId: ContractId.fromEvmAddress(0, 0, tokenAddress),
               abi: tokenAbi,
               functionName: "approve",
               args: [vaultAddress, bigIntAmount],
            }),
         );

         const depositTx = await executeTransaction(() =>
            writeContract({
               contractId: ContractId.fromEvmAddress(0, 0, vaultAddress),
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
               contractId: ContractId.fromEvmAddress(0, 0, vaultAddress),
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
               contractId: ContractId.fromEvmAddress(0, 0, vaultAddress),
               abi: basicVaultAbi,
               functionName: "claimAllRewards",
               args: [],
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
