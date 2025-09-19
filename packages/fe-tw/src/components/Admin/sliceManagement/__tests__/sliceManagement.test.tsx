import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { SliceManagement } from "@/components/Admin/sliceManagement/index";
import userEvent from "@testing-library/user-event";
import { useCreateSlice } from "@/hooks/useCreateSlice";

// Reduce interactive UI side-effects in tests
jest.mock("@/components/Walkthrough/WalkthroughStep", () => ({
   __esModule: true,
   WalkthroughStep: ({ children }: any) =>
      typeof children === "function"
         ? children({ confirmUserPassedStep: jest.fn(), confirmUserFinishedGuide: jest.fn() })
         : children,
}));
jest.mock("@/components/Walkthrough/ConditionalWalkthroughStep", () => ({
   __esModule: true,
   ConditionalWalkthroughStep: ({ children }: any) =>
      typeof children === "function"
         ? children({ confirmUserPassedStep: jest.fn(), confirmUserFinishedGuide: jest.fn() })
         : children,
}));
jest.mock("@/components/ui/tooltip", () => ({
   __esModule: true,
   Tooltip: ({ children }: any) => children,
   TooltipTrigger: ({ children }: any) => children,
   TooltipContent: ({ children }: any) => children,
   TooltipProvider: ({ children }: any) => children,
}));

jest.mock("@/services/erc20Service", () => ({
   getTokenBalanceOf: jest.fn(() => Promise.resolve(BigInt(10))),
}));
jest.mock("@/hooks/useCreateSlice", () => ({ useCreateSlice: jest.fn() }));
jest.mock("@/hooks/useBuildings", () => ({
   useBuildings: jest.fn(() => ({
      buildingsInfo: [
         { buildingAddress: "0xbuild1", tokenAddress: "0xtok1" },
         { buildingAddress: "0xbuild2", tokenAddress: "0xtok2" },
      ],
   })),
}));

// Mock walkthrough store selectors to return neutral values
jest.mock("@/components/Walkthrough/WalkthroughStore", () => ({
   __esModule: true,
   useWalkthroughStore: (sel: any) =>
      sel({ currentStep: null, currentGuide: null, setCurrentStep: jest.fn() }),
}));
const mockSubmitSlice = jest.fn();

describe("SliceManagement", () => {
   describe("Submit slice basic cases", () => {
      beforeEach(() => {
         (useCreateSlice as jest.Mock).mockReturnValue({
            createSlice: mockSubmitSlice,
            waitForLastSliceDeployed: jest.fn(() => Promise.resolve(null)),
         });
      });

      it("Should submit slice with basic info without allocation", async () => {
         render(<SliceManagement />);
         const user = userEvent.setup();
         // Wait for form to stabilize after effects
         await screen.findByRole("textbox", { name: /Slice Name/i });

         await user.type(screen.getByRole("textbox", { name: /Slice Name/i }), "Name");
         await user.type(screen.getByRole("textbox", { name: /Slice Symbol/i }), "Symbol");
         await user.type(
            screen.getByRole("textbox", { name: /Slice Description/i }),
            "Description",
         );
         await user.type(screen.getByRole("textbox", { name: /Slice Image IPFS Id/i }), "image123");
         await user.click(screen.getByRole("button", { name: /Next/i }));
         // Add at least one asset to trigger allocation flow after deploy
         await user.click(screen.getByRole("button", { name: /Add Asset/i }));
         await user.click(screen.getByRole("button", { name: /Deploy Slice/i }));

         await waitFor(() => {
            expect(mockSubmitSlice).toHaveBeenCalledWith(
               expect.objectContaining({
                  slice: expect.objectContaining({
                     name: "Name",
                     description: "Description",
                     endDate: "",
                     symbol: "Symbol",
                     sliceImageIpfsId: "image123",
                     sliceImageIpfsFile: undefined,
                  }),
                  sliceAllocation: expect.objectContaining({
                     tokenAssets: [],
                     tokenAssetAmounts: {},
                     depositAmount: "0",
                     rewardAmount: "100",
                  }),
               }),
            );
         });
      }, 15000);

      it("Should submit slice with allocation", async () => {
         render(<SliceManagement />);
         const user = userEvent.setup();
         // Wait for form to stabilize after effects
         await screen.findByRole("textbox", { name: /Slice Name/i });

         await user.type(screen.getByRole("textbox", { name: /Slice Name/i }), "Name");
         await user.type(screen.getByRole("textbox", { name: /Slice Symbol/i }), "Symbol");
         await user.type(
            screen.getByRole("textbox", { name: /Slice Description/i }),
            "Description",
         );
         await user.type(screen.getByRole("textbox", { name: /Slice Image IPFS Id/i }), "image123");
         await user.click(screen.getByRole("button", { name: /Next/i }));

         await user.click(screen.getByRole("button", { name: /Deploy Slice/i }));

         await waitFor(() => {
            expect(mockSubmitSlice).toHaveBeenCalledWith(
               expect.objectContaining({
                  slice: expect.objectContaining({
                     name: "Name",
                     description: "Description",
                     endDate: "",
                     symbol: "Symbol",
                     sliceImageIpfsId: "image123",
                     sliceImageIpfsFile: undefined,
                  }),
                  sliceAllocation: expect.objectContaining({
                     tokenAssets: [undefined],
                     tokenAssetAmounts: {},
                     depositAmount: "0",
                     rewardAmount: "100",
                  }),
               }),
            );
         });
      }, 15000);
   });
});
