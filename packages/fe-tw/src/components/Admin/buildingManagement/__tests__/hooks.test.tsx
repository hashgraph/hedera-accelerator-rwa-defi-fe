import { renderHook, act } from "@testing-library/react";
import { useBuildingOrchestration } from "../hooks";
import { MajorBuildingStep, BuildingMinorStep } from "../types";
import { INITIAL_VALUES } from "../constants";
import * as helpers from "../helpers";
import { useUploadImageToIpfs } from "@/hooks/useUploadImageToIpfs";
// The implementation now uses a named function executeTransaction (not a hook),
// so we mock that named export instead of attempting to mock a (non-existent) hook.
// import { executeTransaction } from "@/hooks/useExecuteTransaction"; // (import not required for the mock to work)
import { BUILDING_FACTORY_ADDRESS } from "@/services/contracts/addresses";
import { buildingFactoryAbi } from "@/services/contracts/abi/buildingFactoryAbi";
import { tryCatch } from "@/services/tryCatch";
import useWriteContract from "@/hooks/useWriteContract";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { ethers } from "ethers";

jest.mock("@/hooks/useUploadImageToIpfs");
const mockExecuteTransaction = jest.fn().mockImplementation(async (cb) => {
   return cb();
});
jest.mock("@/hooks/useExecuteTransaction", () => ({
   executeTransaction: (...args: any[]) => mockExecuteTransaction(...args),
}));
jest.mock("@/hooks/useWriteContract");
jest.mock("@/hooks/useTokenInfo");
jest.mock("wagmi", () => ({
   useAccount: jest.fn(() => ({ address: "0x_USER" })),
}));
jest.mock("wagmi/actions", () => ({
   readContract: jest.fn(),
}));

jest.mock("../helpers");
jest.mock("@/services/tryCatch", () => ({
   tryCatch: jest.fn((promise) => promise),
}));

const mockUploadImage = jest.fn();
// mockExecuteTransaction already defined above with a simpler passthrough implementation
const mockWriteContract = jest.fn();
let mockHelperUploadBuildingInfoToPinata: jest.Mock;
let mockGetNewBuildingAddress: jest.Mock;

