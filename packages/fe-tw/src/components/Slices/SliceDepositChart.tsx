"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import * as React from "react";
import { cx } from "class-variance-authority";
import { map } from "lodash";
import { ChartContainer, ChartLegend, ChartLegendContent } from "../ui/chart";

type Props = {
   sliceAllocations: any[];
};

const SliceDepositChart = ({ sliceAllocations }: Props) => {
   const data = map(sliceAllocations, (allocation) => ({
      name: allocation.buildingTokenName,
      value: allocation.balance,
   }));

   const COLORS = ["#6b46c1", "#a78bfa", "#d8b4fe", "#f3e8ff", "#c4b5fd", "#a78bfa"];

   return (
      <div className={cx("flex flex-col flex-auto", { "h-64": true })}>
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
                     <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
               </Pie>
               <Tooltip />
            </PieChart>
         </ResponsiveContainer>
      </div>
   );
};

export default SliceDepositChart;
