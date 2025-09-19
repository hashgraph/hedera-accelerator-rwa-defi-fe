"use client";
import { useUploadImageToIpfs } from "@/hooks/useUploadImageToIpfs";
import { useState } from "react";
import {
   BuildingFormProps,
   BuildingMinorStep,
   MajorBuildingStep,
   MinorBuildingStep,
} from "@/components/Admin/buildingManagement/types";
import { BUILDING_FACTORY_ADDRESS, USDC_ADDRESS } from "@/services/contracts/addresses";
import { buildingFactoryAbi } from "@/services/contracts/abi/buildingFactoryAbi";
import { tryCatch } from "@/services/tryCatch";
import { uploadBuildingInfoToPinata } from "@/components/Admin/buildingManagement/helpers";
import { getNewBuildingAddress, processError } from "./helpers";
import { ethers } from "ethers";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import useWriteContract from "@/hooks/useWriteContract";
import { executeTransaction } from "@/hooks/useExecuteTransaction";

export const useBuildingOrchestration = () => {
   const { uploadImage } = useUploadImageToIpfs();
   const { writeContract } = useWriteContract();
   const { decimals: usdcDecimals } = useTokenInfo(USDC_ADDRESS);

   const [currentDeploymentStep, setCurrentDeploymentStep] = useState<
      [MajorBuildingStep | null, MinorBuildingStep | null]
   >([MajorBuildingStep.BUILDING, BuildingMinorStep.DEPLOY_IMAGE_IPFS]);

   const handleSubmitBuilding = async (values: BuildingFormProps) => {
      let imageIpfsHash = values.info.buildingImageIpfsId;
      if (!values.info.buildingImageIpfsId && values.info.buildingImageIpfsFile) {
         setCurrentDeploymentStep([
            MajorBuildingStep.BUILDING,
            BuildingMinorStep.DEPLOY_IMAGE_IPFS,
         ]);
         const { data: uploadedImageHash, error: imageError } = await tryCatch<
            string,
            { args: string[] }
         >(uploadImage(values.info.buildingImageIpfsFile!));

         imageIpfsHash = uploadedImageHash!;

         if (imageError) return processError(imageError);
      }

      setCurrentDeploymentStep([MajorBuildingStep.BUILDING, BuildingMinorStep.DEPLOY_COPE]);
      const { data: buildingMetadataIpfs, error: metadataError } = await tryCatch<
         string,
         { args: string[] }
      >(uploadBuildingInfoToPinata(values, imageIpfsHash!));
      if (metadataError) return processError(metadataError);

      const buildingDetails = {
         tokenURI: buildingMetadataIpfs,
         tokenName: values.token.tokenName,
         tokenSymbol: values.token.tokenSymbol,
         tokenDecimals: values.token.tokenDecimals,
         tokenMintAmount: ethers.parseUnits(
            String(values.token.mintBuildingTokenAmount),
            values.token.tokenDecimals,
         ),
         treasuryReserveAmount: ethers.parseUnits(
            String(values.treasuryAndGovernance.reserve),
            usdcDecimals,
         ),
         treasuryNPercent: values.treasuryAndGovernance.npercentage,
         governanceName: values.treasuryAndGovernance.governanceName,
         vaultShareTokenName: values.treasuryAndGovernance.shareTokenName,
         vaultShareTokenSymbol: values.treasuryAndGovernance.shareTokenSymbol,
         vaultFeeReceiver: values.treasuryAndGovernance.feeReceiverAddress,
         vaultFeeToken: values.treasuryAndGovernance.feeToken,
         vaultFeePercentage: values.treasuryAndGovernance.feePercentage,
         aTokenName: values.treasuryAndGovernance.autoCompounderTokenName,
         aTokenSymbol: values.treasuryAndGovernance.autoCompounderTokenSymbol,
         vaultCliff: 30,
         vaultUnlockDuration: 60,
      };

      setCurrentDeploymentStep([MajorBuildingStep.BUILDING, BuildingMinorStep.DEPLOY_BUILDING]);
      const { data: building, error: buildingDeploymentError } = await tryCatch<
         `0x${string}`,
         { args: string[] }
      >(deployBuilding(buildingDetails));
      if (buildingDeploymentError) return processError(buildingDeploymentError);

      setCurrentDeploymentStep([MajorBuildingStep.BUILDING, BuildingMinorStep.CONFIG_BUILDING]);
      const { error: buildingConfigError } = await tryCatch<void, { args: string[] }>(
         configNewBuilding(building),
      );
      if (buildingConfigError) return processError(buildingConfigError);

      return building;
   };

   const deployBuilding = async (buildingDetails: any) => {
      const hash = await executeTransaction(() =>
         writeContract({
            address: BUILDING_FACTORY_ADDRESS,
            abi: buildingFactoryAbi,
            functionName: "newBuilding",
            args: [buildingDetails],
         }),
      );

      return getNewBuildingAddress();
   };

   const configNewBuilding = async (buildingAddress: `0x${string}`) => {
      const hash = await executeTransaction(() =>
         writeContract({
            address: BUILDING_FACTORY_ADDRESS,
            abi: buildingFactoryAbi,
            functionName: "configNewBuilding",
            args: [buildingAddress],
         }),
      );
   };

   return {
      currentDeploymentStep,
      submitBuilding: handleSubmitBuilding,
   };
};
