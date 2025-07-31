import { BuildingDetailPage } from "@/components/Buildings/BuildingDetailsPage";
import { fetchBuildingInfo } from "@/hooks/useBuildings/helpers";
import React, { Suspense } from "react";

type Props = {
   params: Promise<{ id: string }>;
};

export default async function Home({ params }: Props) {
   const building = await fetchBuildingInfo(await params.then((res) => res.id));

   if (!building) {
      return <p>Not found</p>;
   }

   return <BuildingDetailPage {...building} />;
}
