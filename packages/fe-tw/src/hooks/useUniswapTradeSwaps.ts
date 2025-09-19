import { tokenAbi } from "@/services/contracts/abi/tokenAbi";
import { uniswapRouterAbi } from "@/services/contracts/abi/uniswapRouterAbi";
import { UNISWAP_ROUTER_ADDRESS } from "@/services/contracts/addresses";
import type { SwapUniswapTokensRequestBody } from "@/types/erc3643/types";
import useWriteContract from "./useWriteContract";
import { useAccount } from "wagmi";
import { executeTransaction } from "./useExecuteTransaction";
import { readContract } from "wagmi/actions";
import { config } from "@/config";

export const useUniswapTradeSwaps = () => {
   const { writeContract } = useWriteContract();
   const { address: evmAddress } = useAccount();

   const getAmountsOut = (amount: bigint, tokens: `0x${string}`[]): Promise<bigint[]> => {
      return readContract(config, {
         address: UNISWAP_ROUTER_ADDRESS,
         abi: uniswapRouterAbi,
         functionName: "getAmountsOut",
         args: [amount, tokens],
      }) as Promise<bigint[]>;
   };

   const giveAllowance = async (token: `0x${string}`, amount: bigint) => {
      return executeTransaction(() =>
         writeContract({
            address: token,
            abi: tokenAbi,
            functionName: "approve",
            args: [UNISWAP_ROUTER_ADDRESS, amount],
         }),
      );
   };

   const handleSwap = async (payload: SwapUniswapTokensRequestBody): Promise<any> => {
      return executeTransaction(() =>
         writeContract({
            address: UNISWAP_ROUTER_ADDRESS,
            abi: uniswapRouterAbi,
            functionName: "swapExactTokensForTokens",
            args: [payload.amountIn, payload.amountOut, payload.path, evmAddress, payload.deadline],
         }),
      );
   };

   return { handleSwap, getAmountsOut, giveAllowance };
};
