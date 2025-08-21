import { getTokenName } from "@/services/erc20Service";
import type { SliceAllocation, BuildingNFTData } from "@/types/erc3643/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, ExternalLink, MapPin } from "lucide-react";

type Props = {
   allocation: SliceAllocation;
   buildingData?: BuildingNFTData;
};

export const AllocationBuildingCard = ({ allocation, buildingData }: Props) => {
   const [tokenData, setTokenData] = useState<{ name: string; address: string }>();

   useEffect(() => {
      if (allocation.buildingToken) {
         getTokenName(allocation.buildingToken).then((data) => {
            setTokenData({
               address: allocation.buildingToken,
               name: data[0],
            });
         });
      }
   }, [allocation.buildingToken]);

   if (!tokenData) {
      return null;
   }

   const buildingName = buildingData?.name || tokenData.name;
   const buildingAddress = buildingData?.address;

   const allocationPercent = allocation.actualAllocation;
   const restPercent = 100 - allocationPercent;

   const CardContent = () => (
      <div
         className={`group block p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg transition-all duration-200 `}
      >
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
               <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
               </div>

               <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                     {buildingName}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                     <MapPin className="w-3 h-3 text-gray-400" />
                     <p className="text-sm text-gray-500 font-mono">
                        {buildingAddress
                           ? `${buildingAddress.slice(0, 6)}...${buildingAddress.slice(-4)}`
                           : `${allocation.buildingToken.slice(0, 6)}...${allocation.buildingToken.slice(-4)}`}
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                     {allocation.actualAllocation ? `${allocation.actualAllocation}%` : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">Allocation</p>
               </div>

               {buildingAddress && (
                  <div className="flex-shrink-0">
                     <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                     </div>
                  </div>
               )}
            </div>
         </div>

         {buildingData?.description && (
            <p className="text-sm text-gray-600 mt-3 line-clamp-2">{buildingData.description}</p>
         )}
      </div>
   );

   if (buildingData?.address) {
      return (
         <Link href={`/building/${buildingData.address}`}>
            <CardContent />
         </Link>
      );
   }

   return <CardContent />;
};
