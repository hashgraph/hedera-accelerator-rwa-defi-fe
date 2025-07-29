import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { fetchJsonFromIpfs } from "@/services/ipfsService";
import { convertBuildingNFTsData, readBuildingsList } from "@/services/buildingService";
import Image from "next/image";
import { readContract } from "@/services/contracts/readContract";
import { buildingAbi } from "@/services/contracts/abi/buildingAbi";
import { Badge } from "../ui/badge";
import { BuildingCard } from "./BuildingCard";

export async function BuildingsOverview() {
   const buildings = await readBuildingsList();
   const buildingNftData = await Promise.all(
      buildings[0].map(async (building: string[]) => ({
         ...(await fetchJsonFromIpfs(building[2])),
         owner: (
            await readContract({
               address: building[0],
               abi: buildingAbi,
               functionName: "owner",
               args: [],
            })
         )[0],
      })),
   );

   const convertedBuildings = convertBuildingNFTsData(
      buildingNftData.map((data, idx) => ({
         ...data,
         address: buildings[0][idx][0],
         copeIpfsHash: buildings[0][idx][2],
      })),
   );

   return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {convertedBuildings.map((building) => (
            <BuildingCard key={building.id} building={building} />
         ))}
      </div>
   );
}
