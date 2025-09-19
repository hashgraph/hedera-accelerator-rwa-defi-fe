import { BuildingErrors, BuildingFormProps, TypedServerError } from "./types";
import { pinata } from "@/utils/pinata";
import { last } from "lodash";
import { readBuildingsList } from "@/services/buildingService";

export const transformValuesToContractFormat = (
   values: BuildingFormProps,
   imageIpfsHash: string,
) => ({
   name: values.info.buildingTitle,
   description: values.info.buildingDescription,
   image: imageIpfsHash,
   purchasedAt: values.info.buildingPurchaseDate,
   attributes: [
      {
         trait_type: "constructedYear",
         value: values.info.buildingConstructedYear,
      },
      { trait_type: "type", value: values.info.buildingType },
      { trait_type: "location", value: values.info.buildingLocation },
      { trait_type: "locationType", value: values.info.buildingLocationType },
      {
         trait_type: "tokenSupply",
         value: values.info.buildingTokenSupply.toString(),
      },
   ],
   cope: {
      construction: {
         materials: values.info.copeConstructionMaterials,
         yearBuilt: values.info.copeConstructionYearBuilt,
         roofType: values.info.copeConstructionRoofType,
         numFloors: values.info.copeConstructionNumFloors,
      },
      occupancy: {
         type: values.info.copeOccupancyType,
         percentageOccupied: values.info.copeOccupancyPercentage,
      },
      protection: {
         fire: values.info.copeProtectionFire,
         sprinklers: values.info.copeProtectionSprinklers,
         security: values.info.copeProtectionSecurity,
      },
      exposure: {
         nearbyRisks: values.info.copeExposureNearbyRisks,
         floodZone: values.info.copeExposureFloodZone,
      },
   },
});

export const uploadBuildingInfoToPinata = async (
   values: BuildingFormProps,
   imageIpfsHash: string,
) => {
   const finalJson = transformValuesToContractFormat(values, imageIpfsHash);

   const sanitizedBuildingName = values.info.buildingTitle.replace(/\s+/g, "-").toLowerCase();

   const keyRequest = await fetch("/api/pinataKey");
   const keyData = await keyRequest.json();
   const { IpfsHash } = await pinata.upload
      .json(finalJson, {
         metadata: { name: `Building-${sanitizedBuildingName}` },
      })
      .key(keyData.JWT);

   return IpfsHash;
};

export const getNewBuildingAddress = async () => {
   const buildings = await readBuildingsList();
   const lastBuilding: `0x${string}`[] | undefined = last(last(buildings));

   if (!lastBuilding) {
      throw new Error("No building found");
   }

   return lastBuilding[0];
};

export const processError = (error: { args: string[] }) => {
   console.warn("deployment error :>> ", error);
   const typedError = error.args?.[0]
      ? TypedServerError[error.args?.[0]]
      : BuildingErrors.UNEXPECTED_ERROR;
   throw new Error(typedError);
};
