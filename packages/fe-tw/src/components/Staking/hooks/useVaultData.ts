import { useEvmAddress, useReadContract } from "@buidlerlabs/hashgraph-react-wallets";
import { useQuery } from "@tanstack/react-query";
import { basicVaultAbi } from "@/services/contracts/abi/basicVaultAbi";
import { VaultInfo } from "@/components/Staking/types";

export const useVaultData = (
   vaultAddress: string | undefined,
   tokenDecimals: number | undefined,
) => {
   const { readContract } = useReadContract();
   const { data: evmAddress } = useEvmAddress();

   return useQuery({
      queryKey: ["VAULT_INFO", vaultAddress, evmAddress],
      queryFn: async (): Promise<VaultInfo | null> => {
         if (!vaultAddress || !evmAddress || !tokenDecimals) return null;

         const [totalAssets, myBalance] = await Promise.all([
            readContract({
               address: vaultAddress as `0x${string}`,
               abi: basicVaultAbi,
               functionName: "totalAssets",
            }),
            readContract({
               address: vaultAddress as `0x${string}`,
               abi: basicVaultAbi,
               functionName: "balanceOf",
               args: [evmAddress],
            }),
            // readContract({
            //    address: vaultAddress as `0x${string}`,
            //    abi: basicVaultAbi,
            //    functionName: "getRewardTokens",
            // }),
         ]);

         return {
            totalStakedTokens: Number(totalAssets) / 10 ** tokenDecimals,
            userStakedTokens: Number(myBalance) / 10 ** tokenDecimals,
            rewardTokens: [],
         };
      },
      enabled: Boolean(vaultAddress) && Boolean(evmAddress) && Boolean(tokenDecimals),
   });
};
