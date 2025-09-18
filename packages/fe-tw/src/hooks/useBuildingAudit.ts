"use client";

import type { AuditData } from "@/consts/audit";
import {
   getAuditRecordDetails,
   getAuditRecordIdsForBuilding,
} from "@/services/auditRegistryService";
import { fetchJsonFromIpfs } from "@/services/ipfsService";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import { useMutation, useQuery } from "@tanstack/react-query";
import useWriteContract from "@/hooks/useWriteContract";
import { executeTransaction } from "./useExecuteTransaction";
import { auditRegistryAbi } from "@/services/contracts/abi/auditRegistryAbi";
import { useEffect, useState } from "react";
import { useBuildingInfo } from "./useBuildingInfo";
import { prepareStorageIPFSfileURL } from "@/utils/helpers";
import { ethers } from "ethers";
import { map } from "lodash";
import { AuditFormValues } from "@/components/Audit/auditManagement/helpers";
import { config } from "@/config";
import { useAccount } from "wagmi";
import { readContract } from "wagmi/actions";

export function useBuildingAudit(buildingAddress: `0x${string}`) {
   const { writeContract } = useWriteContract();
   const [revokedRecords, setRevokedRecords] = useState<any[]>([]);
   const { address: evmAddress } = useAccount();
   const { auditRegistryAddress, isLoading } = useBuildingInfo(buildingAddress);

   const getNonRevokedRecord = (recordsData: bigint[]) => {
      let _recordId;

      for (let i = 0; i < recordsData.length; i++) {
         if (!revokedRecords.includes(recordsData[i])) {
            _recordId = recordsData[i];
         }
      }

      return _recordId;
   };

   useEffect(() => {
      const unsubscribe = watchContractEvent({
         address: auditRegistryAddress,
         abi: auditRegistryAbi,
         eventName: "AuditRecordRevoked",
         onLogs: (data) => {
            setRevokedRecords(
               data.map((log) => ({
                  recordId: log.args[0],
               })),
            );
         },
      });

      return () => {
         unsubscribe();
      };
   }, []);

   const { data: auditRecords, isLoading: auditRecordsLoading } = useQuery({
      queryKey: ["auditRecords", buildingAddress, auditRegistryAddress],
      queryFn: async () => {
         if (!buildingAddress || !auditRegistryAddress) {
         }

         const result = (await readContract(config, {
            address: auditRegistryAddress!,
            abi: auditRegistryAbi,
            functionName: "getAuditRecordsByBuilding",
            args: [buildingAddress],
         })) as bigint[];

         const recordDetails = await Promise.all(
            map(result, async (recordId: bigint) => {
               const details = await readContract(config, {
                  address: auditRegistryAddress!,
                  abi: auditRegistryAbi,
                  functionName: "getAuditRecordDetails",
                  args: [recordId],
               });

               let ipfsInfo = (await fetchJsonFromIpfs(details.ipfsHash)) as AuditFormValues;

               return {
                  recordId: String(recordId),
                  ...details!,
                  ...ipfsInfo,
                  auditReportIpfsUrl: ipfsInfo.auditReportIpfsId
                     ? prepareStorageIPFSfileURL(ipfsInfo.auditReportIpfsId)
                     : undefined,
               };
            }),
         );

         return recordDetails;
      },
      enabled: Boolean(buildingAddress) && Boolean(auditRegistryAddress),
   });

   const { data: userRoles, isLoading: userRolesLoading } = useQuery<{
      isAdminRole: boolean;
      isAuditorRole: boolean;
   } | null>({
      queryKey: ["userRole", `userRole_${buildingAddress}`],
      queryFn: async () => {
         const adminRole = await readContract(config, {
            address: auditRegistryAddress,
            abi: auditRegistryAbi,
            functionName: "DEFAULT_ADMIN_ROLE",
         });
         const auditorRole = await readContract(config, {
            address: auditRegistryAddress,
            abi: auditRegistryAbi,
            functionName: "AUDITOR_ROLE",
         });
         const isAuditorRole = (await readContract(config, {
            address: auditRegistryAddress,
            abi: auditRegistryAbi,
            functionName: "hasRole",
            args: [auditorRole, evmAddress!],
         })) as boolean;
         const isAdminRole = (await readContract(config, {
            address: auditRegistryAddress,
            abi: auditRegistryAbi,
            functionName: "hasRole",
            args: [adminRole, evmAddress!],
         })) as boolean;

         return { isAdminRole, isAuditorRole };
      },
      enabled: Boolean(buildingAddress) && Boolean(evmAddress) && Boolean(auditRegistryAddress),
   });

   const { data: auditors } = useQuery<`0x${string}`[] | null>({
      queryKey: ["auditors", buildingAddress, auditRegistryAddress],
      queryFn: async () => {
         const auditorsList = await readContract(config, {
            address: auditRegistryAddress,
            abi: auditRegistryAbi,
            functionName: "getAuditors",
         });
         return auditorsList as `0x${string}`[] | null;
      },
      enabled: Boolean(buildingAddress) && Boolean(auditRegistryAddress),
      gcTime: 10 * 60 * 1000,
   });

   const { data: auditData, isLoading: auditDataLoading } = useQuery<{
      data: AuditData;
      recordId: bigint;
   } | null>({
      queryKey: ["auditData", `auditData_${buildingAddress}`],
      queryFn: async () => {
         const recordIds = await getAuditRecordIdsForBuilding(buildingAddress);

         if (!recordIds[0]?.[0]) {
            return null;
         }

         const recordId = getNonRevokedRecord(recordIds[0]);
         const record = await getAuditRecordDetails(recordId!);
         const ipfsHash = record[0][4];

         if (!ipfsHash) {
            return null;
         }

         const auditJson = (await fetchJsonFromIpfs(ipfsHash as unknown as string)) as AuditData;

         return { data: auditJson, recordId: recordId! };
      },
      enabled: !!buildingAddress,
   });

   const addAuditRecordMutation = useMutation({
      mutationFn: async (auditIPFSHash: string) => {
         const addAuditRecordResult = await executeTransaction(() =>
            writeContract({
               address: auditRegistryAddress,
               abi: auditRegistryAbi,
               functionName: "addAuditRecord",
               args: [buildingAddress, auditIPFSHash],
            }),
         );

         return addAuditRecordResult;
      },
   });

   const updateAuditRecordMutation = useMutation({
      mutationFn: async ({
         auditRecordId,
         newAuditIPFSHash,
      }: {
         auditRecordId: bigint;
         newAuditIPFSHash: string;
      }) => {
         const updateAuditRecordResult = await executeTransaction(() =>
            writeContract({
               address: auditRegistryAddress,
               abi: auditRegistryAbi,
               functionName: "updateAuditRecord",
               args: [auditRecordId, newAuditIPFSHash],
            }),
         );

         return updateAuditRecordResult;
      },
   });

   const revokeAuditRecord = useMutation({
      mutationFn: async ({ auditRecordId }: { auditRecordId: bigint }) => {
         const revokeAuditRecordResult = await executeTransaction(() =>
            writeContract({
               address: auditRegistryAddress,
               abi: auditRegistryAbi,
               functionName: "revokeAuditRecord",
               args: [auditRecordId],
            }),
         );

         return revokeAuditRecordResult;
      },
   });

   return {
      auditors,
      auditData,
      isLoadingBuildingDetails: isLoading,
      buildingDetailsLoaded:
         Boolean(auditRegistryAddress) && auditRegistryAddress !== ethers.ZeroAddress,
      auditDataLoading,
      auditRecords,
      auditRecordsLoading,
      addAuditRecordMutation,
      updateAuditRecordMutation,
      revokeAuditRecord,
      userRoles,
      userRolesLoading,
   };
}
