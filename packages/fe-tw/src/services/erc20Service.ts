import { readContract } from "@/services/contracts/readContract";
import { tokenAbi } from "./contracts/abi/tokenAbi";
import { toast } from "sonner";

export const getTokenDecimals = async (tokenAddress: `0x${string}`): Promise<bigint[]> => {
   return await readContract({
      address: tokenAddress,
      abi: tokenAbi,
      functionName: "decimals",
      args: [],
   });
};

export const getTokenBalanceOf = async (
   tokenAddress: `0x${string}`,
   userAddress: string,
): Promise<bigint[]> => {
   return await readContract({
      address: tokenAddress,
      abi: tokenAbi,
      functionName: "balanceOf",
      args: [userAddress],
   });
};

export const getTokenName = (tokenAddress: `0x${string}`) =>
   readContract({
      abi: tokenAbi,
      functionName: "name",
      address: tokenAddress,
      args: [],
   });

export const getTokenSymbol = async (tokenAddress: `0x${string}`) => {
   return await readContract({
      address: tokenAddress,
      abi: tokenAbi,
      functionName: "symbol",
      args: [],
   });
};

type TokenType = "ERC721" | "ERC20";

type TokenToMMPayload = {
   tokenAddress: `0x${string}`;
   tokenSymbol: string;
   tokenDecimals: string;
   tokenType: TokenType;
   tokenAvatar?: string;
};

export const addTokenToMM = async ({
   tokenAddress,
   tokenDecimals,
   tokenSymbol,
   tokenType,
   tokenAvatar = "https://stormgain.com/sites/default/files/2021-06/breed-doge-main.jpg",
}: TokenToMMPayload) => {
   if (!window?.ethereum) {
      toast.error("Metamask needs to be connected");
      return;
   }

   try {
      await window?.ethereum?.request({
         method: "wallet_watchAsset",
         params: {
            type: tokenType,
            options: {
               address: tokenAddress,
               symbol: tokenSymbol,
               decimals: tokenDecimals,
               image: tokenAvatar,
            },
         },
      });
   } catch (err) {
      toast.error(`Not possible to add ${tokenSymbol} token to MM`);
   }
};
