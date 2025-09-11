"use client";

import { useEffect, useState } from "react";
import { useEvmAddress } from "@buidlerlabs/hashgraph-react-wallets";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useWriteContract from "@/hooks/useWriteContract";
import { useExecuteTransaction } from "@/hooks/useExecuteTransaction";
import { useReadContract } from "@buidlerlabs/hashgraph-react-wallets";
import { buildingFactoryAbi } from "@/services/contracts/abi/buildingFactoryAbi";
import { BUILDING_FACTORY_ADDRESS } from "@/services/contracts/addresses";
import { ContractId } from "@hashgraph/sdk";
import { ethers } from "ethers";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import { find, isEmpty, toLower } from "lodash";
import { TransactionExtended } from "@/types/common";

export interface IdentityData {
   isDeployed: boolean;
   isIdentityRegistered: boolean;
   isLoading: boolean;
   isFetched: boolean;
}

export const useIdentity = (buildingAddress?: string) => {
   const { data: evmAddress } = useEvmAddress();
   const { writeContract } = useWriteContract();
   const { executeTransaction } = useExecuteTransaction();
   const { readContract } = useReadContract();
   const queryClient = useQueryClient();
   const [isIdentityRegistered, setIsIdentityRegistered] = useState<boolean>(false);

   useEffect(() => {
      if (!buildingAddress || !evmAddress) return;
      const unwatch = watchContractEvent({
         address: BUILDING_FACTORY_ADDRESS,
         abi: buildingFactoryAbi,
         eventName: "IdentityRegistered",
         onLogs: (logs) => {
            const registerEventForCurrentBuilding = find(
               logs,
               (log) =>
                  toLower(log.args?.[0]) === toLower(buildingAddress) &&
                  toLower(log.args?.[1]) === toLower(evmAddress),
            );

            setIsIdentityRegistered((prev) => prev || !isEmpty(registerEventForCurrentBuilding));
         },
      });
      return () => unwatch();
   }, [buildingAddress, evmAddress]);

   const {
      data: isIdentityDeployed,
      isLoading: isQueryingIdentity,
      isFetched,
   } = useQuery({
      queryKey: ["identity", evmAddress],
      queryFn: async () => {
         const data = await readContract({
            address: BUILDING_FACTORY_ADDRESS,
            abi: buildingFactoryAbi,
            functionName: "getIdentity",
            args: [evmAddress],
         });

         return data !== ethers.ZeroAddress;
      },
      enabled: Boolean(evmAddress),
   });

   const identityData: IdentityData = {
      isDeployed: Boolean(isIdentityDeployed),
      isIdentityRegistered,
      isLoading: isQueryingIdentity,
      isFetched,
   };

   const deployIdentityMutation = useMutation({
      mutationFn: async (walletAddress: string) => {
         const tx = (await executeTransaction(() =>
            writeContract({
               contractId: ContractId.fromEvmAddress(0, 0, BUILDING_FACTORY_ADDRESS),
               abi: buildingFactoryAbi,
               functionName: "deployIdentityForWallet",
               args: [walletAddress],
            }),
         )) as TransactionExtended;

         return tx;
      },
      onSuccess: (data) => {
         queryClient.invalidateQueries({ queryKey: ["identity", evmAddress] });
      },
   });

   const registerIdentityMutation = useMutation({
      mutationFn: async ({
         buildingAddress,
         country,
      }: {
         buildingAddress: string;
         country: number;
      }) => {
         const tx = (await executeTransaction(() =>
            writeContract({
               contractId: ContractId.fromEvmAddress(0, 0, BUILDING_FACTORY_ADDRESS),
               abi: buildingFactoryAbi,
               functionName: "registerIdentity",
               args: [buildingAddress, evmAddress, country],
            }),
         )) as TransactionExtended;

         return tx;
      },
      onSuccess: (data) => {
         queryClient.invalidateQueries({ queryKey: ["identity", evmAddress] });
      },
   });

   const deployIdentity = async (walletAddress: string): Promise<TransactionExtended> => {
      return deployIdentityMutation.mutateAsync(walletAddress);
   };

   const registerIdentity = async (buildingAddress: string, country: number) => {
      return registerIdentityMutation.mutateAsync({ buildingAddress, country });
   };

   return {
      identityData,
      deployIdentity,
      registerIdentity,
      isLoading:
         deployIdentityMutation.isPending ||
         registerIdentityMutation.isPending ||
         isQueryingIdentity,
      isError: deployIdentityMutation.isError || registerIdentityMutation.isError,
      error: deployIdentityMutation.error || registerIdentityMutation.error,
      isDeploying: deployIdentityMutation.isPending,
      isRegistering: registerIdentityMutation.isPending,
   };
};
