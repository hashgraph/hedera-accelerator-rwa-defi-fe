"use client";
import { BuildingCard } from "./BuildingCard";
import { WalkthroughStep } from "../Walkthrough";
import { useWalkthroughStore } from "../Walkthrough/WalkthroughStore";
import type { BuildingData } from "@/types/erc3643/types";

interface BuildingsOverviewProps {
   buildings: BuildingData[];
}

export function BuildingsOverview({ buildings }: BuildingsOverviewProps) {
   return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {buildings.map((building: BuildingData, idx: number) =>
            idx === 0 ? (
               <WalkthroughStep
                  key={building.id}
                  guideId={"USER_INVESTING_GUIDE"}
                  stepIndex={3}
                  title="Great job!"
                  description="Here you can see all the buildings that are available for investment. Now let's select the first building and see what we can do further."
                  side="left"
               >
                  {({ confirmUserPassedStep }) => (
                     <BuildingCard building={building} onClick={confirmUserPassedStep} />
                  )}
               </WalkthroughStep>
            ) : (
               <BuildingCard key={building.id} building={building} />
            ),
         )}
      </div>
   );
}
