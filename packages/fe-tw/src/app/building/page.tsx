import { BuildingsOverview } from "@/components/Buildings/BuildingsOverview";
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { convertBuildingNFTsData, readBuildingsList } from "@/services/buildingService";
import { buildingAbi } from "@/services/contracts/abi/buildingAbi";
import { readContract } from "@/services/contracts/readContract";
import { fetchJsonFromIpfs } from "@/services/ipfsService";
import { map, mapValues, reduce } from "lodash";

export default async function BuildingIndexPage() {
   const buildings = await readBuildingsList();

   const buildingNftData = await Promise.all(
      buildings[0].map(async (building: string[]) => {
         const [ipfsInfo, [owner]] = await Promise.all([
            fetchJsonFromIpfs(building[2]),
            readContract({
               address: building[0],
               abi: buildingAbi,
               functionName: "owner",
               args: [],
            }),
         ]);

         return {
            ...ipfsInfo,
            owner,
         };
      }),
   );

   const convertedBuildings = convertBuildingNFTsData(
      buildingNftData.map((data, idx) => ({
         ...data,
         address: buildings[0][idx][0],
         copeIpfsHash: buildings[0][idx][2],
      })),
   );

   const constructedYearOptions = new Set(
      map(convertedBuildings, "info.demographics.constructedYear"),
   );

   const typeOptions = new Set(map(convertedBuildings, "info.demographics.type"));

   const locationOptions = new Set(map(convertedBuildings, "info.demographics.location"));

   const locationTypeOptions = new Set(map(convertedBuildings, "info.demographics.locationType"));

   return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
         <BuildingInfo />
         <BuildingsOverview
            buildings={convertedBuildings}
            filterOptions={{
               constructedYear: Array.from(constructedYearOptions),
               type: Array.from(typeOptions),
               location: Array.from(locationOptions),
               locationType: Array.from(locationTypeOptions),
            }}
         />
      </div>
   );
}

const BuildingInfo = () => {
   return (
      <>
         <Breadcrumb>
            <BreadcrumbList>
               <BreadcrumbItem>
                  <BreadcrumbLink href="/explorer">Explorer</BreadcrumbLink>
               </BreadcrumbItem>
               <BreadcrumbSeparator />
               <BreadcrumbItem>
                  <BreadcrumbPage>Building</BreadcrumbPage>
               </BreadcrumbItem>
            </BreadcrumbList>
         </Breadcrumb>

         <div className="bg-purple-50 px-6 sm:px-8 md:px-10 py-6 rounded-lg">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Buildings Catalogue</h1>
            <p className="text-sm sm:text-base text-gray-700 mb-4">
               Explore the buildings in our ecosystem. Each building is tokenized and forms part of
               the investment opportunities in the platform.
            </p>
         </div>
      </>
   );
};
