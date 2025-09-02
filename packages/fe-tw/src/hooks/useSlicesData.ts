import { sliceFactoryAbi } from "@/services/contracts/abi/sliceFactoryAbi";
import { SLICE_FACTORY_ADDRESS } from "@/services/contracts/addresses";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import { fetchJsonFromIpfs } from "@/services/ipfsService";
import type { SliceData } from "@/types/erc3643/types";
import { prepareStorageIPFSfileURL } from "@/utils/helpers";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBuildings } from "./useBuildings";
import { readSliceAllocations, readSliceMetdataUri } from "@/services/sliceService";
import { get } from "lodash";

export function useSlicesData() {
   const [sliceLogs, setSliceLogs] = useState<any[]>([]);

   const { buildings, buildingsInfo } = useBuildings();

   useEffect(() => {
      const unsubscribe = watchContractEvent({
         address: SLICE_FACTORY_ADDRESS,
         abi: sliceFactoryAbi,
         eventName: "SliceDeployed",
         onLogs: (data) => {
            setSliceLogs((prev) => [...prev, ...data]);
         },
      });

      return () => unsubscribe();
   }, []);

   const sliceAddresses = useMemo<`0x${string}`[]>(
      () => sliceLogs.map((log) => log.args[0] as `0x${string}`),
      [sliceLogs],
   );

   const { data: slices = [] } = useQuery({
      queryKey: ["slices", sliceAddresses],
      enabled: sliceAddresses.length > 0,
      staleTime: 60_000,
      queryFn: async (): Promise<SliceData[]> => {
         const uris = await Promise.all(sliceAddresses.map((addr) => readSliceMetdataUri(addr)));
         const metadatas = await Promise.all(
            uris.map((uriArr: string[]) => fetchJsonFromIpfs(uriArr[0])),
         );

         return metadatas.map((m, idx) => ({
            id: sliceAddresses[idx],
            address: sliceAddresses[idx],
            name: m.name,
            allocation: m.allocation,
            description: m.description,
            imageIpfsUrl: prepareStorageIPFSfileURL(
               (m.sliceImageIpfsId || m.sliceImageIpfsHash)?.replace("ipfs://", ""),
            ),
            endDate: m.endDate,
            estimatedPrice: 0,
         }));
      },
   });

   const { data: slicesAllocationsData = [] } = useQuery({
      queryKey: ["sliceAllocations", sliceAddresses.map((addr) => `alloc_${addr}`)],
      enabled: sliceAddresses.length > 0,
      staleTime: 60_000,
      queryFn: async () => {
         const results = await Promise.allSettled(
            sliceAddresses.map((addr) => readSliceAllocations(addr)),
         );

         return results.map((res, idx) => {
            if (res.status !== "fulfilled" || !res.value) {
               return { buildingToken: null as `0x${string}` | null, slice: sliceAddresses[idx] };
            }
            const v = res.value as any;
            const buildingToken = get(v, "[0][1][1]", null) as `0x${string}` | null;
            return { buildingToken, slice: sliceAddresses[idx] } as {
               buildingToken: `0x${string}` | null;
               slice: `0x${string}`;
            };
         });
      },
   });

   const buildingToSlices = useMemo(() => {
      if (
         slicesAllocationsData.length === 0 ||
         (buildings?.length ?? 0) === 0 ||
         (buildingsInfo?.length ?? 0) === 0
      ) {
         return {} as { [key: `0x${string}`]: SliceData[] };
      }

      const byAddress: { [key: `0x${string}`]: SliceData[] } = {};

      buildings?.forEach((building) => {
         const tokensForBuilding = buildingsInfo?.filter(
            (tok) => tok.buildingAddress === building.address,
         );

         if (!tokensForBuilding?.length) return;

         const matchedSlices = slicesAllocationsData
            .filter((alloc) =>
               tokensForBuilding.some((tok) => tok.tokenAddress === alloc.buildingToken),
            )
            .map((alloc) => slices.find((s) => s.address === alloc.slice))
            .filter(Boolean) as SliceData[];

         if (matchedSlices.length) {
            byAddress[building.address!] = matchedSlices;
         }
      });

      return byAddress;
   }, [slicesAllocationsData, buildingsInfo, buildings, slices]);

   return {
      sliceAddresses,
      slicesAllocationsData,
      slices,
      buildingToSlices,
   };
}
