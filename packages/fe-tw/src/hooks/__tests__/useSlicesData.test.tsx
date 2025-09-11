import { renderHook, waitFor } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const unsub = jest.fn();
let sliceLogs: any[] = [];
jest.mock("@/services/contracts/watchContractEvent", () => ({
   watchContractEvent: ({ onLogs }: any) => {
      if (sliceLogs.length) onLogs(sliceLogs);
      return unsub;
   },
}));

jest.mock("@/services/sliceService", () => ({
   readSliceMetdataUri: jest.fn(),
   readSliceAllocations: jest.fn(),
}));

jest.mock("@/services/ipfsService", () => ({
   fetchJsonFromIpfs: jest.fn(),
}));

jest.mock("@/utils/helpers", () => ({
   prepareStorageIPFSfileURL: (id: string) => `ipfs://prepared/${id}`,
}));

jest.mock("@/hooks/useBuildings", () => ({
   useBuildings: () => ({
      buildings: [{ address: "0xB1" }, { address: "0xB2" }],
      buildingsInfo: [
         { buildingAddress: "0xB1", tokenAddress: "0xBT1" },
         { buildingAddress: "0xB2", tokenAddress: "0xBT2" },
      ],
   }),
}));

import { useSlicesData } from "@/hooks/useSlicesData";
import { readSliceMetdataUri, readSliceAllocations } from "@/services/sliceService";
import { fetchJsonFromIpfs } from "@/services/ipfsService";

describe("useSlicesData", () => {
   const S1 = "0x51ice000000000000000000000000000000000001" as const;
   const S2 = "0x51ice000000000000000000000000000000000002" as const;

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
      sliceLogs = [{ args: [S1] }, { args: [S2] }];
   });

   it("loads slices metadata and allocations, and maps buildingToSlices", async () => {
      (readSliceMetdataUri as jest.Mock).mockImplementation((addr: string) => {
         if (addr === S1) return ["ipfs://meta1"];
         if (addr === S2) return ["ipfs://meta2"];
         return ["ipfs://unknown"];
      });
      (fetchJsonFromIpfs as jest.Mock)
         .mockImplementationOnce(() => ({
            name: "Slice 1",
            allocation: 10,
            description: "desc1",
            sliceImageIpfsId: "QmImg1",
            endDate: "2025-01-01",
         }))
         .mockImplementationOnce(() => ({
            name: "Slice 2",
            allocation: 20,
            description: "desc2",
            sliceImageIpfsHash: "QmImg2",
            endDate: "2025-01-02",
         }));

      const allocationsS1 = [
         [
            ["0xAT", "0xBTx", 2500],
            ["0xAT2", "0xBT1", 7500],
         ],
      ];
      (readSliceAllocations as jest.Mock).mockImplementation((addr: string) => {
         if (addr === S1) {
            return allocationsS1;
         }
         if (addr === S2) {
            return [
               [
                  ["0xATx1", "0xBTx", 1000],
                  ["0xATx2", "0xBT2", 9000],
               ],
            ];
         }
         return [[[]]];
      });

      const Wrapper = createWrapper();
      const { result, unmount } = renderHook(() => useSlicesData(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.sliceAddresses.length).toBe(2));
      expect(result.current.sliceAddresses).toEqual([S1, S2]);

      await waitFor(() => expect(result.current.slices.length).toBe(2));
      const [s1, s2] = result.current.slices;
      expect(s1).toMatchObject({
         id: S1,
         address: S1,
         name: "Slice 1",
         allocation: 10,
         description: "desc1",
         imageIpfsUrl: "ipfs://prepared/QmImg1",
         endDate: "2025-01-01",
         estimatedPrice: 0,
      });
      expect(s2).toMatchObject({
         id: S2,
         imageIpfsUrl: "ipfs://prepared/QmImg2",
      });

      await waitFor(() => expect(result.current.slicesAllocationsData.length).toBe(2));
      expect(result.current.slicesAllocationsData[0]).toEqual({
         buildingToken: "0xBT1",
         slice: S1,
      });
      expect(result.current.slicesAllocationsData[1]).toEqual({
         buildingToken: "0xBT2",
         slice: S2,
      });

      const totalPercent =
         allocationsS1[0].reduce((sum: number, a: any[]) => sum + (a[2] as number), 0) / 100;
      expect(totalPercent).toBe(100);

      const b2s = result.current.buildingToSlices;
      expect(Object.keys(b2s)).toEqual(expect.arrayContaining(["0xB1", "0xB2"]));
      expect(b2s["0xB1"].map((s) => s.address)).toEqual([S1]);
      expect(b2s["0xB2"].map((s) => s.address)).toEqual([S2]);

      unmount();
      expect(unsub).toHaveBeenCalledTimes(1);
   });
});
