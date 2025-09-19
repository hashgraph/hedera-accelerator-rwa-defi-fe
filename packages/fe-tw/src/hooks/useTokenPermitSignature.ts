import { config } from "@/config";
import { tokenVotesAbi } from "@/services/contracts/abi/tokenVotesAbi";
import { ethers, TypedDataDomain } from "ethers";
import { useAccount } from "wagmi";
import { readContract, signTypedData } from "wagmi/actions";

export const useTokenPermitSignature = () => {
   const { address: evmAddress, chain } = useAccount();

   const getPermitSignature = async (
      tokenAddress: `0x${string}`,
      amount: bigint | number | string,
      spender: `0x${string}`,
      deadline?: number,
   ) => {
      const [tokenName, tokenDecimals, nonce] = await Promise.all([
         readContract(config, {
            abi: tokenVotesAbi,
            functionName: "name",
            address: tokenAddress,
            args: [],
         }),
         readContract(config, {
            abi: tokenVotesAbi,
            functionName: "decimals",
            address: tokenAddress,
            args: [],
         }),
         readContract(config, {
            address: tokenAddress,
            abi: tokenVotesAbi,
            functionName: "nonces",
            args: [evmAddress!],
         }),
      ]);

      const amountInWei =
         typeof amount === "bigint" ? amount : ethers.parseUnits(String(amount), tokenDecimals);

      const domain = {
         name: tokenName,
         version: "1",
         chainId: chain?.id!,
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
      const primaryType = "Permit";

      const ddLine = deadline === undefined ? Math.floor(Date.now() / 1000 + 600) : deadline;

      const message = {
         owner: evmAddress,
         spender: spender,
         value: String(amountInWei),
         nonce: String(nonce),
         deadline: ddLine,
      };

      const signatureHash = await signTypedData(config, {
         domain,
         types,
         primaryType,
         message,
      });

      const { v, r, s } = ethers.Signature.from(signatureHash);

      return {
         tokenAddress,
         spender,
         amount: amountInWei,
         deadline: BigInt(ddLine),
         v,
         r,
         s,
      };
   };

   return { getPermitSignature };
};
