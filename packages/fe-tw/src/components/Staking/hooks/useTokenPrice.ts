import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { UNISWAP_ROUTER_ADDRESS, USDC_ADDRESS } from "@/services/contracts/addresses";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { uniswapRouterAbi } from "@/services/contracts/abi/uniswapRouterAbi";
import { readContract } from "wagmi/actions";
import { config } from "@/config";

export const useTokenPrice = (
   tokenAddress: `0x${string}` | undefined,
   tokenDecimals: number | undefined,
) => {
   const { decimals: usdcDecimals } = useTokenInfo(USDC_ADDRESS);

   return useQuery({
      queryKey: ["TOKEN_PRICE", tokenAddress],
      queryFn: async () => {
         if (!tokenAddress || !tokenDecimals || !usdcDecimals) return 0;

         const amountIn = ethers.parseUnits("1", tokenDecimals);
         const path = [tokenAddress, USDC_ADDRESS];

         const amountsOutPayload = await readContract(config, {
            address: UNISWAP_ROUTER_ADDRESS,
            abi: uniswapRouterAbi,
            functionName: "getAmountsOut",
            args: [amountIn, path],
         });

         const usdcAmountEquivalent = amountsOutPayload[1];

         return Number(usdcAmountEquivalent) / 10 ** usdcDecimals;
      },
      enabled: Boolean(tokenAddress) && Boolean(tokenDecimals) && Boolean(usdcDecimals),
   });
};
