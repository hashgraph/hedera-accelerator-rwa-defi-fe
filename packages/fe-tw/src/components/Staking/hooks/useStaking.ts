import { ethers } from "ethers";
import { useBuildingInfo } from "@/hooks/useBuildingInfo";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { Transaction, UserClaimedReward } from "@/components/Staking/types";
import { useAutoCompounder } from "./useAutoCompounder";
import { useTokenPrice } from "./useTokenPrice";
import { useVaultData } from "./useVaultData";
import { useUserClaimedRewards } from "./useUserClaimedRewards";
import { useUserRewards } from "./useUserRewards";
import { useVaultStakingTransactions } from "./useVaultStakingTransactions";

interface StakingLoadingState {
   isDepositing: boolean;
   isWithdrawing: boolean;
   isClaimingVault: boolean;
   isClaimingAutoCompounder: boolean;
   isFetchingTokenInfo: boolean;
   isFetchingVaultInfo: boolean;
   isFetchingTreasuryAddress: boolean;
   isFetchingVaultAddress: boolean;
   isFetchingTokenPrice: boolean;
   isClaimingAutoCompounderUserRewards: boolean;
}

interface StakingData {
   treasuryAddress: string | undefined;
   vaultAddress: string | undefined;
   tokenAddress: string | undefined;
   tokenBalance: number | undefined;
   autoCompounderAddress: string | undefined;
   totalStakedTokens: number | undefined;
   userStakedTokens: number | undefined;
   userClaimedRewards: UserClaimedReward[];
   rewardTokens: string[];
   userRewards: number | undefined;
   autoCompounderRewards: number | undefined;
   aTokenTotalSupply: number | undefined;
   tokenPriceInUSDC: number | undefined;
   tvl: number | undefined;
   aTokenBalance: number | undefined;
   aTokenExchangeRate: number | undefined;
}

interface StakingActions {
   stakeTokens: (params: { amount: number; isAutoCompounder: boolean }) => Promise<{
      approveTx: Transaction;
      depositTx: Transaction;
   }>;
   unstakeTokens: (params: { amount: number; isAutoCompounder: boolean }) => Promise<Transaction>;
   claimVaultRewards: () => Promise<Transaction>;
   claimAutoCompounderRewards: () => Promise<Transaction>;
   claimAutoCompounderUserRewards: () => Promise<Transaction>;
}

interface StakingHookReturnParams extends StakingData, StakingActions {
   loadingState: StakingLoadingState;
}

