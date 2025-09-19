"use client";

import { LoadingView } from "@/components/LoadingView/LoadingView";
import TradeView from "@/components/Trade/TradeView";
import { useBuilding } from "@/hooks/useBuildings";
import React, { use, type Usable } from "react";
import { useAccount } from "wagmi";

type Props = {
   params: Promise<{ id: string }>;
};

export default function TradePage({ params }: Props) {
   const { id } = use<{ id: string }>(params as unknown as Usable<{ id: string }>);
   const { data: building, isLoading } = useBuilding(id);
   const { address: evmAddress } = useAccount();

   if (isLoading) return <LoadingView isLoading />;

   if (!evmAddress) {
      return <p className="font-bold">This page available only for authorized users</p>;
   }

   if (!building) {
      return <p className="font-bold">Not found</p>;
   }

   return (
      <div className="p-4 flex flex-col gap-10">
         <h1 className="text-2xl font-bold mb-4">{building.title}: Trade</h1>
         <TradeView building={building} displayOnBuildingPage />
      </div>
   );
}
