"use client";

import type { SwapTradeItem, SwapTradeProfit } from "@/types/erc3643/types";
import { History } from "lucide-react";
import { Card, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";

interface Props {
   tradeHistory: SwapTradeItem[];
}

const TradePortfolioItem = (props: SwapTradeItem) => {
   const formatNumber = (value: string) => {
      const num = parseFloat(value);
      if (num >= 1000) {
         return num.toFixed(0);
      } else if (num >= 1) {
         return num.toFixed(4);
      } else {
         return num.toFixed(4);
      }
   };

   const isSelling = props.isSell === true;

   return (
      <div className="bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors shadow-sm">
         <div className="p-4">
            <div className="flex items-center justify-between mb-3">
               <p className="text-sm text-gray-900 font-semibold">Trade #{props.id}</p>
               {props.isSell !== undefined && (
                  <Badge color={isSelling ? "red" : "green"}>{isSelling ? "SELL" : "BUY"}</Badge>
               )}
            </div>
            <div className="flex items-center justify-between space-x-4">
               <div className="flex-1 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                     {props.tokenA}
                  </p>
                  <p
                     className={`text-lg font-bold ${
                        props.isSell !== undefined && isSelling ? "text-red-600" : "text-gray-900"
                     }`}
                  >
                     {formatNumber(props.tokenAAmount)}
                  </p>
               </div>

               <div className="flex items-center space-x-1">
                  {props.isSell !== undefined ? (
                     <div className="flex items-center">
                        {isSelling ? (
                           <>
                              <div className="w-8 h-0.5 bg-gradient-to-r from-red-400 to-green-400"></div>
                              <div className="w-0 h-0 border-l-[8px] border-l-green-400 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent"></div>
                           </>
                        ) : (
                           <>
                              <div className="w-0 h-0 border-r-[8px] border-r-green-400 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent"></div>
                              <div className="w-8 h-0.5 bg-gradient-to-r from-green-400 to-red-400"></div>
                           </>
                        )}
                     </div>
                  ) : (
                     <>
                        <div className="flex items-center">
                           <div className="w-6 h-0.5 bg-gradient-to-r from-indigo-400 to-emerald-400"></div>
                           <div className="w-0 h-0 border-l-[6px] border-l-emerald-400 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
                        </div>
                        <div className="flex items-center">
                           <div className="w-0 h-0 border-r-[6px] border-r-indigo-400 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
                           <div className="w-6 h-0.5 bg-gradient-to-r from-emerald-400 to-indigo-400"></div>
                        </div>
                     </>
                  )}
               </div>

               <div className="flex-1 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                     {props.tokenB}
                  </p>
                  <p
                     className={`text-lg font-bold ${
                        props.isSell !== undefined && !isSelling
                           ? "text-green-600"
                           : "text-gray-900"
                     }`}
                  >
                     {formatNumber(props.tokenBAmount)}
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default function TradePortfolio({ tradeHistory }: Props) {
   return (
      <Card variant="emerald">
         <CardHeader
            icon={<History />}
            title="Trade History"
            description="View your completed token swaps"
         />
         <div className="p-6">
            {tradeHistory?.length > 0 ? (
               <div
                  className="flex flex-col gap-4"
                  style={{ overflowY: "scroll", maxHeight: "50em" }}
               >
                  {tradeHistory.map((tradeItem, index) => (
                     <TradePortfolioItem key={index} {...tradeItem} />
                  ))}
               </div>
            ) : (
               <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No trades yet</h3>
                  <p className="text-gray-500">
                     Your trade history will appear here once you start swapping tokens
                  </p>
               </div>
            )}
         </div>
      </Card>
   );
}
