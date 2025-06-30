"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import * as React from "react";
import { cx } from "class-variance-authority";

type Props = {
    totalStaked: Number,
    totalUserStaked: number,
};

const SliceDepositChart = ({ totalStaked, totalUserStaked }: Props) => {
    const data = [
        { name: "Your Slice staked tokens", value: totalUserStaked },
        { name: "Total Slice staked tokens", value: totalStaked },
    ];

    const COLORS = ["#6b46c1", "#a78bfa"];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Slice Deposit Amounts</CardTitle>
                <CardDescription>Overview of Slice deposits</CardDescription>
            </CardHeader>
            <CardContent
                className={cx("flex flex-col flex-auto", { "h-64": true })}
            >
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
            </CardContent>
        </Card>
    );
};

export default SliceDepositChart;
