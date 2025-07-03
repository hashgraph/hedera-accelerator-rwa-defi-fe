import { useEvmAddress, useWatchTransactionReceipt } from "@buidlerlabs/hashgraph-react-wallets";
import { ContractId } from "@hashgraph/sdk";
import { useMutation } from "@tanstack/react-query";
import * as uuid from "uuid";
import { MaxUint256, parseUnits, ethers } from "ethers";
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
import { useState } from "react";
import { useChain, useReadContract } from "@buidlerlabs/hashgraph-react-wallets";

export function useCreateSlice(sliceAddress?: `0x${string}`) {
   const { writeContract } = useWriteContract();
   const { watch } = useWatchTransactionReceipt();
   const { executeTransaction } = useExecuteTransaction();
   const { uploadImage } = useUploadImageToIpfs();
   const { data: evmAddress } = useEvmAddress();
   const { data: chainData } = useChain();
   const { readContract } = useReadContract();
   const { slices } = useSlicesData();
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

   const createIdentityInBatch: any = async (
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
            [
               (registerSliceIdentityResult as unknown as { transaction_id: string })
                  ?.transaction_id,
               (deploySliceIdentityResult as unknown as { transaction_id: string })?.transaction_id,
            ],
         ]);
      }

      return txResults;
   };

   const addLiquidityInBatch: any = async (
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

   const addRewardInBatch = async (
      assets: string[],
      assetId: number,
      txResults: string[],
      rewardsAmount: BigInt,
   ) => {
      if (assets[assetId]) {
         const result = await executeTransaction(() =>
            writeContract({
               functionName: "addReward",
               args: [USDC_ADDRESS, rewardsAmount],
               abi: basicVaultAbi,
               contractId: ContractId.fromEvmAddress(0, 0, assets[assetId]),
            }),
         );

         return addRewardInBatch(
            assets,
            assetId + 1,
            [...txResults, (result as { transaction_id: string }).transaction_id],
            rewardsAmount,
         );
      }

      return txResults;
   };

   const rebalanceSliceMutation = useMutation({
      mutationFn: async (values: { sliceAllocation: AddSliceAllocationRequestBody }) => {
         try {
            const { tokenAssets, rewardAmount } = values.sliceAllocation;
            let txHashes = [];
            const rewardsAmountToInUSDC = parseUnits(rewardAmount, 6);
            const buildingDetails = await Promise.all(
               tokenAssets?.map((building) => readBuildingDetails(building)),
            );
            const vaultsInfo = buildingDetails.map((detailLog) => ({
               address: detailLog[0][0],
               token: detailLog[0][4],
               vault: detailLog[0][7],
               ac: detailLog[0][8],
            }));
            const approveRewardsHashes = await approvalsInBatch(
               vaultsInfo.map((v) => v.vault),
               vaultsInfo.map((_) => rewardsAmountToInUSDC),
               0,
               [],
               USDC_ADDRESS,
               true,
            );
            txHashes.push(...approveRewardsHashes);
            const addRewardsHashes = await addRewardInBatch(
               vaultsInfo.map((v) => v.vault),
               0,
               [],
               rewardsAmountToInUSDC,
            );
            txHashes.push(...addRewardsHashes);

            // todo: apply delay
            const { data } = await tryCatch(
               executeTransaction(() =>
                  writeContract({
                     functionName: "rebalance",
                     args: [],
                     abi: sliceAbi,
                     contractId: ContractId.fromEvmAddress(0, 0, sliceAddress!),
                  }),
               ) as Promise<{ transaction_id: string }>,
            );

            return data;
         } catch (err: any) {
            throw new Error(err.message);
         }
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
         const rewardsAmountToInUSDC = parseUnits(rewardAmount, 6);
         const rewardsAmountToInStaking = parseUnits(rewardAmount, 18);
         const tokensToApprove = [...vaultsInfo.map((v) => v.token), USDC_ADDRESS];
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
               deployedSliceAddress ?? sliceAddress,
               [],
            ),
         );

         const approvalsHashes = await approvalsInBatch(
            tokensToApprove,
            tokensToApprove.map((_t) =>
               _t === USDC_ADDRESS
                  ? parseUnits((Number(rewardAmount) * vaultsInfo.length).toString(), 6)
                  : rewardsAmountToInStaking,
            ),
            0,
            [],
            UNISWAP_ROUTER_ADDRESS,
         );
         txHashes.push(...approvalsHashes);

         const addLiquidityHashes = await addLiquidityInBatch(
            vaultsInfo.map((v) => v.token),
            0,
            [],
            rewardsAmountToInUSDC,
            rewardsAmountToInStaking,
            deployedSliceAddress,
         );
         txHashes.push(...addLiquidityHashes);

         return txHashes;
      },
   });

   const waitForLastSliceDeployed = (): Promise<`0x${string}` | undefined> => {
      return new Promise((res) => {
         const unsubscribe = watchContractEvent({
            address: SLICE_FACTORY_ADDRESS,
            abi: sliceFactoryAbi,
            eventName: "SliceDeployed",
            onLogs: (data: any[]) => {
               const last = data.pop()?.args?.[0];

               if (last && !slices.find((slice) => slice.address === last)) {
                  res(last);
                  unsubscribe();
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

   const generateTokenSignature = async (
      tokenAddress: `0x${string}`,
      aToken: `0x${string}`,
      amount: number,
   ) => {
      const tokenName = await readContract({
         abi: tokenAbi,
         functionName: "name",
         address: tokenAddress,
         args: [],
      });
      const tokenDecimals = await readContract({
         abi: tokenAbi,
         functionName: "decimals",
         address: tokenAddress,
         args: [],
      });

      const amountInWei =
         typeof amount === "bigint" ? amount : ethers.parseUnits(amount.toString(), tokenDecimals);

      const nonce = await readContract({
         address: tokenAddress,
         abi: tokenVotesAbi,
         functionName: "nonces",
         args: [evmAddress],
      });

      const domain = {
         name: tokenName,
         version: "1",
         chainId: chainData.chain.id,
         verifyingContract: tokenAddress,
      };

      const types = {
         Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
         ],
      };

      const deadline = Math.floor(Date.now() / 1000 + 600);

      const message = {
         owner: evmAddress,
         spender: sliceAddress,
         value: String(amountInWei),
         nonce: String(nonce),
         deadline: deadline,
      };

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const signatureHash = await signer.signTypedData(domain, types, message);

      const { v, r, s } = ethers.Signature.from(signatureHash);

      return {
         aToken,
         tokenAddress,
         amount: amountInWei,
         deadline: BigInt(deadline),
         v,
         r,
         s,
      };
   };

   const depositInBatchWithPermit = useMutation<
      unknown,
      unknown,
      {
         aTokens: string[];
         amounts: BigInt[];
         deadlines: BigInt[];
         vs: string[];
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
   });

   const depositWithPermits = async (
      tokensData: Array<{
         tokenAddress: `0x${string}`;
         aToken: `0x${string}`;
         amount: number;
      }>,
   ) => {
      const signatures = await Promise.all(
         tokensData.map(({ tokenAddress, aToken, amount }) =>
            generateTokenSignature(tokenAddress, aToken, amount),
         ),
      );

      const aTokens = signatures.map((sig) => sig.aToken);
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
      depositWithPermits,
   };
}
