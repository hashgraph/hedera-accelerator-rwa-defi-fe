import { tokenVotesAbi } from "@/services/contracts/abi/tokenVotesAbi";
import { useChain, useEvmAddress, useReadContract } from "@buidlerlabs/hashgraph-react-wallets";
import { ethers, TypedDataDomain } from "ethers";

export const useTokenPermitSignature = () => {
   const { data: evmAddress } = useEvmAddress();
   const { readContract } = useReadContract();
   const { data: chainData } = useChain();

   const getPermitSignature = async (
      tokenAddress: `0x${string}`,
      amount: bigint | number | string,
      spender: `0x${string}`,
      deadline?: number,
      customTokenName?: string,
      customTokenVersion?: string,
   ) => {
      const [tokenName, tokenDecimals, nonce] = (await Promise.all([
         readContract({
            abi: tokenVotesAbi,
            functionName: "name",
            address: tokenAddress,
            args: [],
         }),
         readContract({
            abi: tokenVotesAbi,
            functionName: "decimals",
            address: tokenAddress,
            args: [],
         }),
         readContract({
            address: tokenAddress,
            abi: tokenVotesAbi,
            functionName: "nonces",
            args: [evmAddress],
         }),
      ])) as [string, string, bigint];

      const amountInWei =
         typeof amount === "bigint" ? amount : ethers.parseUnits(String(amount), tokenDecimals);

      const domain: TypedDataDomain = {
         name: customTokenName || tokenName,
         version: customTokenVersion || "1",
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

      const ddLine = deadline === undefined ? Math.floor(Date.now() / 1000 + 600) : deadline;

      const message = {
         owner: evmAddress,
         spender: spender,
         value: String(amountInWei),
         nonce: String(nonce),
         deadline: ddLine,
      };

      if (!window.ethereum) {
         throw new Error("Ethereum provider not found");
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const signatureHash = await signer.signTypedData(domain, types, message);

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
