"use client";

import React, { useEffect } from "react";

import BalanceInfo from "@/components/Staking/BalanceInfo";
import ManageStake from "@/components/Staking/ManageStake";
import InfoCard from "@/components/Staking/InfoCard";
import ClaimedRewardsCard from "@/components/Staking/ClaimedRewardsCard";
import StakingShareChart from "@/components/Staking/StakingShareChart";
import StakingValueInfo from "@/components/Staking/StakingValueInfo";
import WhyStake from "@/components/Staking/WhyStake";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useStaking } from "@/components/Staking/hooks";
import { eq } from "lodash";

interface StakingOverviewProps {
   buildingId: string;
}

export const FRIENDLY_ERRORS = {
   NOT_ENOUGH_TOKENS: "You don't have enough tokens to stake. Please, buy tokens before staking.",
   NO_BUILDING_TOKEN: "This building does not have a token.",
   NO_VAULT: "This building does not have a vault.",
   NO_TREASURY: "This building does not have a treasury.",
};

export default function StakingOverview({ buildingId }: StakingOverviewProps) {
   const {
      loadingState,
      treasuryAddress,
      vaultAddress,
      tokenAddress,
      tokenBalance,
      totalStakedTokens,
      userStakedTokens,
      stakeTokens,
      unstakeTokens,
      userRewards,
      userClaimedRewards,
      tvl,
      aTokenBalance,
      aTokenExchangeRate,
   } = useStaking({
      buildingId,
   });

   const equivalentATokenBalance = aTokenBalance * aTokenExchangeRate;

   const isLoading =
      loadingState.isFetchingTokenInfo ||
      loadingState.isFetchingTreasuryAddress ||
      loadingState.isFetchingVaultAddress ||
      loadingState.isFetchingVaultInfo ||
      loadingState.isFetchingTokenPrice ||
      loadingState.isFetchingTokenInfo;

   return (
      <div className="p-6 bg-white rounded-lg">
         {!isLoading &&
            (!tokenAddress ||
               (!tokenBalance && !userStakedTokens) ||
               !vaultAddress ||
               !treasuryAddress) && (
               <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                     <ul>
                        {!tokenAddress && <li>{FRIENDLY_ERRORS.NO_BUILDING_TOKEN}</li>}
                        {!vaultAddress && <li>{FRIENDLY_ERRORS.NO_VAULT}</li>}
                        {!treasuryAddress && <li>{FRIENDLY_ERRORS.NO_TREASURY}</li>}
                        {!tokenBalance && !userStakedTokens && (
                           <li>{FRIENDLY_ERRORS.NOT_ENOUGH_TOKENS}</li>
                        )}
                     </ul>
                  </AlertDescription>
               </Alert>
            )}

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <ManageStake
               isDepositing={loadingState.isDepositing}
               isWithdrawing={loadingState.isWithdrawing}
               disabled={tokenBalance === 0 && !userStakedTokens}
               onStake={stakeTokens}
               onUnstake={unstakeTokens}
            />

            <StakingValueInfo
               isLoading={loadingState.isFetchingVaultInfo || loadingState.isFetchingTokenInfo}
               aTokenBalance={aTokenBalance}
               aTokenExchangeRate={aTokenExchangeRate}
               equivalentATokenBalance={equivalentATokenBalance}
               userStakedTokens={userStakedTokens}
               availableTokens={tokenBalance}
            />

            <InfoCard claimableRewards={userRewards} tvl={tvl} />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="col-span-1">
               <StakingShareChart
                  isLoading={loadingState.isFetchingVaultInfo}
                  totalStakedTokens={totalStakedTokens}
                  userStakedTokens={userStakedTokens}
                  aTokenBalance={aTokenBalance}
                  aTokenExchangeRate={aTokenExchangeRate}
                  equivalentATokenBalance={equivalentATokenBalance}
               />
            </div>
            <div className="col-span-1">
               <BalanceInfo
                  isLoading={loadingState.isFetchingVaultInfo || loadingState.isFetchingTokenInfo}
                  aTokenBalance={aTokenBalance}
                  equivalentATokenBalance={equivalentATokenBalance}
                  aTokenExchangeRate={aTokenExchangeRate}
                  stakedTokens={userStakedTokens}
                  availableTokens={tokenBalance}
               />
            </div>
            <div className="col-span-1">
               <ClaimedRewardsCard userClaimedRewards={userClaimedRewards} />
            </div>
         </div>

         <WhyStake />
      </div>
   );
}