export const useStaking = ({ buildingId }: { buildingId: string }): StakingHookReturnParams => {
   const {
      tokenAddress,
      vaultAddress,
      treasuryAddress,
      autoCompounderAddress,
      isLoading: isFetchingAddresses,
   } = useBuildingInfo(buildingId);
   const tokenInfo = useTokenInfo(tokenAddress);

   const {
      data: vaultInfo,
      isLoading: isFetchingVaultInfo,
      refetch: refetchVaultInfo,
   } = useVaultData(vaultAddress, tokenInfo?.decimals);

   const { data: tokenPrice, isLoading: isFetchingTokenPrice } = useTokenPrice(
      tokenAddress,
      tokenInfo?.decimals,
   );

   const { vault: vaultRewards, autoCompounder: autoCompounderRewards } = useUserRewards(
      vaultAddress,
      vaultInfo?.rewardTokens[0],
      autoCompounderAddress,
   );

   const userClaimedRewards = useUserClaimedRewards(vaultAddress);
   const {
      stake: stakeToVault,
      unstake: unstakeFromVault,
      claim: claimFromVault,
      isDepositing,
      isWithdrawing,
      isClaiming: isClaimingVault,
   } = useVaultStakingTransactions(tokenAddress, vaultAddress);

   const {
      stake: handleStakeToAutoCompounder,
      unstake: handleUnstakeFromAutoCompounder,
      claim: claimFromAutoCompounder,
      claimUserRewards,
      aTokenTotalSupply,
      aTokenBalance,
      aTokenExchangeRate,
      isDepositing: isDepositingAutoCompounder,
      isWithdrawing: isWithdrawingAutoCompounder,
      isClaiming: isClaimingAutoCompounder,
      isClaimingUserRewards,
      refetch: refetchAutoCompounder,
   } = useAutoCompounder(autoCompounderAddress, tokenAddress, tokenInfo?.decimals);

   const tvl = (vaultInfo?.totalStakedTokens || 0) * (tokenPrice || 0);
   const tokenBalance = tokenInfo?.balanceOf
      ? Number(ethers.formatUnits(tokenInfo.balanceOf, tokenInfo.decimals || 18))
      : undefined;

   const handleStake = async ({
      amount,
      isAutoCompounder,
   }: {
      amount: number;
      isAutoCompounder: boolean;
   }) => {
      let tx;

      if (isAutoCompounder && autoCompounderAddress) {
         tx = await handleStakeToAutoCompounder({ amount });
         await refetchAutoCompounder();
      } else {
         tx = await stakeToVault({ amount });
      }

      await refetchVaultInfo();
      await tokenInfo?.refetch();

      return tx;
   };

   const handleUnstake = async ({
      amount,
      isAutoCompounder,
   }: {
      amount: number;
      isAutoCompounder: boolean;
   }) => {
      let tx;

      if (isAutoCompounder && autoCompounderAddress) {
         tx = await handleUnstakeFromAutoCompounder({ amount });
         await refetchAutoCompounder();
      } else {
         tx = await unstakeFromVault({ amount });
      }

      await refetchVaultInfo();
      await tokenInfo?.refetch();

      return tx;
   };

   const handleClaimVault = async () => {
      const tx = await claimFromVault();
      await refetchVaultInfo();
      await tokenInfo?.refetch();
      return tx;
   };

   const handleClaimAutoCompounder = async () => {
      const tx = await claimFromAutoCompounder();
      await refetchAutoCompounder();
      await refetchVaultInfo();
      await tokenInfo?.refetch();
      return tx;
   };

   const handleClaimAutoCompounderUserRewards = async () => {
      const tx = await claimUserRewards();
      await refetchAutoCompounder();
      await refetchVaultInfo();
      await tokenInfo?.refetch();
      return tx;
   };

   return {
      loadingState: {
         isDepositing: isDepositing || isDepositingAutoCompounder,
         isWithdrawing: isWithdrawing || isWithdrawingAutoCompounder,
         isClaimingVault,
         isClaimingAutoCompounder,
         isClaimingAutoCompounderUserRewards: isClaimingUserRewards || false,
         isFetchingTokenInfo: tokenInfo?.isLoading || false,
         isFetchingVaultInfo,
         isFetchingTreasuryAddress: isFetchingAddresses,
         isFetchingVaultAddress: isFetchingAddresses,
         isFetchingTokenPrice,
      },

      treasuryAddress,
      vaultAddress,
      tokenAddress,
      autoCompounderAddress,
      tokenBalance,

      aTokenTotalSupply,
      aTokenExchangeRate,
      aTokenBalance,
      totalStakedTokens: vaultInfo?.totalStakedTokens,
      userStakedTokens: vaultInfo?.userStakedTokens,
      rewardTokens: vaultInfo?.rewardTokens || [],
      userRewards: vaultRewards?.data,
      autoCompounderRewards: autoCompounderRewards?.data,
      userClaimedRewards,
      tokenPriceInUSDC: tokenPrice,
      tvl,

      stakeTokens: handleStake,
      unstakeTokens: handleUnstake,
      claimVaultRewards: handleClaimVault,
      claimAutoCompounderRewards: handleClaimAutoCompounder,
      claimAutoCompounderUserRewards: handleClaimAutoCompounderUserRewards,
   };
};
