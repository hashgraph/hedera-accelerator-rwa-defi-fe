"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as React from "react";

type StakingValueInfoProps = {
   isLoading: boolean;
   aTokenBalance: number | undefined;
   aTokenExchangeRate: number | undefined;
   equivalentATokenBalance: number | undefined;
   userStakedTokens: number | undefined;
   availableTokens: number | undefined;
};

export default function StakingValueInfo({
   isLoading,
   aTokenBalance,
   aTokenExchangeRate,
   equivalentATokenBalance,
   userStakedTokens,
   availableTokens,
}: StakingValueInfoProps) {
   const totalTokens =
      (userStakedTokens || 0) + (equivalentATokenBalance || 0) + (availableTokens || 0);
   const hasTokens = totalTokens > 0;

   return (
      <Card>
         <CardHeader>
            <CardTitle>Your Token Holdings</CardTitle>
            <CardDescription>Overview of your staked and available tokens</CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
            {isLoading ? (
               <div className="flex justify-center">
                  <span className="loading loading-spinner" />
               </div>
            ) : !hasTokens ? (
               <p className="text-center text-muted-foreground">No tokens held</p>
            ) : (
               <div className="space-y-3">
                  {(availableTokens || 0) > 0 && (
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                           <p className="font-semibold text-gray-900">Available Tokens</p>
                           <p className="text-sm text-gray-600">Ready to stake</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                           {availableTokens?.toFixed(2) || "0.00"}
                        </p>
                     </div>
                  )}

                  {(userStakedTokens || 0) > 0 && (
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                           <p className="font-semibold text-gray-900">vTokens (Staked)</p>
                           <p className="text-sm text-gray-600">Direct staking rewards</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                           {userStakedTokens?.toFixed(2) || "0.00"}
                        </p>
                     </div>
                  )}

                  {(aTokenBalance || 0) > 0 && (
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                           <p className="font-semibold text-gray-900">aTokens (Auto-compound)</p>
                           <p className="text-sm text-gray-600">
                              {aTokenBalance?.toFixed(2)} aTokens * {aTokenExchangeRate?.toFixed(2)}{" "}
                              rate
                           </p>
                           <p className="text-xs text-gray-500">Converted to building tokens</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                           {equivalentATokenBalance?.toFixed(2) || "0.00"}
                        </p>
                     </div>
                  )}

                  <div className="flex justify-between items-center p-3 bg-indigo-100 rounded-lg border border-indigo-200">
                     <div>
                        <p className="font-semibold text-indigo-900">Total Value</p>
                        <p className="text-sm text-indigo-700">Combined token holdings</p>
                     </div>
                     <p className="text-xl font-bold text-indigo-900">{totalTokens.toFixed(2)}</p>
                  </div>
               </div>
            )}
         </CardContent>
      </Card>
   );
}
