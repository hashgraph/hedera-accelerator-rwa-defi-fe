"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useBuildingInfo } from "@/hooks/useBuildingInfo";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { executeTransaction } from "@/hooks/useExecuteTransaction";
import { modularComplianceAbi } from "@/services/contracts/abi/modularComplianceAbi";
import useWriteContract from "@/hooks/useWriteContract";
import { readContract } from "wagmi/actions";
import { config } from "@/config";

type ComplianceHookParams = {
   buildingId: string;
   buildingAddress: `0x${string}`;
   moduleAddress: `0x${string}`;
};

export const useCompliance = ({ buildingAddress, moduleAddress }: ComplianceHookParams) => {
   const { writeContract } = useWriteContract();
   const { tokenAddress } = useBuildingInfo(buildingAddress);
   const { complianceAddress } = useTokenInfo(tokenAddress);

   const { data: modules = [], refetch: refetchModules } = useQuery({
      queryKey: ["getModules", complianceAddress],
      queryFn: async () => {
         const result = (await readContract(config, {
            address: complianceAddress!,
            abi: modularComplianceAbi,
            functionName: "getModules",
         })) as string[];
         return result;
      },
      enabled: !!complianceAddress,
   });

   const isModuleAdded = modules.includes(moduleAddress);

   const { mutateAsync: addModule, isPending: isAddingModule } = useMutation({
      mutationFn: async () => {
         const addModuleTX = await executeTransaction(() =>
            writeContract({
               address: complianceAddress!,
               abi: modularComplianceAbi,
               functionName: "addModule",
               args: [moduleAddress],
            }),
         );
         return addModuleTX;
      },
      onSuccess: () => refetchModules(),
   });

   const { mutateAsync: removeModule, isPending: isRemovingModule } = useMutation({
      mutationFn: async () => {
         const removeModuleTX = await executeTransaction(() =>
            writeContract({
               address: complianceAddress!,
               abi: modularComplianceAbi,
               functionName: "removeModule",
               args: [moduleAddress],
            }),
         );
         return removeModuleTX;
      },
      onSuccess: () => refetchModules(),
   });

   return {
      addModule,
      removeModule,
      isModuleAdded,
      isModuleLoading: isAddingModule || isRemovingModule,
   };
};
