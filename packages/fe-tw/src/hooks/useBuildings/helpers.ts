import { buildingFinancialMock } from "@/consts/buildings";
import { buildingFactoryAbi } from "@/services/contracts/abi/buildingFactoryAbi";
import { BUILDING_FACTORY_ADDRESS } from "@/services/contracts/addresses";
import { readContract } from "@/services/contracts/readContract";
import { fetchJsonFromIpfs } from "@/services/ipfsService";
import { BuildingNFTAttribute, BuildingNFTData, BuildingData } from "@/types/erc3643/types";
import { prepareStorageIPFSfileURL } from "@/utils/helpers";

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
const convertBuildingNFTsData = (buildingNFTsData: BuildingNFTData[]): BuildingData[] => {
   return buildingNFTsData.map((data) => ({
      id: data.address,
      title: data.name,
      description: data.description,
      imageUrl: prepareStorageIPFSfileURL(data.image?.replace("ipfs://", "")),
      cope: data.cope,
      voteItems: [],
      partOfSlices: [],
      allocation: data.allocation,
      purchasedAt: data.purchasedAt,
      address: data.address,
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

/**
 * Fetches batch of building NFTs metadata from Pinata.
 * @param buildingsAddresses Buildings addresses
 * @param buildings Buildings exists
 */
export const fetchBuildingNFTsMetadata = async (
   buildingsAddresses: `0x${string}`[],
   buildings: BuildingData[],
) => {
   const buildingAddressesProxiesData = await Promise.all(
      buildingsAddresses
         .filter((address) => !buildings.find((build) => build.address === address))
         .map((address) => readBuildingDetails(address)),
   );
   const buildingNFTsResults = await Promise.allSettled(
      buildingAddressesProxiesData
         .filter((proxy) => !!proxy[0][2])
         .map((proxy) => fetchJsonFromIpfs(proxy[0][2])),
   );
   const buildingNFTsData = buildingNFTsResults
      .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
      .map((result) => result.value);

   return { buildingAddressesProxiesData, buildingNFTsData };
};

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

export const fetchBuildingInfo = async (id: string) => {
   const building = await readBuildingDetails(id as `0x${string}`);
   const ipfsData = await fetchJsonFromIpfs(building[0][2]);
   const combinedInfo = {
      ...ipfsData,
      address: building[0][0],
      copeIpfsHash: building[0][2],
   };
   const convertedToUIFormat = convertBuildingNFTsData([combinedInfo]);

   return convertedToUIFormat[0];
};
