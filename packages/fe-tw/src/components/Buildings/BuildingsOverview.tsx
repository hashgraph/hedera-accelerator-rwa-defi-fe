"use client";
import { BuildingCard } from "./BuildingCard";
import { WalkthroughStep } from "../Walkthrough";
import { useWalkthroughStore } from "../Walkthrough/WalkthroughStore";
import type { BuildingData } from "@/types/erc3643/types";
import { FormSelect } from "../ui/formSelect";
import { SelectItem, SelectSeparator } from "../ui/select";
import { useState } from "react";
import { filter, get, isMatch, matches } from "lodash";
import { parseAsString, useQueryState, useQueryStates } from "nuqs";
import { useFilter } from "@/hooks/useFilter";
import { BuildingFilter } from "./BuildingsFilter";

interface FilterOptions {
   constructedYear?: string[];
   type?: string[];
   location?: string[];
   locationType?: string[];
}

interface BuildingsOverviewProps {
   buildings: BuildingData[];
   filterOptions: FilterOptions;
}

export function BuildingsOverview({ buildings, filterOptions }: BuildingsOverviewProps) {
   const { filteredItems, filterState, handleFilterChange } = useFilter(buildings, filterOptions, {
      filterPropertiesPath: "info.demographics",
   });

   return (
      <>
         <BuildingFilter
            options={filterOptions}
            filterState={filterState}
            onFilterChange={handleFilterChange}
         />
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((building: BuildingData, idx: number) =>
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
      </>
   );
}
