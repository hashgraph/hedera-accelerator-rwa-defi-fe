"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useBuildingInfo } from "@/hooks/useBuildingInfo";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import useWriteContract from "@/hooks/useWriteContract";
import { useExecuteTransaction } from "@/hooks/useExecuteTransaction";
import { modularComplianceAbi } from "@/services/contracts/abi/modularComplianceAbi";
import { COMPLIANCE_MODULE_ADDRESSES } from "@/services/contracts/addresses";
import { ContractId } from "@hashgraph/sdk";
import { countryAllowModuleAbi } from "@/services/contracts/abi/countryAllowModuleAbi";
import countries from "i18n-iso-countries";
import englishLocale from "i18n-iso-countries/langs/en.json";
import { useReadContract } from "@buidlerlabs/hashgraph-react-wallets";

countries.registerLocale(englishLocale);

type CountryModuleHookParams = {
   buildingId: string;
   buildingAddress: `0x${string}`;
};

export const useCountryModule = ({ buildingId, buildingAddress }: CountryModuleHookParams) => {
   const { writeContract } = useWriteContract();
   const { tokenAddress } = useBuildingInfo(buildingAddress);
   const { complianceAddress } = useTokenInfo(tokenAddress);
   const { executeTransaction } = useExecuteTransaction();
   const { readContract } = useReadContract();

   const { data: allowedCountries = [], refetch: refetchAllowedCountries } = useQuery({
      queryKey: ["allowedCountries", complianceAddress],
      queryFn: async () => {
         const result = await readContract({
            address: COMPLIANCE_MODULE_ADDRESSES.COUNTRY_ALLOW_MODULE,
            abi: countryAllowModuleAbi,
            functionName: "getAllowedCountries",
            args: [complianceAddress],
         });
         return result as number[];
      },
      enabled: !!complianceAddress,
   });

   const addCountriesMutation = useMutation({
      mutationFn: async ({ countries: countryCodes }: { countries: number[] }) => {
         const callData = new ethers.Interface(countryAllowModuleAbi).encodeFunctionData(
            "batchAllowCountries",
            [countryCodes],
         );

         const callModuleFunctionTx = await executeTransaction(() =>
            writeContract({
               contractId: ContractId.fromEvmAddress(0, 0, complianceAddress),
               abi: modularComplianceAbi,
               functionName: "callModuleFunction",
               args: [callData, COMPLIANCE_MODULE_ADDRESSES.COUNTRY_ALLOW_MODULE],
            }),
         );

         return callModuleFunctionTx;
      },
      onSuccess: () => refetchAllowedCountries(),
   });

   const removeCountriesMutation = useMutation({
      mutationFn: async ({ countries: countryCodes }: { countries: number[] }) => {
         const callData = new ethers.Interface(countryAllowModuleAbi).encodeFunctionData(
            "batchDisallowCountries",
            [countryCodes],
         );

         const callModuleFunctionTx = await executeTransaction(() =>
            writeContract({
               contractId: ContractId.fromEvmAddress(0, 0, complianceAddress),
               abi: modularComplianceAbi,
               functionName: "callModuleFunction",
               args: [callData, COMPLIANCE_MODULE_ADDRESSES.COUNTRY_ALLOW_MODULE],
            }),
         );

         return callModuleFunctionTx;
      },
      onSuccess: () => refetchAllowedCountries(),
   });

   return {
      isPending: addCountriesMutation.isPending || removeCountriesMutation.isPending,
      allowedCountries,
      allowCountries: addCountriesMutation.mutateAsync,
      disallowCountries: removeCountriesMutation.mutateAsync,
   };
};
