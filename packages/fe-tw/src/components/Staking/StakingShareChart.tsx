"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import * as React from "react";
import { cx } from "class-variance-authority";

type StakingShareChartProps = {
   isLoading: boolean;
   totalStakedTokens: number | undefined;
   userStakedTokens: number | undefined;
   aTokenBalance: number | undefined;
   equivalentATokenBalance: number | undefined;
};

const StakingShareChart = ({
   isLoading,
   totalStakedTokens,
   userStakedTokens,
   aTokenBalance,
   equivalentATokenBalance,
}: StakingShareChartProps) => {
   const data = [
      { name: "Your vTokens", value: userStakedTokens },
      { name: "Your aTokens Equivalent", value: equivalentATokenBalance },
      {
         name: "Other Stakers",
         value: totalStakedTokens
            ? totalStakedTokens - userStakedTokens - equivalentATokenBalance
            : 0,
      },
   ];

   const COLORS = ["#6b46c1", "#a78bfa", "#E5E5E5"];

   return (
      <Card>
         <CardHeader>
            <CardTitle>Your Staking Share</CardTitle>
            {!isLoading && totalStakedTokens === 0 && (
               <CardDescription>No tokens staked yet</CardDescription>
            )}

            {aTokenBalance !== 0 && (
               <CardDescription className="text-xs text-muted-foreground">
                  aTokens represented as underlying building tokens (aTokens × exchange rate)
               </CardDescription>
            )}
         </CardHeader>
         <CardContent
            className={cx("flex flex-col flex-auto", { "h-64": totalStakedTokens !== 0 })}
         >
            {isLoading ? (
               <span className="loading loading-spinner" />
            ) : (
               totalStakedTokens !== 0 && (
                  <ResponsiveContainer>
                     <PieChart>
                        <Pie
                           data={data}
                           dataKey="value"
                           nameKey="name"
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           isAnimationActive={true}
                           animationDuration={800}
                           animationBegin={0}
                        >
                           {data.map((entry, index) => (
                              <Cell
                                 key={`cell-${entry.name}`}
                                 fill={COLORS[index % COLORS.length]}
                              />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
               )
            )}
         </CardContent>
      </Card>
   );
};

export default StakingShareChart;
