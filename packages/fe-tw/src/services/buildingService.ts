import { mockTokenToBuildingMap } from "@/consts/allocations";
import { buildings } from "@/consts/buildings";
import { readContract } from "@/services/contracts/readContract";
import { fetchJsonFromIpfs } from "@/services/ipfsService";
import type { BuildingData, BuildingNFTAttribute, BuildingNFTData } from "@/types/erc3643/types";
import { prepareStorageIPFSfileURL } from "@/utils/helpers";
import { buildingFactoryAbi } from "./contracts/abi/buildingFactoryAbi";
import { BUILDING_FACTORY_ADDRESS } from "./contracts/addresses";

const buildingFinancialMock = {
   percentageOwned: 50,
   tokenPrice: 8,
   directExposure: 1600,
   yield: [
      { percentage: 10, days: 50 },
      { percentage: 30, days: 100 },
   ],
   treasury: 6000,
};

export const readBuildingsList = () =>
   readContract({
      address: BUILDING_FACTORY_ADDRESS,
      abi: buildingFactoryAbi,
      functionName: "getBuildingList",
   });

/**
 * Reads building details from SC.
 * @param address Building address
 */
export const readBuildingDetails = (address: `0x${string}`) =>
   readContract({
      functionName: "getBuildingDetails",
      address: BUILDING_FACTORY_ADDRESS,
      abi: buildingFactoryAbi,
      args: [address],
   });

export const fetchBuildingNFTsMetadata = async (
   buildingsAddresses: `0x${string}`[],
   buildings: BuildingData[],
) => {
   const buildingAddressesProxiesData = await Promise.all(
      buildingsAddresses
         .filter((address) => !buildings.find((build) => build.address === address))
         .map((address) => readBuildingDetails(address)),
   );
   const buildingNFTsData = await Promise.all(
      buildingAddressesProxiesData.map((proxy) => fetchJsonFromIpfs(proxy[0][2])),
   );

   return { buildingAddressesProxiesData, buildingNFTsData };
};

/**
 * Finds one attribute from building data attributes.
 * @param attributes All building attributes
 * @param attributeName Attribute key
 */
const findBuildingAttribute = (attributes: BuildingNFTAttribute[], attributeName: string) => {
   return attributes.find((attr) => attr.trait_type === attributeName)?.value ?? "--";
};

/**
 * Converts original building NFT metadata to a proper readable data format.
 * @param buildingNFTsData Original building NFT JSON
 */
export const convertBuildingNFTsData = (buildingNFTsData: BuildingNFTData[]): BuildingData[] => {
   return buildingNFTsData.map((data) => ({
      id: data.address,
      title: data.name,
      description: data.description,
      imageUrl: prepareStorageIPFSfileURL(data.image?.replace("ipfs://", "")),
      voteItems: [],
      partOfSlices: [],
      allocation: data.allocation,
      purchasedAt: data.purchasedAt,
      address: data.address,
      owner: data.owner,
      info: {
         financial: buildingFinancialMock,
         demographics: !data.attributes
            ? {
                 constructedYear: "",
                 type: "",
                 locationType: "",
                 size: "",
                 location: "",
                 state: "",
              }
            : {
                 constructedYear: findBuildingAttribute(data.attributes, "constructedYear"),
                 type: findBuildingAttribute(data.attributes, "type"),
                 locationType: findBuildingAttribute(data.attributes, "locationType"),
                 size: findBuildingAttribute(data.attributes, "size"),
                 location: findBuildingAttribute(data.attributes, "location"),
                 state: findBuildingAttribute(data.attributes, "state"),
              },
      },
   }));
};

export async function getBuildingForToken(tokenAddress: string) {
   const mapping = mockTokenToBuildingMap[tokenAddress];
   if (!mapping) return null;

   const buildingData = buildings.find((b) => b.id === mapping.buildingId);
   if (!buildingData) return null;

   return {
      nftId: buildingData.id,
      name: buildingData.title,
      image: buildingData.imageUrl,
      location: buildingData.info.demographics.location,
   };
}

export async function getBuildingValuation(buildingId: number): Promise<number> {
   // TODO: replace mock. with hopefully some actual logic in the near future
   return 10000;
}

export async function getSlicesForBuilding(buildingId: number): Promise<`0x${string}`[]> {
   const building = buildings.find((b) => b.id === buildingId);

   return !building ? [] : (building.partOfSlices ?? []);
}

export const filterBuildingsByOnlyUniqueIpfsHash = (data: BuildingNFTData[]) => {
   return data.reduce((acc, item) => {
      return acc.some((a) => a.image === item.image) ? acc : [...acc, item];
   }, [] as BuildingNFTData[]);
};
