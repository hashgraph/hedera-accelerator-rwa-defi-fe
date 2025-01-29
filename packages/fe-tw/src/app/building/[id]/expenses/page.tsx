"use client";

import { ExpensesView } from "@/components/Expenses/ExpensesView";
import { LoadingView } from "@/components/LoadingView";
import { useBuildings } from "@/hooks/useBuildings";
import React, { use, Usable } from "react";

type Props = {
  params: { id: string };
};

export default function ExpensesPage({ params }: Props) {
  const { id } = use<{ id: string }>(params as unknown as Usable<{ id: string }>);
  const { buildings } = useBuildings();

  const building = buildings.find(_building => _building.id === id);

  if (!buildings?.length || !id) {
    return <LoadingView isLoading />;
  } else if (!building) {
    return <p>Not found</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {building.title}: Expenses
      </h1>
      <ExpensesView buildingId={id} />
    </div>
  );
}
