import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BuildingManagement from "../buildingManagement";
import { MajorBuildingStep, BuildingMinorStep } from "../types";
import userEvent from "@testing-library/user-event";

jest.mock("../hooks", () => ({ useBuildingOrchestration: jest.fn() }));
import { useBuildingOrchestration } from "../hooks";

const mockSubmitBuilding = jest.fn();

describe("BuildingManagement", () => {
   beforeEach(() => {
      (useBuildingOrchestration as jest.Mock).mockReturnValue({
         buildingDetails: { isLoading: false },
         currentDeploymentStep: [MajorBuildingStep.BUILDING, BuildingMinorStep.DEPLOY_IMAGE_IPFS],
         submitBuilding: mockSubmitBuilding,
      });
   });

   it("should fill all steps, validate, and deploy building with correct values", async () => {
      const { container } = render(<BuildingManagement />);
      const user = userEvent.setup();

      await user.type(screen.getByLabelText("Building Title", { exact: false }), "My Building");
      await user.type(screen.getByLabelText("Building Image IPFS Id", { exact: false }), "Qm123");
      await user.click(screen.getByRole("button", { name: /Next/i }));
      const step1Title = screen.getByText("Building Info");
      const step1Node = step1Title.closest("[data-state]");
      expect(step1Node).toHaveAttribute("data-state", "valid");

      await user.type(screen.getByLabelText("Token Name", { exact: false }), "MyToken");
      await user.type(screen.getByLabelText("Token Symbol", { exact: false }), "MTK");
      await user.type(screen.getByLabelText("Mint Token Amount", { exact: false }), "1000");
      await user.click(screen.getByRole("button", { name: /Next/i }));
      const step2Title = screen.getByText("Token");
      const step2Node = step2Title.closest("[data-state]");
      expect(step2Node).toHaveAttribute("data-state", "valid");

      await user.type(screen.getByLabelText("Reserve", { exact: false }), "10");
      await user.type(screen.getByLabelText("NPercentage", { exact: false }), "5");
      await user.type(screen.getByLabelText("Governance Name", { exact: false }), "GovName");
      await user.type(screen.getByLabelText("Share Token Name", { exact: false }), "ShareToken");
      await user.type(screen.getByLabelText("Share Token Symbol", { exact: false }), "STK");
      await user.click(screen.getByRole("button", { name: /Deploy Building/i }));

      await waitFor(() => {
         expect(mockSubmitBuilding).toHaveBeenCalledWith(
            expect.objectContaining({
               info: expect.objectContaining({
                  buildingTitle: "My Building",
                  buildingTokenSupply: 1000000,
                  buildingImageIpfsId: "Qm123",
               }),
               token: expect.objectContaining({
                  tokenName: "MyToken",
                  tokenSymbol: "MTK",
                  mintBuildingTokenAmount: 1000,
               }),
               treasuryAndGovernance: expect.objectContaining({
                  reserve: "10",
                  npercentage: "5",
                  feeReceiverAddress: "0x0000000000000000000000000000000000000000",
                  feeToken: "0x0000000000000000000000000000000000000000",
                  governanceName: "GovName",
                  shareTokenName: "ShareToken",
                  shareTokenSymbol: "STK",
               }),
            }),
         );
      });
   });

   it("should not call submitBuilding and mark first two steps as invalid if skipped and deployed", async () => {
      const { container } = render(<BuildingManagement />);
      const user = userEvent.setup();

      await user.click(screen.getByText("Token"));
      await user.click(screen.getByText("Treasury & Governance"));
      await user.click(screen.getByRole("button", { name: /Deploy Building/i }));

      expect(mockSubmitBuilding).not.toHaveBeenCalled();

      const step1Title = screen.getByText("Building Info");
      const step1Node = step1Title.closest("[data-state]");
      expect(step1Node).toHaveAttribute("data-state", "invalid");

      const step2Title = screen.getByText("Token");
      const step2Node = step2Title.closest("[data-state]");
      expect(step2Node).toHaveAttribute("data-state", "invalid");
   });
});
