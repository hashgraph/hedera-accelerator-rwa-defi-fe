"use client";

import { useEvmAddress, useWallet, useReadContract } from "@buidlerlabs/hashgraph-react-wallets";
import {
   HashpackConnector,
   MetamaskConnector,
} from "@buidlerlabs/hashgraph-react-wallets/connectors";
import { ContractId } from "@hashgraph/sdk";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { tokens } from "@/consts/tokens";
import { buildingAbi } from "@/services/contracts/abi/buildingAbi";
import { tokenAbi } from "@/services/contracts/abi/tokenAbi";
import { uniswapFactoryAbi } from "@/services/contracts/abi/uniswapFactoryAbi";
import { uniswapPairAbi } from "@/services/contracts/abi/uniswapPairAbi";
import { getTokenDecimals } from "@/services/erc20Service";
import { useExecuteTransaction } from "./useExecuteTransaction";
import useWriteContract from "./useWriteContract";
import { TransactionExtended } from "@/types/common";
import { UNISWAP_ROUTER_ADDRESS, UNISWAP_FACTORY_ADDRESS } from "@/services/contracts/addresses";
import { uniswapRouterAbi } from "@/services/contracts/abi/uniswapRouterAbi";
import { ethers } from "ethers";
import { useTokenPermitSignature } from "./useTokenPermitSignature";

type HederaWriteContractResult =
   | string
   | {
        transactionId?: { toString(): string };
     };

interface AddLiquidityArgs {
   buildingAddress: string;
   tokenAAddress: string;
   tokenBAddress: string;
   tokenAAmount: string;
   tokenBAmount: string;
}

interface PairInfo {
   exists: boolean;
   pairAddress: string;
   token0: string;
   token1: string;
   reserve0: bigint;
   reserve1: bigint;
}

interface CalculatedAmounts {
   tokenARequired: bigint;
   tokenBRequired: bigint;
   tokenAMin: bigint;
   tokenBMin: bigint;
}

interface PairCheckParams {
   tokenAAddress: string;
   tokenBAddress: string;
   tokenAAmount: string;
   tokenBAmount: string;
}

