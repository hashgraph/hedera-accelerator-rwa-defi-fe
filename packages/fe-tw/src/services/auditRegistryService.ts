import { WriteContractParams } from "@/hooks/useWriteContract";
import { auditRegistryAbi } from "@/services/contracts/abi/auditRegistryAbi";
import { AUDIT_REGISTRY_ADDRESS } from "@/services/contracts/addresses";
import { readContract } from "@/services/contracts/readContract";
import { ContractId, type TransactionReceipt } from "@hashgraph/sdk";

type WriteContractFn = (params: WriteContractParams) => Promise<string | TransactionReceipt | null>;

export async function getAuditRecordIdsForBuilding(buildingAddress: string): Promise<bigint[][]> {
   return (await readContract({
      address: AUDIT_REGISTRY_ADDRESS as `0x${string}`,
      abi: auditRegistryAbi,
      functionName: "getAuditRecordsByBuilding",
      args: [buildingAddress],
   })) as bigint[][];
}

export async function addAuditRecord(
   writeContract: WriteContractFn,
   buildingAddress: string,
   ipfsHash: string,
) {
   return writeContract({
      contractId: ContractId.fromSolidityAddress(AUDIT_REGISTRY_ADDRESS),
      abi: auditRegistryAbi,
      functionName: "addAuditRecord",
      args: [buildingAddress, ipfsHash],
      metaArgs: {
         gas: 250000,
      },
   });
}

export async function getAuditRecordDetails(recordId: bigint | number): Promise<bigint[][]> {
   return readContract({
      address: AUDIT_REGISTRY_ADDRESS as `0x${string}`,
      abi: auditRegistryAbi,
      functionName: "getAuditRecordDetails",
      args: [recordId],
   }) as Promise<bigint[][]>;
}
