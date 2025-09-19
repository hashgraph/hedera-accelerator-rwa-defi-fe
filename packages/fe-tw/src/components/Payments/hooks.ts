import { useQuery, useMutation } from "@tanstack/react-query";
import { BigNumberish, ethers } from "ethers";
import { ContractId } from "@hashgraph/sdk";
import { useEffect, useState } from "react";
import { buildingTreasuryAbi } from "@/services/contracts/abi/buildingTreasuryAbi";
import { tokenAbi } from "@/services/contracts/abi/tokenAbi";
import { StorageKeys, storageService } from "@/services/storageService";
import { orderBy } from "lodash";
import { useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { config } from "@/config";
import { executeTransaction } from "@/hooks/useExecuteTransaction";

export const useTreasuryData = (
   treasuryAddress: `0x${string}` | undefined,
   buildingId?: string,
) => {
   const { writeContractAsync: writeContract } = useWriteContract();
   const [payments, setPayments] = useState<any[]>([]);

   useEffect(() => {
      if (buildingId) {
         loadPaymentsFromStorage();
      }
   }, [buildingId]);

   const loadPaymentsFromStorage = async () => {
      if (!buildingId) return;

      const storedPayments = await storageService.restoreItem<any[]>(StorageKeys.Payments);
      if (storedPayments?.length) {
         const buildingPayments = storedPayments.filter(
            (payment) => payment.buildingId === buildingId,
         );
         setPayments(orderBy(buildingPayments, "dateCreated", ["desc"]));
      } else {
         setPayments([]);
      }
   };

   const { data, refetch } = useQuery({
      queryKey: ["treasuryData", treasuryAddress],
      queryFn: async () => {
         if (!treasuryAddress) return null;
         const [treasuryUsdcAddress, reserve] = await Promise.all([
            readContract(config, {
               address: treasuryAddress as `0x${string}`,
               abi: buildingTreasuryAbi,
               functionName: "usdc",
            }),
            readContract(config, {
               address: treasuryAddress as `0x${string}`,
               abi: buildingTreasuryAbi,
               functionName: "reserve",
            }),
         ]);

         if (!treasuryUsdcAddress) return null;

         const [balance, decimals] = await Promise.all([
            readContract(config, {
               address: treasuryUsdcAddress as `0x${string}`,
               abi: tokenAbi,
               functionName: "balanceOf",
               args: [treasuryAddress],
            }),
            readContract(config, {
               address: treasuryUsdcAddress as `0x${string}`,
               abi: tokenAbi,
               functionName: "decimals",
            }),
         ]);

         const formatted = Number(ethers.formatUnits(balance as BigNumberish, decimals));
         const reserveFormatted = Number(ethers.formatUnits(reserve as BigNumberish, decimals));

         return {
            balance: formatted,
            reserve: reserveFormatted,
            usdcAddress: treasuryUsdcAddress,
            decimals,
         };
      },
      enabled: Boolean(treasuryAddress),
   });

   const { mutateAsync: handleAddPayment, isPending } = useMutation({
      mutationFn: async (amount: string) => {
         if (!treasuryAddress) {
            throw new Error("Treasury address not found");
         }
         if (!data?.decimals || !data?.usdcAddress) {
            throw new Error("Treasury data (decimals or USDC address) not loaded yet.");
         }

         const bigIntAmount = ethers.parseUnits(amount.toString(), data.decimals);

         const approveTx = await executeTransaction(() =>
            writeContract({
               address: data.usdcAddress,
               abi: tokenAbi,
               functionName: "approve",
               args: [treasuryAddress as `0x${string}`, bigIntAmount],
            }),
         );

         const depositTx = await executeTransaction(() =>
            writeContract({
               address: treasuryAddress,
               abi: buildingTreasuryAbi,
               functionName: "deposit",
               args: [bigIntAmount],
            }),
         );

         return { approveTx, depositTx };
      },
      onSuccess: () => refetch(),
   });

   return {
      data: data?.balance,
      usdcAddress: data?.usdcAddress,
      decimals: data?.decimals,
      reserve: data?.reserve,
      payments,
      isSubmittingPayment: isPending,
      handleAddPayment,
      refreshPayments: loadPaymentsFromStorage,
   };
};
