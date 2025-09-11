import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { SliceManagement } from "@/components/Admin/sliceManagement/index";
import userEvent from "@testing-library/user-event";
import { useCreateSlice } from "@/hooks/useCreateSlice";

jest.mock("@/services/erc20Service", () => ({
   getTokenBalanceOf: jest.fn(() => Promise.resolve(BigInt(10))),
}));
jest.mock("@/hooks/useCreateSlice", () => ({ useCreateSlice: jest.fn() }));
jest.mock("@buidlerlabs/hashgraph-react-wallets", () => ({
   useEvmAddress: jest.fn(() => ({ data: "0xaddr" })),
   useOriginalWriteContract: jest.fn(() => ({
      writeContract: () =>
         Promise.resolve({
            transaction_id: "123456",
         }),
   })),
   useWriteContract: jest.fn(() => ({
      writeContract: () =>
         Promise.resolve({
            transaction_id: "123456",
         }),
   })),
   useWallet: jest.fn(() => ({
      isConnected: false,
   })),
   useWatchTransactionReceipt: jest.fn(() => ({
      watch: () => ({
         onSuccess: () => {},
         onError: () => {},
      }),
   })),
}));
jest.mock("@/hooks/useBuildings", () => ({
   useBuildings: jest.fn(() => ({
      buildingsInfo: [
         { buildingAddress: "0xbuild1", tokenAddress: "0xtok1" },
         { buildingAddress: "0xbuild2", tokenAddress: "0xtok2" },
      ],
   })),
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
      });

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
      });
   });
});