export function useBuildingLiquidity() {
   const { isConnected: isMetamaskConnected } = useWallet(MetamaskConnector);
   const { isConnected: isHashpackConnected } = useWallet(HashpackConnector);
   const { writeContract } = useWriteContract({ shouldEstimateGas: true });
   const { executeTransaction } = useExecuteTransaction();
   const { data: evmAddress } = useEvmAddress();
   const { readContract } = useReadContract();

   const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
   const [txHash, setTxHash] = useState<TransactionExtended>();
   const [txError, setTxError] = useState<string>();
   const [pairCheckParams, setPairCheckParams] = useState<PairCheckParams | null>(null);

   const { getPermitSignature } = useTokenPermitSignature();

   async function checkPairExists(tokenAAddress: string, tokenBAddress: string): Promise<PairInfo> {
      const pairAddress = (await readContract({
         address: UNISWAP_FACTORY_ADDRESS,
         abi: uniswapFactoryAbi,
         functionName: "getPair",
         args: [tokenAAddress, tokenBAddress],
      })) as string;

      const exists = pairAddress !== ethers.ZeroAddress;

      if (!exists) {
         return {
            exists: false,
            pairAddress: ethers.ZeroAddress,
            token0: "",
            token1: "",
            reserve0: BigInt(0),
            reserve1: BigInt(0),
         };
      }

      // Get pair contract details
      const [reserves, token0, token1] = await Promise.all([
         readContract({
            address: pairAddress as `0x${string}`,
            abi: uniswapPairAbi,
            functionName: "getReserves",
         }) as Promise<[bigint, bigint, number]>,
         readContract({
            address: pairAddress as `0x${string}`,
            abi: uniswapPairAbi,
            functionName: "token0",
         }) as Promise<string>,
         readContract({
            address: pairAddress as `0x${string}`,
            abi: uniswapPairAbi,
            functionName: "token1",
         }) as Promise<string>,
      ]);

      return {
         exists: true,
         pairAddress,
         token0,
         token1,
         reserve0: reserves[0],
         reserve1: reserves[1],
      };
   }

   function calculateRequiredAmounts(
      tokenAAddress: string,
      tokenBAddress: string,
      desiredTokenAAmount: bigint,
      desiredTokenBAmount: bigint,
      pairInfo: PairInfo,
   ): CalculatedAmounts {
      if (!pairInfo.exists) {
         return {
            tokenARequired: desiredTokenAAmount,
            tokenBRequired: desiredTokenBAmount,
            tokenAMin: (desiredTokenAAmount * BigInt(95)) / BigInt(100),
            tokenBMin: (desiredTokenBAmount * BigInt(95)) / BigInt(100),
         };
      }

      let reserveTokenA: bigint, reserveTokenB: bigint;

      if (tokenAAddress.toLowerCase() === pairInfo.token0.toLowerCase()) {
         reserveTokenA = pairInfo.reserve0;
         reserveTokenB = pairInfo.reserve1;
      } else {
         reserveTokenA = pairInfo.reserve1;
         reserveTokenB = pairInfo.reserve0;
      }

      const tokenARequired = (reserveTokenA * desiredTokenBAmount) / reserveTokenB;

      const tokenAMin = (tokenARequired * BigInt(95)) / BigInt(100);
      const tokenBMin = (desiredTokenBAmount * BigInt(95)) / BigInt(100);

      return {
         tokenARequired,
         tokenBRequired: desiredTokenBAmount,
         tokenAMin,
         tokenBMin,
      };
   }

   const {
      data: pairCheckResult,
      isLoading: isCheckingPair,
      error: pairCheckError,
      refetch: recheckPair,
   } = useQuery({
      queryKey: ["pairCheck", pairCheckParams],
      queryFn: async () => {
         if (!pairCheckParams) return null;

         const { tokenAAddress, tokenBAddress, tokenAAmount, tokenBAmount } = pairCheckParams;

         const tokenAData = tokens.find(
            (t) => t.address.toLowerCase() === tokenAAddress.toLowerCase(),
         );
         const tokenBData = tokens.find(
            (t) => t.address.toLowerCase() === tokenBAddress.toLowerCase(),
         );

         let decimalsA = tokenAData?.decimals;
         let decimalsB = tokenBData?.decimals;

         if (!decimalsA) {
            decimalsA = (await getTokenDecimals(
               tokenAAddress as `0x${string}`,
            )) as unknown as number;
         }
         if (!decimalsB) {
            decimalsB = (await getTokenDecimals(
               tokenBAddress as `0x${string}`,
            )) as unknown as number;
         }

         const desiredTokenA = BigInt(
            Math.floor(Number.parseFloat(tokenAAmount) * 10 ** decimalsA!),
         );
         const desiredTokenB = BigInt(
            Math.floor(Number.parseFloat(tokenBAmount) * 10 ** decimalsB!),
         );

         const pairInfo = await checkPairExists(tokenAAddress, tokenBAddress);

         const calculatedAmounts = calculateRequiredAmounts(
            tokenAAddress,
            tokenBAddress,
            desiredTokenA,
            desiredTokenB,
            pairInfo,
         );

         return {
            pairInfo,
            calculatedAmounts,
            decimalsA,
            decimalsB,
         };
      },
      enabled: !!pairCheckParams,
      staleTime: 30000,
      retry: 2,
   });

   const checkPairAndCalculateAmounts = (
      tokenAAddress: string,
      tokenBAddress: string,
      tokenAAmount: string,
      tokenBAmount: string,
   ) => {
      setPairCheckParams({
         tokenAAddress,
         tokenBAddress,
         tokenAAmount,
         tokenBAmount,
      });
   };

   async function addLiquidity({
      buildingAddress,
      tokenAAddress,
      tokenBAddress,
      tokenAAmount,
      tokenBAmount,
   }: AddLiquidityArgs) {
      try {
         setIsAddingLiquidity(true);
         setTxHash(undefined);

         if (!isMetamaskConnected && !isHashpackConnected) {
            toast.error("No wallet connected. Please connect first.");
            return;
         }

         if (!/^0x[0-9a-fA-F]{40}$/.test(buildingAddress)) {
            throw new Error(`Invalid EVM address: ${buildingAddress}`);
         }

         if (!pairCheckResult?.calculatedAmounts) {
            throw new Error("Please check pair information first");
         }

         const { calculatedAmounts } = pairCheckResult;
         const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes

         const [signatureTokenB, signatureTokenA] = await Promise.all([
            getPermitSignature(
               tokenBAddress as `0x${string}`,
               calculatedAmounts.tokenBRequired,
               UNISWAP_ROUTER_ADDRESS,
               deadline,
            ),
            getPermitSignature(
               tokenAAddress as `0x${string}`,
               calculatedAmounts.tokenARequired,
               UNISWAP_ROUTER_ADDRESS,
               deadline,
            ),
         ]);

         // (await writeContract({
         //    contractId: ContractId.fromSolidityAddress(tokenAAddress as `0x${string}`),
         //    abi: tokenAbi,
         //    functionName: "approve",
         //    args: [UNISWAP_ROUTER_ADDRESS, calculatedAmounts.tokenARequired],
         // })) as HederaWriteContractResult;

         // (await writeContract({
         //    contractId: ContractId.fromSolidityAddress(tokenBAddress as `0x${string}`),
         //    abi: tokenAbi,
         //    functionName: "approve",
         //    args: [UNISWAP_ROUTER_ADDRESS, calculatedAmounts.tokenBRequired],
         // })) as HederaWriteContractResult;

         console.log("Debug values:", {
            tokenAAddress,
            tokenBAddress,
            evmAddress,
            UNISWAP_ROUTER_ADDRESS,
            calculatedAmounts,
            signatureTokenA,
            signatureTokenB,
         });

         const tx = await executeTransaction(() =>
            writeContract({
               contractId: ContractId.fromSolidityAddress(UNISWAP_ROUTER_ADDRESS),
               abi: uniswapRouterAbi,
               functionName: "addLiquidityWithPermit",
               args: [
                  {
                     tokenA: tokenAAddress,
                     tokenB: tokenBAddress,
                     amountADesired: signatureTokenA.amount,
                     amountBDesired: signatureTokenB.amount,
                     amountAMin: calculatedAmounts.tokenAMin,
                     amountBMin: calculatedAmounts.tokenBMin,
                     to: evmAddress,
                     deadline: signatureTokenA.deadline,
                     v: [signatureTokenA.v, signatureTokenB.v],
                     r: [signatureTokenA.r, signatureTokenB.r],
                     s: [signatureTokenA.s, signatureTokenB.s],
                  },
               ],
            }),
         );

         setTxHash(tx);
         setPairCheckParams(null);
      } catch (error) {
         setTxError((error as Error).message);
         console.error(error);
      } finally {
         setIsAddingLiquidity(false);
      }
   }

   useEffect(() => {
      window.ethers = ethers;
      window.abi = uniswapRouterAbi;
   }, []);

   return {
      isAddingLiquidity,
      txHash,
      txError,
      pairInfo: pairCheckResult?.pairInfo,
      calculatedAmounts: pairCheckResult?.calculatedAmounts,
      isCheckingPair,
      pairCheckError,
      addLiquidity,
      checkPairAndCalculateAmounts,
      recheckPair,
   };
}
