import { renderHook, waitFor } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const watchUnsub = jest.fn();
let depositLogs: any[] | null = null;
jest.mock("@/services/contracts/watchContractEvent", () => ({
   watchContractEvent: ({ onLogs }: any) => {
      if (depositLogs) onLogs(depositLogs);
      return watchUnsub;
   },
}));

jest.mock("@/services/erc20Service", () => ({
   getTokenBalanceOf: jest.fn(),
   getTokenDecimals: jest.fn(),
   getTokenName: jest.fn(),
   getTokenSymbol: jest.fn(),
}));

jest.mock("@/services/sliceService", () => ({
   readSliceAllocations: jest.fn(),
   readSliceBaseToken: jest.fn(),
}));

jest.mock("@buidlerlabs/hashgraph-react-wallets", () => ({
   useEvmAddress: () => ({ data: "0xme00000000000000000000000000000000000000" as const }),
}));

jest.mock("@/utils/helpers", () => ({
   prepareStorageIPFSfileURL: (id: string) => `ipfs://converted/${id}`,
}));

jest.mock("@/hooks/useBuildings", () => ({
   readBuildingDetails: jest.fn(),
}));

jest.mock("@/services/ipfsService", () => ({
   fetchJsonFromIpfs: jest.fn(),
}));

import { useSliceData } from "@/hooks/useSliceData";
import {
   getTokenBalanceOf,
   getTokenDecimals,
   getTokenName,
   getTokenSymbol,
} from "@/services/erc20Service";
import { readSliceAllocations, readSliceBaseToken } from "@/services/sliceService";
import { readBuildingDetails } from "@/hooks/useBuildings";
import { fetchJsonFromIpfs } from "@/services/ipfsService";

describe("useSliceData", () => {
   const sliceAddress = "0x51ice000000000000000000000000000000000000" as const;

   const createWrapper = () => {
      const queryClient = new QueryClient({
         defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });
      const Wrapper = ({ children }: PropsWithChildren) => (
         <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      return Wrapper;
   };

   beforeEach(() => {
      jest.clearAllMocks();
      depositLogs = null;
   });

   it("loads sliceBaseToken and token info when evm address is available", async () => {
      (readSliceBaseToken as jest.Mock).mockResolvedValueOnce([
         "0xba5e000000000000000000000000000000000000",
      ]);
      (getTokenBalanceOf as jest.Mock).mockResolvedValueOnce("1000");
      (getTokenName as jest.Mock).mockResolvedValueOnce("BaseToken");
      (getTokenDecimals as jest.Mock).mockResolvedValueOnce(18);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useSliceData(sliceAddress), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.sliceBaseToken).toBeDefined());
      expect(result.current.sliceBaseToken).toBe("0xba5e000000000000000000000000000000000000");
      await waitFor(() => expect(result.current.sliceTokenInfo).toBeTruthy());
      expect(result.current.sliceTokenInfo).toEqual({
         tokenBalance: "1000",
         tokenName: "BaseToken",
         tokenDecimals: 18,
      });
   });

   it("maps allocations, sets sliceBuildings, and loads building details from IPFS", async () => {
      // Allocations: two items
      (readSliceAllocations as jest.Mock).mockResolvedValueOnce([
         [
            [
               "0xAT10000000000000000000000000000000000000",
               "0xBT10000000000000000000000000000000000000",
               2500,
            ],
            [
               "0xAT20000000000000000000000000000000000000",
               "0xBT20000000000000000000000000000000000000",
               7500,
            ],
         ],
      ]);
      (getTokenSymbol as jest.Mock).mockResolvedValueOnce(["AT1"]).mockResolvedValueOnce(["AT2"]);

      const deployed = [
         { tokenAddress: "0xBT10000000000000000000000000000000000000", buildingAddress: "0xB1" },
         { tokenAddress: "0xBT20000000000000000000000000000000000000", buildingAddress: "0xB2" },
      ];

      // Building details and IPFS
      (readBuildingDetails as jest.Mock)
         .mockResolvedValueOnce([["0xADDR1", "x", "QmHASH1"]])
         .mockResolvedValueOnce([["0xADDR2", "x", "QmHASH2"]]);
      (fetchJsonFromIpfs as jest.Mock)
         .mockResolvedValueOnce({ image: "ipfs://img1", name: "B1" })
         .mockResolvedValueOnce({ image: "ipfs://img2", name: "B2" });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useSliceData(sliceAddress, deployed as any), {
         wrapper: Wrapper,
      });

      // Wait for allocations
      await waitFor(() => expect(result.current.sliceAllocations?.length).toBe(2));
      const allocs = result.current.sliceAllocations!;
      expect(allocs[0]).toMatchObject({
         aToken: "0xAT10000000000000000000000000000000000000",
         aTokenName: "AT1",
         buildingToken: "0xBT10000000000000000000000000000000000000",
         idealAllocation: 50,
         actualAllocation: 25,
      });
      expect(allocs[1]).toMatchObject({
         aToken: "0xAT20000000000000000000000000000000000000",
         aTokenName: "AT2",
         buildingToken: "0xBT20000000000000000000000000000000000000",
         idealAllocation: 50,
         actualAllocation: 75,
      });

      // actual allocations should sum to 100%
      const actualSum = allocs.reduce((sum, a) => sum + a.actualAllocation, 0);
      expect(actualSum).toBe(100);

      // sliceBuildings derived from deployed tokens
      expect(result.current.sliceBuildings.map((b) => b.buildingAddress)).toEqual(["0xB1", "0xB2"]);

      // Building details mapped with IPFS
      await waitFor(() => expect(result.current.sliceBuildingsDetails?.length).toBe(2));
      expect(result.current.sliceBuildingsDetails?.[0]).toMatchObject({
         address: "0xADDR1",
         image: "ipfs://converted/img1",
         name: "B1",
      });
      expect(result.current.sliceBuildingsDetails?.[1]).toMatchObject({
         address: "0xADDR2",
         image: "ipfs://converted/img2",
         name: "B2",
      });
   });

   it("accumulates totalDeposits from Deposit logs (user and total)", async () => {
      // two deposits: one by current user (1.0), one by someone else (2.0)
      (getTokenDecimals as jest.Mock).mockResolvedValue([18]);

      depositLogs = [
         {
            args: [
               "0xTOK1000000000000000000000000000000000000",
               "0xme00000000000000000000000000000000000000",
               BigInt(10) ** BigInt(18),
            ],
         },
         {
            args: [
               "0xTOK1000000000000000000000000000000000000",
               "0xother0000000000000000000000000000000000",
               BigInt(2) * BigInt(10) ** BigInt(18),
            ],
         },
      ];

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useSliceData(sliceAddress), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.totalDeposits.total).toBeGreaterThan(0));
      expect(result.current.totalDeposits).toEqual({ user: 1, total: 3 });
      expect(result.current.sliceTokenDeposits).toEqual({
         "0xTOK1000000000000000000000000000000000000": {
            tokenAddress: "0xTOK1000000000000000000000000000000000000",
            amountInSlice: {
               total: 3,
               user: 1,
            },
         },
      });
   });
});
