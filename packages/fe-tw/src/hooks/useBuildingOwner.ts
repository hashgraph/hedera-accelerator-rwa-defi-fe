import { useQuery } from "@tanstack/react-query";
import { buildingAbi } from "@/services/contracts/abi/buildingAbi";
import { readContract } from "@/services/contracts/readContract";

export const useBuildingOwner = (buildingAddress: `0x${string}`) => {
   const { data: buildingOwnerAddress, isLoading } = useQuery({
      queryKey: ["BUILDING_ADMIN", buildingAddress],
      queryFn: async () => {
         const [data] = await readContract({
            address: buildingAddress,
            abi: buildingAbi,
            functionName: "owner",
            args: [],
         });
         return data?.toLowerCase();
      },
      enabled: Boolean(buildingAddress),
   });

   return { buildingOwnerAddress, isLoading };
};
