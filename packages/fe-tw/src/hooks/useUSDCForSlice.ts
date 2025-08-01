import { useState } from "react";
import { ethers } from "ethers";
import { map } from "lodash";
import { tryCatch } from "@/services/tryCatch";
import { useCreateSlice } from "@/hooks/useCreateSlice";
import { useUniswapTradeSwaps } from "@/hooks/useUniswapTradeSwaps";
import { getTokenDecimals, getTokenName, getTokenSymbol } from "@/services/erc20Service";
import { USDC_ADDRESS } from "@/services/contracts/addresses";
import { oneHourTimePeriod } from "@/consts/trade";

export interface SliceAllocation {
   buildingToken: `0x${string}`;
   aToken: `0x${string}`;
   idealAllocation: number;
}

export interface TokenInfo {
   address: string;
   decimals: number;
   name: string;
   symbol: string;
}

export interface ExchangeRateInfo {
   usdc: bigint;
   token: bigint;
   tokenDecimals: number;
   tokenName: string;
   tokenSymbol: string;
   usdcAmount: number;
   tokenAmount: string;
}

export interface TokenAmountForDeposit {
   tokenAddress: `0x${string}`;
   aToken: `0x${string}`;
   amount: bigint;
}

export interface StepResults {
   [stepNumber: number]: boolean;
}

export interface ExchangeRates {
   [tokenAddress: string]: ExchangeRateInfo;
}

export interface InvestmentResult {
   success: boolean;
}

export interface UseUSDCForSliceReturn {
   investUSDCToSlice: (usdcAmount: string) => Promise<InvestmentResult>;
   currentStep: number;
   stepResults: StepResults;
   steps: readonly string[];
   exchangeRates: ExchangeRates;
}

export const useUSDCForSlice = (
   sliceAddress?: `0x${string}`,
   sliceAllocations?: SliceAllocation[],
): UseUSDCForSliceReturn => {
   const { handleSwap, getAmountsOut, giveAllowance } = useUniswapTradeSwaps();
   const { depositWithPermits } = useCreateSlice(sliceAddress);

   const [currentStep, setCurrentStep] = useState<number>(0);
   const [stepResults, setStepResults] = useState<StepResults>({});
   const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});

   const steps: readonly string[] = [
      "Fetching token information and calculating exchange rates",
      "Swapping USDC to tokens",
      "Depositing tokens to slice",
   ] as const;

   const investUSDCToSlice = async (usdcAmount: string): Promise<InvestmentResult> => {
      try {
         setStepResults({});

         setCurrentStep(1);
         const amounts: ExchangeRates = {};
         const totalUSDC = Number(usdcAmount);

         const buildingTokens = map(sliceAllocations, "buildingToken");

         const tokenInfoPromises = buildingTokens.map(async (tokenAddress): Promise<TokenInfo> => {
            const [decimalsResult, nameResult, symbolResult] = await Promise.all([
               tryCatch(getTokenDecimals(tokenAddress)),
               tryCatch(getTokenName(tokenAddress)),
               tryCatch(getTokenSymbol(tokenAddress)),
            ]);

            return {
               address: tokenAddress as string,
               decimals: decimalsResult.data ? Number(decimalsResult.data[0]) : (18 as number),
               name: (nameResult.data ? nameResult.data[0] : "Unknown Token") as string,
               symbol: (symbolResult.data ? symbolResult.data[0] : "UNKNOWN") as string,
            };
         });

         const tokensInfo: TokenInfo[] = await Promise.all(tokenInfoPromises);
         const tokenInfoMap: Record<string, TokenInfo> = tokensInfo.reduce(
            (acc, info) => {
               acc[info.address] = info;
               return acc;
            },
            {} as Record<string, TokenInfo>,
         );

         for (const alloc of sliceAllocations || []) {
            const usdcForToken = (totalUSDC * alloc.idealAllocation) / 100;
            const tokenInfo = tokenInfoMap[alloc.buildingToken];

            const { data: outputAmounts } = await tryCatch(
               getAmountsOut(ethers.parseUnits(usdcForToken.toString(), 6), [
                  USDC_ADDRESS,
                  alloc.buildingToken,
               ]),
            );

            if (outputAmounts && outputAmounts[1]) {
               amounts[alloc.buildingToken] = {
                  usdc: outputAmounts[0],
                  token: outputAmounts[1],
                  tokenDecimals: tokenInfo.decimals,
                  tokenName: tokenInfo.name,
                  tokenSymbol: tokenInfo.symbol,
                  usdcAmount: usdcForToken,
                  tokenAmount: ethers.formatUnits(outputAmounts[1], tokenInfo.decimals),
               };
            }
         }
         setExchangeRates(amounts);
         setStepResults((prev) => ({ ...prev, 1: true }));

         setCurrentStep(2);
         const tokenAmounts: TokenAmountForDeposit[] = [];

         for (let i = 0; i < buildingTokens.length; i++) {
            const tokenAddress = buildingTokens[i];
            const allocation = sliceAllocations?.[i];

            if (allocation && amounts[tokenAddress]) {
               const outputAmounts = amounts[tokenAddress];

               if (outputAmounts.usdc && outputAmounts.token) {
                  await giveAllowance(USDC_ADDRESS, outputAmounts.usdc);
                  await giveAllowance(tokenAddress, outputAmounts.token);

                  await handleSwap({
                     amountIn: outputAmounts.usdc,
                     amountOut: outputAmounts.token,
                     path: [USDC_ADDRESS, tokenAddress],
                     deadline: Date.now() + oneHourTimePeriod,
                  });

                  tokenAmounts.push({
                     tokenAddress: tokenAddress as `0x${string}`,
                     aToken: allocation.aToken,
                     amount: outputAmounts.token,
                  });
               }
            }
         }
         setStepResults((prev) => ({ ...prev, 2: true }));

         setCurrentStep(3);
         if (tokenAmounts.length > 0) {
            await depositWithPermits(tokenAmounts);
         }
         setStepResults((prev) => ({ ...prev, 3: true }));

         return { success: true };
      } catch (error) {
         setStepResults((prev) => ({ ...prev, [currentStep]: false }));
         throw error;
      }
   };

   return {
      investUSDCToSlice,
      currentStep,
      stepResults,
      steps,
      exchangeRates,
   };
};