describe("useBuildingOrchestration", () => {
   beforeEach(() => {
      jest.clearAllMocks();

      (useUploadImageToIpfs as jest.Mock).mockReturnValue({ uploadImage: mockUploadImage });
      // executeTransaction is a direct named function; nothing additional to set up here.
      (useWriteContract as jest.Mock).mockReturnValue({ writeContract: mockWriteContract });
      (useTokenInfo as jest.Mock).mockReturnValue({ decimals: 6 });

      mockUploadImage.mockResolvedValue("0x_MOCK_IMAGE_IPFS_HASH");
      mockHelperUploadBuildingInfoToPinata = helpers.uploadBuildingInfoToPinata as jest.Mock;
      mockHelperUploadBuildingInfoToPinata.mockResolvedValue("0x_MOCK_METADATA_IPFS_HASH");
      mockGetNewBuildingAddress = (helpers as any).getNewBuildingAddress as jest.Mock;
      if (mockGetNewBuildingAddress) {
         mockGetNewBuildingAddress.mockReturnValue("0x_MOCK_BUILDING_ADDRESS");
      }
      mockWriteContract.mockResolvedValue({
         receipt: "mockReceipt",
         newBuildingAddress: "0x_MOCK_BUILDING_ADDRESS",
      });
      (tryCatch as jest.Mock).mockImplementation(async (promise) => {
         try {
            const data = await promise;
            return { data, error: null };
         } catch (error) {
            return { data: null, error };
         }
      });
   });

   it("should render and return expected structure", () => {
      const { result } = renderHook(() => useBuildingOrchestration());

      expect(result.current).toHaveProperty("currentDeploymentStep");
      expect(result.current).toHaveProperty("submitBuilding");
      expect(result.current.currentDeploymentStep).toEqual([
         MajorBuildingStep.BUILDING,
         BuildingMinorStep.DEPLOY_IMAGE_IPFS,
      ]);
      expect(typeof result.current.submitBuilding).toBe("function");
   });

   it("should call submitBuilding and perform deployment steps", async () => {
      const { result } = renderHook(() => useBuildingOrchestration());

      const minimalValues = {
         info: {
            ...INITIAL_VALUES.info,
            buildingTitle: "Test Building",
            buildingImageIpfsFile: new File([""], "dummy.jpg", { type: "image/jpeg" }),
            buildingTokenSupply: 1000000,
         },
         token: {
            ...INITIAL_VALUES.token,
            tokenName: "TestToken",
            tokenSymbol: "TTK",
            tokenDecimals: 18,
            mintBuildingTokenAmount: 1000,
         },
         treasuryAndGovernance: {
            ...INITIAL_VALUES.treasuryAndGovernance,
            reserve: 10,
            npercentage: 5,
            governanceName: "TestGov",
            shareTokenName: "TestShare",
            shareTokenSymbol: "TSS",
            feeReceiverAddress: "0xFEERECEIVER",
            feeToken: "0xFEETOKEN",
            feePercentage: 1,
            autoCompounderTokenName: "TestAC",
            autoCompounderTokenSymbol: "TAC",
         },
      };

      let submissionResult;
      await act(async () => {
         submissionResult = await result.current.submitBuilding(minimalValues);
      });

      expect(mockUploadImage).toHaveBeenCalledWith(minimalValues.info.buildingImageIpfsFile);
      expect(tryCatch).toHaveBeenCalledWith(expect.any(Promise));

      expect(mockHelperUploadBuildingInfoToPinata).toHaveBeenCalledWith(
         minimalValues,
         "0x_MOCK_IMAGE_IPFS_HASH",
      );
      expect(tryCatch).toHaveBeenCalledWith(expect.any(Promise));
      expect(mockExecuteTransaction).toHaveBeenCalledTimes(2);

      const expectedBuildingDetails = {
         tokenURI: "0x_MOCK_METADATA_IPFS_HASH",
         tokenName: minimalValues.token.tokenName,
         tokenSymbol: minimalValues.token.tokenSymbol,
         tokenDecimals: minimalValues.token.tokenDecimals,
         tokenMintAmount: ethers.parseUnits(
            String(minimalValues.token.mintBuildingTokenAmount),
            minimalValues.token.tokenDecimals,
         ),
         treasuryReserveAmount: ethers.parseUnits(
            String(minimalValues.treasuryAndGovernance.reserve),
            6,
         ),
         treasuryNPercent: minimalValues.treasuryAndGovernance.npercentage,
         governanceName: minimalValues.treasuryAndGovernance.governanceName,
         vaultShareTokenName: minimalValues.treasuryAndGovernance.shareTokenName,
         vaultShareTokenSymbol: minimalValues.treasuryAndGovernance.shareTokenSymbol,
         vaultFeeReceiver: minimalValues.treasuryAndGovernance.feeReceiverAddress,
         vaultFeeToken: minimalValues.treasuryAndGovernance.feeToken,
         vaultFeePercentage: minimalValues.treasuryAndGovernance.feePercentage,
         aTokenName: minimalValues.treasuryAndGovernance.autoCompounderTokenName,
         aTokenSymbol: minimalValues.treasuryAndGovernance.autoCompounderTokenSymbol,
         vaultCliff: 30,
         vaultUnlockDuration: 60,
      } as const;

      expect(mockWriteContract).toHaveBeenNthCalledWith(
         1,
         expect.objectContaining({
            address: BUILDING_FACTORY_ADDRESS,
            abi: buildingFactoryAbi,
            functionName: "newBuilding",
            args: [expect.objectContaining(expectedBuildingDetails)],
         }),
      );

      expect(mockWriteContract).toHaveBeenNthCalledWith(
         2,
         expect.objectContaining({
            address: BUILDING_FACTORY_ADDRESS,
            abi: buildingFactoryAbi,
            functionName: "configNewBuilding",
            args: ["0x_MOCK_BUILDING_ADDRESS"],
         }),
      );

      expect(submissionResult).toEqual("0x_MOCK_BUILDING_ADDRESS");
   });
});
