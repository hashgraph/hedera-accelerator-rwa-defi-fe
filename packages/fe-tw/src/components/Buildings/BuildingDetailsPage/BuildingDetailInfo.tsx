"use client";
import { useTreasuryData } from "@/components/Payments/hooks";
import { useStaking } from "@/components/Staking/hooks";
import { WalkthroughStep } from "@/components/Walkthrough";
import { useBuildingInfo } from "@/hooks/useBuildingInfo";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import type { BuildingInfo } from "@/types/erc3643/types";
import { isNumber, map, reduce, zipObject } from "lodash";
import { useParams } from "next/navigation";

const ScientificNotation = ({ value }: { value: number }) => {
   if (value < 1_000_000_000) {
      return <span>{value.toLocaleString()}</span>;
   }
   if (value <= 1e13) {
      return (
         <span>
            {new Intl.NumberFormat("en-US", {
               notation: "compact",
               compactDisplay: "long",
            }).format(value)}
         </span>
      );
   }

   const exponentialStr = value.toExponential(2);
   const [coefficient, exponent] = exponentialStr.split("e");
   const exp = parseInt(exponent, 10);

   return (
      <span>
         {coefficient} × 10<sup>{exp}</sup>
      </span>
   );
};

export const BuildingDetailInfo = (props: BuildingInfo) => {
   const { id } = useParams();
   const { tokenAddress, treasuryAddress } = useBuildingInfo(id as string);
   const { tokenPriceInUSDC, totalSupply, balanceOf, isLoading } = useTokenInfo(tokenAddress);
   const { reserve } = useTreasuryData(treasuryAddress, id as string);
   const { userStakedTokens, aTokenBalance, userClaimedRewards } = useStaking({
      buildingId: id as string,
   });

   const accumulatedUserRewards = reduce(
      userClaimedRewards,
      (acc, reward) => acc + Number(reward.amount),
      0,
   );

   if (isLoading) {
      return null;
   }
   const { demographics, financial } = props;

   return (
      <div className="grid grid-cols-2 gap-4 sm:gap-8 sm:grid-cols-1 lg:grid-cols-2 mt-16">
         <WalkthroughStep
            guideId="USER_INVESTING_GUIDE"
            stepIndex={4}
            title="Great job!"
            description="Here you can see all the information about the building, including financial and demographic data."
            side="right"
            showConfirmButton
         >
            <article className="prose">
               <h3 className="font-bold text-purple-700 text-xl">Financial</h3>
            </article>

            <div className="grid grid-cols-2 gap-2 mt-4">
               <span className="font-semibold text-sm">Tokens owned:</span>
               <span className="text-sm">
                  <ScientificNotation value={Number(balanceOf)} />
               </span>
               <span className="font-semibold text-sm">Percentage owned of Overall property:</span>
               <span className="text-sm">
                  {balanceOf === BigInt(0)
                     ? 0
                     : ((Number(balanceOf) / Number(totalSupply)) * 100).toFixed(2)}
                  % &nbsp;
               </span>
               {isNumber(userStakedTokens) && Number(userStakedTokens) > 0 && (
                  <>
                     <span className="font-semibold text-sm">Total tokens staked:</span>
                     <span className="text-sm">
                        <ScientificNotation value={userStakedTokens} />
                     </span>
                  </>
               )}
               {isNumber(aTokenBalance) && Number(aTokenBalance) > 0 && (
                  <>
                     <span className="font-semibold text-sm">Total aTokens owned:</span>
                     <span className="text-sm">
                        <ScientificNotation value={aTokenBalance} />
                     </span>
                  </>
               )}
               {isNumber(accumulatedUserRewards) && accumulatedUserRewards > 0 && (
                  <>
                     <span className="font-semibold text-sm">Total rewards claimed:</span>
                     <span className="text-sm">
                        <ScientificNotation value={accumulatedUserRewards} />
                        &nbsp;
                        <span className="text-xs text-gray-500">(USDC)</span>
                     </span>
                  </>
               )}
               {isNumber(tokenPriceInUSDC) && Number(tokenPriceInUSDC) > 0 && (
                  <>
                     <span className="font-semibold text-sm">Token price:</span>
                     <span>
                        <span className="text-sm">{Number(tokenPriceInUSDC).toPrecision(3)}</span>
                        &nbsp;
                        <span className="text-xs text-gray-500">(USDC)</span>
                     </span>
                  </>
               )}
               {reserve && (
                  <>
                     <span className="font-semibold text-sm">Treasury maximum reserve:</span>
                     <span>
                        <span className="text-sm">{<ScientificNotation value={reserve} />}</span>
                        &nbsp;
                        <span className="text-xs text-gray-500">(USDC)</span>
                     </span>
                  </>
               )}
            </div>
         </WalkthroughStep>

         <div>
            <article className="prose">
               <h3 className="font-bold text-purple-700 text-xl">Demographics</h3>
            </article>
            <div className="grid grid-cols-2 gap-2 mt-4">
               <span className="font-semibold text-sm">Constructed:</span>
               <span className="text-sm">{demographics.constructedYear}</span>
               <span className="font-semibold text-sm">Type:</span>
               <span className="text-sm">{demographics.type}</span>
               <span className="font-semibold text-sm">Location:</span>
               <span className="text-sm">{demographics.location}</span>
               <span className="font-semibold text-sm">Location Type:</span>
               <span className="text-sm">{demographics.locationType}</span>
            </div>
         </div>
      </div>
   );
};
