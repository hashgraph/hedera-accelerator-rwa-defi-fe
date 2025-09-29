import { useEvmAddress, useWatchTransactionReceipt } from "@buidlerlabs/hashgraph-react-wallets";
import { ContractId } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as uuid from "uuid";
import { MaxUint256, parseUnits, ethers, TypedDataDomain } from "ethers";
import { useExecuteTransaction } from "./useExecuteTransaction";
import useWriteContract from "./useWriteContract";
import { readBuildingDetails } from "@/hooks/useBuildings";
import { tokenAbi } from "@/services/contracts/abi/tokenAbi";
import { basicVaultAbi } from "@/services/contracts/abi/basicVaultAbi";
import { uniswapRouterAbi } from "@/services/contracts/abi/uniswapRouterAbi";
import { sliceAbi } from "@/services/contracts/abi/sliceAbi";
import { sliceFactoryAbi } from "@/services/contracts/abi/sliceFactoryAbi";
import { tokenVotesAbi } from "@/services/contracts/abi/tokenVotesAbi";
import {
   UNISWAP_ROUTER_ADDRESS,
   USDC_ADDRESS,
   SLICE_FACTORY_ADDRESS,
   CHAINLINK_PRICE_ID,
   BUILDING_FACTORY_ADDRESS,
} from "@/services/contracts/addresses";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import type {
   AddSliceAllocationRequestBody,
   CreateSliceRequestData,
   DepositToSliceRequestData,
} from "@/types/erc3643/types";
import { pinata } from "@/utils/pinata";
import { TransactionExtended } from "@/types/common";
import { buildingFactoryAbi } from "@/services/contracts/abi/buildingFactoryAbi";
import { tryCatch } from "@/services/tryCatch";
import { useUploadImageToIpfs } from "./useUploadImageToIpfs";
import { useSlicesData } from "./useSlicesData";
import { useEffect, useState } from "react";
import { useTokenPermitSignature } from "./useTokenPermitSignature";

