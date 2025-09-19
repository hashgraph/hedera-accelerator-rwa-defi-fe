import { useQuery } from "@tanstack/react-query";
import { basicVaultAbi } from "@/services/contracts/abi/basicVaultAbi";
import { VaultInfo } from "@/components/Staking/types";
import { useAccount } from "wagmi";
import { config } from "@/config";
import { readContract } from "wagmi/actions";

export const useVaultData = (
   vaultAddress: string | undefined,
   tokenDecimals: number | undefined,
) => {
   const { address: evmAddress } = useAccount();

   return useQuery({
      queryKey: ["VAULT_INFO", vaultAddress, evmAddress],
      queryFn: async (): Promise<VaultInfo | null> => {
         if (!vaultAddress || !evmAddress || !tokenDecimals) return null;

         const [totalAssets, myBalance, rewardTokens] = await Promise.all([
            readContract(config, {
               address: vaultAddress as `0x${string}`,
               abi: basicVaultAbi,
               functionName: "totalAssets",
            }),
            readContract(config, {
               address: vaultAddress as `0x${string}`,
               abi: basicVaultAbi,
               functionName: "balanceOf",
               args: [evmAddress],
            }),
            readContract(config, {
               address: vaultAddress as `0x${string}`,
               abi: basicVaultAbi,
               functionName: "getRewardTokens",
            }),
         ]);

         return {
            totalStakedTokens: Number(totalAssets) / 10 ** tokenDecimals,
            userStakedTokens: Number(myBalance) / 10 ** tokenDecimals,
            rewardTokens: rewardTokens as string[],
         };
      },
      enabled: Boolean(vaultAddress) && Boolean(evmAddress) && Boolean(tokenDecimals),
   });
};
