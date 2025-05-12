import { sliceAbi } from "@/services/contracts/abi/sliceAbi";
import { sliceFactoryAbi } from "@/services/contracts/abi/sliceFactoryAbi";
import { UNISWAP_ROUTER_ADDRESS, USDC_ADDRESS, SLICE_FACTORY_ADDRESS } from "@/services/contracts/addresses";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import type { CreateSliceRequestData, SliceDepositRequestData } from "@/types/erc3643/types";
import { pinata } from "@/utils/pinata";
import { useWatchTransactionReceipt, useWriteContract } from "@buidlerlabs/hashgraph-react-wallets";
import { ContractId } from "@hashgraph/sdk";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import * as uuid from "uuid";
import { useExecuteTransaction } from "./useExecuteTransaction";

const CHAINLINK_PRICE_ID = "0x269501f5674BeE3E8fef90669d3faa17021344d0";

const calculateAllocationWeight = (allocTokens: string[], weight: number) => {
   return Math.round(weight / allocTokens.length);
};

export function useCreateSlice(deployedSlice?: `0x${string}`) {
   const { writeContract } = useWriteContract();
   const { watch } = useWatchTransactionReceipt();
   const { executeTransaction } = useExecuteTransaction();

   const allocations = async (assets: string[], weight: number, assetId: number, txResults: string[]) => {
      if (assets[assetId]) {
         const result = await executeTransaction(() =>
            writeContract({
               contractId: ContractId.fromEvmAddress(0, 0, deployedSlice!),
               abi: sliceAbi,
               functionName: "addAllocation",
               args: [assets[assetId], CHAINLINK_PRICE_ID, weight],
            }),
         );;

         return allocations(assets, weight, assetId + 1, [
            ...txResults, (result as { transaction_id: string }).transaction_id,
         ]);
      }

      return txResults;
   };
   
   const addSliceAllocation = async (values: CreateSliceRequestData): Promise<string[] | undefined> => {
      const { sliceAllocation } = values;
      const allocationWeight = calculateAllocationWeight(sliceAllocation.tokenAssets, Number(sliceAllocation.allocation));
      const allocationHashes = await allocations(sliceAllocation.tokenAssets, allocationWeight, 0, []);

      return allocationHashes;
   };

   const depositToSlice = async (values: SliceDepositRequestData): Promise<string> => {
      const txResult = await executeTransaction(() => writeContract({
         contractId: ContractId.fromEvmAddress(0, 0, deployedSlice!),
         abi: sliceAbi,
         functionName: "deposit",
         args: [values.aToken, values.amount],
      }));

      return (txResult as { transaction_id: string })?.transaction_id;
   };

   const addSliceAllocationMutation = useMutation({
      mutationFn: async (values: any) => {
         const { sliceAllocation } = values;

         const tx = await executeTransaction(() => writeContract({
            contractId: ContractId.fromEvmAddress(0, 0, values.slice!),
            abi: sliceAbi,
            functionName: "addAllocation",
            args: [sliceAllocation.tokenAsset, CHAINLINK_PRICE_ID, sliceAllocation.allocation],
         })) as { transaction_id: string };
   
         return tx?.transaction_id;
      }
   });

   const waitForLastSliceDeployed = (): Promise<`0x${string}` | undefined> => {
      return new Promise((res) => {
         let logs: any = [];

         const unsubscribe = watchContractEvent({
            address: SLICE_FACTORY_ADDRESS,
            abi: sliceFactoryAbi,
            eventName: "SliceDeployed",
            onLogs: (data: any) => {
               logs = [...logs, ...data];
            },
         });

         setTimeout(() => {
            const lastSlice = [...logs].pop().args[0];

            if (lastSlice) {
               res(lastSlice);
               unsubscribe();
            } else {
               res(undefined);
            }
         }, 10000);
      });
   };

   const createSlice = async (values: CreateSliceRequestData): Promise<string> => {
      const { slice } = values;
      const keyRequest = await fetch("/api/pinataKey");
      const keyData = await keyRequest.json();

      return new Promise((res, rej) => {
         pinata.upload
            .json(slice, {
               metadata: { name: `Slice-${slice.name}` },
            })
            .key(keyData.JWT)
            .then(({ IpfsHash }) => {
               const sliceDetails = {
                  uniswapRouter: UNISWAP_ROUTER_ADDRESS,
                  usdc: USDC_ADDRESS,
                  name: slice.name,
                  symbol: slice.symbol,
                  metadataUri: IpfsHash,
               };

               writeContract({
                  contractId: ContractId.fromEvmAddress(0, 0, SLICE_FACTORY_ADDRESS),
                  abi: sliceFactoryAbi,
                  functionName: "deploySlice",
                  args: [uuid.v4(), sliceDetails],
               })
                  .then((tx) => {
                     watch(tx as string, {
                        onSuccess: (transaction) => {
                           res(transaction.transaction_id);

                           return transaction;
                        },
                        onError: (transaction, err) => {
                           rej(err);

                           return transaction;
                        },
                     });
                  })
                  .catch((err) => {
                     rej(err);
                  });
            });
      });
   };
   
   return {
      createSlice,
      addSliceAllocation,
      depositToSlice,
      waitForLastSliceDeployed,
      addSliceAllocationMutation,
   };
}
