"use client";

import TradeFormUniswapPool from "@/components/Trade/TradeFormUniswapPool";
import TradePortfolio from "@/components/Trade/TradePortfolio";
import { useSwapsHistory } from "@/hooks/useSwapsHistory";
import type { BuildingData, SwapLiquidityPair } from "@/types/erc3643/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBuildings } from "@/hooks/useBuildings";
import { useMemo, useState } from "react";
import { useBuildingInfo } from "@/hooks/useBuildingInfo";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { WalkthroughStep } from "../Walkthrough";

type Props = {
   building?: BuildingData;
   displayOnBuildingPage?: boolean;
};

export type SwapType = "uniswap" | "oneSided";

// TODO's
// 1. Bring back TradeFormOneSidedExchange form
// 2. Update tx results as links
export default function TradeView({ building, displayOnBuildingPage = false }: Props) {
   const [currentTab, setCurrentTab] = useState<SwapType>("uniswap");
   const { tokenAddress } = useBuildingInfo(building?.address);
   const { name: tokenName, decimals: tokenDecimals } = useTokenInfo(tokenAddress);
   const [selectedTokensPair, setSelectedTokensPair] = useState<SwapLiquidityPair>();
   const buildingTokenOptions = useMemo(
      () => [
         {
            tokenName: tokenName,
            tokenAddress: tokenAddress,
         },
      ],
      [tokenName, tokenAddress],
   );

   const buildingTokenDecimals = useMemo(
      () => ({
         [tokenAddress]: tokenDecimals,
      }),
      [tokenAddress, tokenDecimals],
   );

   const { oneSidedExchangeSwapsHistory, uniswapExchangeHistory } = useSwapsHistory(
      selectedTokensPair!,
      buildingTokenDecimals,
   );

   return (
      <div className="grid grid-cols-2 lg:flex-row gap-8">
         {/* <Tabs className="w-full" value={currentTab}>
            <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger
                  value="uniswap"
                  onClick={() => {
                     setCurrentTab("uniswap");
                  }}
               >
                  Uniswap
               </TabsTrigger>
               <TabsTrigger
                  value="oneSided"
                  onClick={() => {
                     setCurrentTab("oneSided");
                  }}
               >
                  One Sided Exchange
               </TabsTrigger>
            </TabsList>
            <TabsContent value="uniswap">
               
            </TabsContent>
            <TabsContent value="oneSided">
               <div className="min-w-150"></div>
            </TabsContent>
         </Tabs> */}
         <WalkthroughStep
            guideId="USER_INVESTING_GUIDE"
            stepIndex={11}
            title="Time to get money"
            description="This is our Trade View. But before we can buy something we need to have money we can trade with."
            side="right"
            showConfirmButton
         >
            <TradeFormUniswapPool
               displayOnBuildingPage={displayOnBuildingPage}
               buildingTokenOptions={buildingTokenOptions}
               onTokensPairSelected={(tokenA, tokenB) => {
                  setSelectedTokensPair(
                     (prev) =>
                        ({
                           ...prev,
                           ...(!!tokenA && { tokenA }),
                           ...(!!tokenB && { tokenB }),
                        }) as SwapLiquidityPair,
                  );
               }}
            />
         </WalkthroughStep>
         <TradePortfolio
            tradeHistory={
               currentTab === "uniswap" ? uniswapExchangeHistory : oneSidedExchangeSwapsHistory
            }
         />
      </div>
   );
}
