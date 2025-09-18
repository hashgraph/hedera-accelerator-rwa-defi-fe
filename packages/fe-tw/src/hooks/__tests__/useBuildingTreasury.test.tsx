import { renderHook, act, waitFor } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ethers } from "ethers";

const unsubscribeMock = jest.fn();
const watchContractEventMock = jest.fn();
jest.mock("@/services/contracts/watchContractEvent", () => ({
   watchContractEvent: (...args: any[]) => (watchContractEventMock as any)(...args),
}));

const readContractMock: jest.Mock = jest.fn();
const writeContractMock: jest.Mock = jest.fn();
jest.mock("wagmi/actions", () => ({
   readContract: (...args: any[]) => (readContractMock as any)(...args),
}));
jest.mock("@/hooks/useWriteContract", () => ({
   __esModule: true,
   default: () => ({ writeContract: writeContractMock }),
}));

const setAddress = (addr: string | null) => ((global as any).__TEST_WAGMI_ADDRESS__ = addr);

const executeTransactionMock = jest.fn((fn: any) => fn());
jest.mock("@/hooks/useExecuteTransaction", () => ({
   __esModule: true,
   executeTransaction: (fn: any) => executeTransactionMock(fn),
   useExecuteTransaction: () => ({ executeTransaction: (fn: any) => executeTransactionMock(fn) }),
}));

const storageRestoreMock = jest.fn();
const storageStoreMock = jest.fn();
jest.mock("@/services/storageService", () => ({
   StorageKeys: { Expenses: "Expenses" },
   storageService: {
      restoreItem: (...args: any[]) => storageRestoreMock(...args),
      storeItem: (...args: any[]) => storageStoreMock(...args),
   },
}));

jest.mock("@hashgraph/sdk", () => ({
   ContractId: {
      fromEvmAddress: (_a: number, _b: number, evm: string) => ({ _evm: evm }),
   },
}));

import { useBuildingTreasury } from "../useBuildingTreasury";