export function useCreateSlice(sliceAddress?: `0x${string}`) {
   const queryClient = useQueryClient();
   const { writeContract } = useWriteContract();
   const { watch } = useWatchTransactionReceipt();
   const { executeTransaction } = useExecuteTransaction();
   const { uploadImage } = useUploadImageToIpfs();
   const { data: evmAddress } = useEvmAddress();
   const { slices } = useSlicesData();
   const { getPermitSignature } = useTokenPermitSignature();
   const [ipfsHashUploadingInProgress, setIpfsHashUploadingInProgress] = useState(false);

   const approvalsInBatch = async (
      assets: string[],
      amounts: BigInt[],
      assetId: number,
      txResults: string[],
      approveAddress: `0x${string}`,
      reverseApproval: boolean = false,
   ) => {
      if (assets[assetId]) {
         const result = await executeTransaction(() =>
            writeContract({
               contractId: ContractId.fromEvmAddress(
                  0,
                  0,
                  reverseApproval ? approveAddress : assets[assetId],
               ),
               abi: tokenAbi,
               functionName: "approve",
               args: [reverseApproval ? assets[assetId] : approveAddress, amounts[assetId]],
            }),
         );

         return approvalsInBatch(
            assets,
            amounts,
            assetId + 1,
            [...txResults, (result as { transaction_id: string }).transaction_id],
            approveAddress,
            reverseApproval,
         );
      }

      return txResults;
   };

   const addAllocationInBatch = async (
      assets: string[],
      amounts: number[],
      assetId: number,
      txResults: string[],
      deployedSliceAddress?: `0x${string}`,
   ) => {
      if (assets[assetId]) {
         const { data, error } = await tryCatch(
            executeTransaction(() =>
               writeContract({
                  functionName: "addAllocation",
                  args: [assets[assetId], CHAINLINK_PRICE_ID, amounts[assetId]],
                  abi: sliceAbi,
                  contractId: ContractId.fromEvmAddress(
                     0,
                     0,
                     deployedSliceAddress || sliceAddress!,
                  ),
               }),
            ),
         );

         return addAllocationInBatch(
            assets,
            amounts,
            assetId + 1,
            [...txResults, !error ? (data as { transaction_id: string }).transaction_id : ""],
            deployedSliceAddress,
         );
      }

      return txResults;
   };

   const createIdentityInBatch = async (
      assets: { tokenA: string; tokenB: string; building: string; vaultA: string }[],
      assetId: number,
      deployedSliceAddress: string,
      txResults: string[],
   ) => {
      if (assets[assetId]) {
         const { data: deploySliceIdentityResult } = await tryCatch(
            executeTransaction(() =>
               writeContract({
                  contractId: ContractId.fromEvmAddress(0, 0, BUILDING_FACTORY_ADDRESS),
                  abi: buildingFactoryAbi,
                  functionName: "deployIdentityForWallet",
                  args: [deployedSliceAddress ?? sliceAddress],
               }),
            ),
         );
         const { data: registerSliceIdentityResult } = await tryCatch(
            executeTransaction(() =>
               writeContract({
                  contractId: ContractId.fromEvmAddress(0, 0, BUILDING_FACTORY_ADDRESS),
                  abi: buildingFactoryAbi,
                  functionName: "registerIdentity",
                  args: [assets[assetId].building, deployedSliceAddress ?? sliceAddress, 840],
               }),
            ),
         );
         return createIdentityInBatch(assets, assetId + 1, deployedSliceAddress, [
            ...txResults,
            (registerSliceIdentityResult as unknown as { transaction_id: string })?.transaction_id,
            (deploySliceIdentityResult as unknown as { transaction_id: string })?.transaction_id,
         ]);
      }

      return txResults;
   };

   const addLiquidityInBatch = async (
      assets: string[],
      assetId: number,
      txResults: string[],
      rewardsAmountA: BigInt,
      rewardsAmountB: BigInt,
      deployedSliceAddress?: `0x${string}`,
   ) => {
      if (assets[assetId]) {
         const result = await executeTransaction(() =>
            writeContract({
               functionName: "addLiquidity",
               args: [
                  USDC_ADDRESS,
                  assets[assetId],
                  rewardsAmountA,
                  rewardsAmountB,
                  parseUnits("1", 6),
                  parseUnits("1", 18),
                  evmAddress,
                  MaxUint256,
               ],
               abi: uniswapRouterAbi,
               contractId: ContractId.fromEvmAddress(0, 0, UNISWAP_ROUTER_ADDRESS),
            }),
         );

         return addLiquidityInBatch(
            assets,
            assetId + 1,
            [...txResults, (result as { transaction_id: string }).transaction_id],
            rewardsAmountA,
            rewardsAmountB,
            deployedSliceAddress,
         );
      }

      return txResults;
   };

   const rebalanceSliceMutation = useMutation({
      mutationFn: async (values: { sliceAllocation: AddSliceAllocationRequestBody }) => {
         const data = executeTransaction(() =>
            writeContract({
               functionName: "rebalance",
               args: [],
               abi: sliceAbi,
               contractId: ContractId.fromEvmAddress(0, 0, sliceAddress!),
            }),
         );

         return data;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["sliceAllocations", sliceAddress] });
      },
   });

   const addAllocationsToSliceMutation = useMutation({
      mutationFn: async (values: {
         sliceAllocation: AddSliceAllocationRequestBody;
         deployedSliceAddress?: `0x${string}`;
      }) => {
         const { sliceAllocation, deployedSliceAddress } = values;
         const { tokenAssets, tokenAssetAmounts, rewardAmount } = sliceAllocation;
         const buildingDetails = await Promise.all(
            tokenAssets?.map((building) => readBuildingDetails(building)),
         );

         const vaultsInfo = buildingDetails.map((detailLog) => ({
            address: detailLog[0][0],
            token: detailLog[0][4],
            vault: detailLog[0][7],
            ac: detailLog[0][8],
            allocation: Number(tokenAssetAmounts[detailLog[0][0]]),
         }));

         let txHashes = [];

         const addAllocationsHashes = await addAllocationInBatch(
            vaultsInfo.map((v) => v.ac),
            vaultsInfo.map((v) => v.allocation * 100),
            0,
            [],
            deployedSliceAddress,
         );

         txHashes.push(...addAllocationsHashes);

         await tryCatch(
            createIdentityInBatch(
               vaultsInfo.map((vault) => ({
                  tokenA: vault.token,
                  tokenB: USDC_ADDRESS,
                  building: vault.address,
                  vaultA: vault.vault,
               })),
               0,
               (deployedSliceAddress ?? sliceAddress)!,
               [],
            ),
         );

         return txHashes;
      },
   });

   const waitForLastSliceDeployed = (): Promise<`0x${string}` | undefined> => {
      return new Promise((res) => {
         const unsubscribe = watchContractEvent<
            typeof sliceFactoryAbi,
            "SliceDeployed",
            undefined,
            [`0x${string}`]
         >({
            address: SLICE_FACTORY_ADDRESS,
            abi: sliceFactoryAbi,
            eventName: "SliceDeployed",
            onLogs: (data) => {
               const last = data.pop()?.args?.[0];

               if (last && !slices.find((slice) => slice.address === last)) {
                  res(last);
               }
            },
         });
      });
   };

   const createSlice = async (values: CreateSliceRequestData): Promise<TransactionExtended> => {
      const { slice } = values;
      const keyRequest = await fetch("/api/pinataKey");
      const keyData = await keyRequest.json();
      let sliceImageIpfsId: string | undefined;

      if (!slice.sliceImageIpfsId) {
         setIpfsHashUploadingInProgress(true);
         const { data: imageIpfsId } = await tryCatch(uploadImage(slice.sliceImageIpfsFile!));

         sliceImageIpfsId = imageIpfsId as string;
         setIpfsHashUploadingInProgress(false);
      }

      return new Promise((res, rej) => {
         pinata.upload
            .json(
               {
                  ...slice,
                  ...(!!sliceImageIpfsId && {
                     sliceImageIpfsId,
                  }),
               },
               {
                  metadata: {
                     name: `Slice-${slice.name}`,
                  },
               },
            )
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
                           res(transaction);

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

   const depositInBatchWithPermit = useMutation<
      unknown,
      unknown,
      {
         aTokens: string[];
         amounts: BigInt[];
         deadlines: BigInt[];
         vs: number[];
         rs: string[];
         ss: string[];
      }
   >({
      mutationFn: async ({ aTokens, amounts, deadlines, vs, rs, ss }) => {
         const tx = await executeTransaction(() =>
            writeContract({
               contractId: ContractId.fromEvmAddress(0, 0, sliceAddress!),
               abi: sliceAbi,
               functionName: "depositBatchWithSignatures",
               args: [aTokens, amounts, deadlines, vs, rs, ss],
            }),
         );

         return tx;
      },
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["sliceAllocations", sliceAddress] });
      },
   });

   const depositInBatch = useMutation<
      unknown,
      unknown,
      {
         aTokens: string[];
         amounts: BigInt[];
      }
   >({
      mutationFn: async ({ aTokens, amounts }) => {
         const txResults: unknown[] = [];

         for (let i = 0; i < aTokens.length; i++) {
            const tx = await executeTransaction(() =>
               writeContract({
                  contractId: ContractId.fromEvmAddress(0, 0, sliceAddress!),
                  abi: sliceAbi,
                  functionName: "deposit",
                  args: [aTokens[i], amounts[i]],
               }),
            );
            txResults.push(tx);
         }

         return txResults;
      },
   });

   const deposit = async (
      tokensData: Array<{
         tokenAddress: `0x${string}`;
         aToken: `0x${string}`;
         amount: number | bigint;
      }>,
   ) => {
      const aTokens = tokensData.map((token) => token.aToken);
      const amounts = tokensData.map((token) =>
         typeof token.amount === "bigint" ? token.amount : BigInt(token.amount),
      );

      return depositInBatch.mutateAsync({
         aTokens,
         amounts,
      });
   };

   const depositWithPermits = async (
      tokensData: Array<{
         tokenAddress: `0x${string}`;
         aToken: `0x${string}`;
         amount: number | bigint;
      }>,
   ) => {
      const signatures = await Promise.all(
         tokensData.map(({ tokenAddress, amount }) =>
            getPermitSignature(
               tokenAddress,
               amount,
               sliceAddress!,
               undefined,
               "ERC20Permit",
               "1.0.0",
            ),
         ),
      );

      const aTokens = signatures.map((_, idx) => tokensData[idx].aToken);
      const amounts = signatures.map((sig) => sig.amount);
      const deadlines = signatures.map((sig) => sig.deadline);
      const vs = signatures.map((sig) => sig.v);
      const rs = signatures.map((sig) => sig.r);
      const ss = signatures.map((sig) => sig.s);

      return depositInBatchWithPermit.mutateAsync({
         aTokens,
         amounts,
         deadlines,
         vs,
         rs,
         ss,
      });
   };

   return {
      createSlice,
      waitForLastSliceDeployed,
      ipfsHashUploadingInProgress,
      addAllocationsToSliceMutation,
      rebalanceSliceMutation,
      deposit,
      depositWithPermits,
   };
}