describe("useBuildingTreasury", () => {
   const buildingAddress = "0xdead000000000000000000000000000000000000" as const;
   const treasuryAddr = "0xtr3a000000000000000000000000000000000000" as const;
   const usdcAddr = "0xu5dc000000000000000000000000000000000000" as const;

   const createWrapper = (clientRef?: { current?: QueryClient }) => {
      const queryClient = new QueryClient({
         defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });
      if (clientRef) clientRef.current = queryClient;
      const Wrapper = ({ children }: PropsWithChildren) => (
         <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      return Wrapper;
   };

   beforeEach(() => {
      jest.clearAllMocks();
      setAddress("0xabc0000000000000000000000000000000000000");
      storageRestoreMock.mockResolvedValue(undefined);
      watchContractEventMock.mockImplementation(({ onLogs }: any) => {
         // Call onLogs with a matching NewBuilding event by default
         onLogs?.([{ args: [buildingAddress, "0xunused", treasuryAddr] }]);
         return unsubscribeMock;
      });
   });

   describe("subscription & treasury data", () => {
      it("subscribes to NewBuilding, sets treasuryAddress and loads treasuryData", async () => {
         readContractMock.mockImplementation((_cfg: any, { functionName }: any) => {
            if (functionName === "usdc") return usdcAddr;
            if (functionName === "balanceOf") return BigInt(123450000); // with 6 decimals => 123.45
            if (functionName === "decimals") return BigInt(6);
            return undefined;
         });

         const Wrapper = createWrapper();
         const { result, unmount } = renderHook(() => useBuildingTreasury(buildingAddress), {
            wrapper: Wrapper,
         });

         await waitFor(() => expect(result.current.isLoading).toBe(false));

         expect(result.current.treasuryData).toMatchObject({
            usdcAddress: usdcAddr,
            decimals: BigInt(6),
         });
         expect(result.current.treasuryData?.balance).toBeCloseTo(123.45, 6);

         // Unsubscribe on unmount
         unmount();
         expect(unsubscribeMock).toHaveBeenCalledTimes(1);
      });

      it("returns null treasuryData when usdc address is missing", async () => {
         readContractMock.mockImplementation((_cfg: any, { functionName }: any) => {
            if (functionName === "usdc") return null;
            return undefined;
         });

         const Wrapper = createWrapper();
         const { result } = renderHook(() => useBuildingTreasury(buildingAddress), {
            wrapper: Wrapper,
         });

         await waitFor(() => expect(result.current.isLoading).toBe(false));
         expect(result.current.treasuryData).toBeNull();
      });
   });

   describe("expenses", () => {
      it("loads and sorts expenses only for this building", async () => {
         const other = {
            title: "other",
            amount: "1",
            receiver: "0x111",
            notes: "",
            dateCreated: "2020-01-01T00:00:00.000Z",
            buildingId: "0xaaaa",
         };
         const e1 = {
            title: "A",
            amount: "1",
            receiver: "0x111",
            notes: "",
            dateCreated: "2021-01-01T00:00:00.000Z",
            buildingId: buildingAddress,
         };
         const e2 = {
            title: "B",
            amount: "2",
            receiver: "0x222",
            notes: "",
            dateCreated: "2022-01-01T00:00:00.000Z",
            buildingId: buildingAddress,
         };
         storageRestoreMock.mockResolvedValueOnce([other, e1, e2]);

         // Prevent treasury query noise
         readContractMock.mockImplementation((_cfg: any, { functionName }: any) => {
            if (functionName === "usdc") return null;
            return undefined;
         });

         const Wrapper = createWrapper();
         const { result } = renderHook(() => useBuildingTreasury(buildingAddress), {
            wrapper: Wrapper,
         });

         await waitFor(() => expect(result.current.expenses.length).toBe(2));
         expect(result.current.expenses.map((e: any) => e.title)).toEqual(["B", "A"]);
      });
   });

   describe("makePayment", () => {
      it("throws when no treasury address", async () => {
         // Do not emit matching event
         watchContractEventMock.mockImplementationOnce(({ onLogs }: any) => {
            onLogs?.([{ args: ["0xnot-matching", "0xunused", "0xnope"] }]);
            return unsubscribeMock;
         });

         readContractMock.mockImplementation((_cfg: any, { functionName }: any) => {
            if (functionName === "usdc") return null;
            return undefined;
         });

         const Wrapper = createWrapper();
         const { result } = renderHook(() => useBuildingTreasury(buildingAddress), {
            wrapper: Wrapper,
         });

         await expect(
            result.current.makePayment({ title: "t", amount: "1", receiver: "0x1" }),
         ).rejects.toThrow("No treasury address");
         expect(writeContractMock).not.toHaveBeenCalled();
      });

      it("succeeds, stores expense, reloads and invalidates query", async () => {
         // Setup treasury and token info
         readContractMock.mockImplementation((_cfg: any, { functionName, args }: any) => {
            if (functionName === "usdc") return usdcAddr;
            if (functionName === "balanceOf") return BigInt(0);
            if (functionName === "decimals") return BigInt(6);
            return undefined;
         });

         executeTransactionMock.mockImplementationOnce(async (fn: any) => {
            const inner = await fn();
            return { transaction_id: "tx-123", inner };
         });
         writeContractMock.mockResolvedValueOnce({ ok: true });

         // First restore returns current store; after storing, reload will read combined list
         const initialExpenses: any[] = [];
         storageRestoreMock.mockResolvedValueOnce(initialExpenses); // initial load in hook
         storageRestoreMock.mockResolvedValueOnce(initialExpenses); // during payment before store
         storageRestoreMock.mockResolvedValueOnce(initialExpenses.concat()); // after store, reload

         const clientRef: { current?: QueryClient } = {};
         const Wrapper = createWrapper(clientRef);
         const invalidateSpy = jest.spyOn(clientRef.current!, "invalidateQueries");

         const { result } = renderHook(() => useBuildingTreasury(buildingAddress), {
            wrapper: Wrapper,
         });

         await waitFor(() => expect(result.current.isLoading).toBe(false));

         await act(async () => {
            await result.current.makePayment({
               title: "Internet bill",
               amount: "2.5",
               receiver: "0xfeed000000000000000000000000000000000000",
               notes: "monthly",
            });
         });

         expect(writeContractMock).toHaveBeenCalledTimes(1);
         const args = writeContractMock.mock.calls[0][0];
         expect(args.functionName).toBe("makePayment");
         expect(args.args?.[0]).toBe("0xfeed000000000000000000000000000000000000");
         // amount is parseUnits(2.5, 6) => 2_500_000
         expect(args.args?.[1]).toBe(ethers.parseUnits("2.5", 6));

         // storage updated
         expect(storageStoreMock).toHaveBeenCalledTimes(1);
         const [key, updated] = storageStoreMock.mock.calls[0];
         expect(key).toBe("Expenses");
         expect(updated).toEqual(
            expect.arrayContaining([
               expect.objectContaining({ title: "Internet bill", buildingId: buildingAddress }),
            ]),
         );

         // expenses reloaded and query invalidated
         expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["treasuryData"] });
      });
   });
});
