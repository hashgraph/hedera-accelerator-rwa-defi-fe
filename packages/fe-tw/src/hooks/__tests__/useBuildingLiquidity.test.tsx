import { renderHook, act, waitFor } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ethers } from "ethers";

const readContractMock = jest.fn();
jest.mock("wagmi/actions", () => ({
   readContract: (...args: any[]) => (readContractMock as any)(...args),
}));
const setAddress = (addr: string | null) => ((global as any).__TEST_WAGMI_ADDRESS__ = addr);

const executeTransactionMock = jest.fn((fn: any) => fn());
jest.mock("@/hooks/useExecuteTransaction", () => ({
   __esModule: true,
   executeTransaction: (fn: any) => executeTransactionMock(fn),
   useExecuteTransaction: () => ({ executeTransaction: executeTransactionMock }),
}));

const writeContractMock = jest.fn();
jest.mock("@/hooks/useWriteContract", () => ({
   __esModule: true,
   default: () => ({ writeContract: writeContractMock }),
}));

const getPermitSignatureMock = jest.fn(
   async (_token: `0x${string}`, amount: bigint, _spender: `0x${string}`, deadline: number) => ({
      amount,
      deadline,
      v: 27,
      r: "0x" as const,
      s: "0x" as const,
   }),
);
jest.mock("@/hooks/useTokenPermitSignature", () => ({
   __esModule: true,
   useTokenPermitSignature: () => ({ getPermitSignature: getPermitSignatureMock }),
}));

jest.mock("@hashgraph/sdk", () => ({
   ContractId: { fromSolidityAddress: (addr: string) => ({ _addr: addr }) },
}));

const toastErrorMock = jest.fn();
jest.mock("sonner", () => ({
   toast: { error: (...args: any[]) => toastErrorMock(...args) },
}));

import { useBuildingLiquidity } from "@/hooks/useBuildingLiquidity";
import { UNISWAP_FACTORY_ADDRESS } from "@/services/contracts/addresses";
import { tokens } from "@/consts/tokens";

describe("useBuildingLiquidity", () => {
   const createWrapper = () => {
      const queryClient = new QueryClient({
         defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });
      const Wrapper = ({ children }: PropsWithChildren) => (
         <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      return Wrapper;
   };

   const tokenA = tokens[0]; // decimals 18
   const tokenB = tokens[2]; // decimals 6
   const validBuildingAddress = "0xdead000000000000000000000000000000000000";

   beforeEach(() => {
      jest.clearAllMocks();
      setAddress(null);
   });

   describe("checkPairAndCalculateAmounts", () => {
      it("not exists and calculates desired amounts with 5% slippage", async () => {
         // Factory returns zero address => pair does not exist
         readContractMock.mockImplementation((_cfg: any, { address, functionName }: any) => {
            if (address === UNISWAP_FACTORY_ADDRESS && functionName === "getPair")
               return ethers.ZeroAddress;
            return undefined;
         });

         const Wrapper = createWrapper();
         const { result } = renderHook(() => useBuildingLiquidity(), { wrapper: Wrapper });

         act(() => {
            result.current.checkPairAndCalculateAmounts(tokenA.address, tokenB.address, "1", "2");
         });

         await waitFor(() => expect(result.current.isCheckingPair).toBe(false));
         expect(result.current.pairInfo).toEqual({
            exists: false,
            pairAddress: ethers.ZeroAddress,
            token0: "",
            token1: "",
            reserve0: BigInt(0),
            reserve1: BigInt(0),
         });

         const desiredA = BigInt(10) ** BigInt(18); // 1 * 10^18
         const desiredB = BigInt(2) * BigInt(10) ** BigInt(6); // 2 * 10^6
         expect(result.current.calculatedAmounts).toEqual({
            tokenARequired: desiredA,
            tokenBRequired: desiredB,
            tokenAMin: (desiredA * BigInt(95)) / BigInt(100),
            tokenBMin: (desiredB * BigInt(95)) / BigInt(100),
         });
      });

      it("exists and calculates proportional required amounts", async () => {
         const pairAddress = "0xpa1r000000000000000000000000000000000000";
         readContractMock.mockImplementation((_cfg: any, { address, functionName }: any) => {
            if (address === UNISWAP_FACTORY_ADDRESS && functionName === "getPair")
               return pairAddress;
            if (address === pairAddress && functionName === "getReserves")
               return [BigInt(1000), BigInt(2000), 0];
            if (address === pairAddress && functionName === "token0") return tokenA.address;
            if (address === pairAddress && functionName === "token1") return tokenB.address;
            return undefined;
         });

         const Wrapper = createWrapper();
         const { result } = renderHook(() => useBuildingLiquidity(), { wrapper: Wrapper });

         act(() => {
            result.current.checkPairAndCalculateAmounts(tokenA.address, tokenB.address, "1", "2");
         });

         await waitFor(() => expect(result.current.isCheckingPair).toBe(false));
         expect(result.current.pairInfo?.exists).toBe(true);
         const desiredB = BigInt(2) * BigInt(10) ** BigInt(6);
         const expectedARequired = desiredB / BigInt(2);
         expect(result.current.calculatedAmounts).toMatchObject({
            tokenARequired: expectedARequired,
            tokenBRequired: desiredB,
            tokenAMin: (expectedARequired * BigInt(95)) / BigInt(100),
            tokenBMin: (desiredB * BigInt(95)) / BigInt(100),
         });
      });
   });

   describe("addLiquidity", () => {
      it("errors when no wallet is connected", async () => {
         // Prepare pair data
         readContractMock.mockImplementation((_cfg: any, { address, functionName }: any) => {
            if (address === UNISWAP_FACTORY_ADDRESS && functionName === "getPair")
               return ethers.ZeroAddress;
            return undefined;
         });

         const Wrapper = createWrapper();
         const { result } = renderHook(() => useBuildingLiquidity(), { wrapper: Wrapper });

         act(() => {
            result.current.checkPairAndCalculateAmounts(tokenA.address, tokenB.address, "1", "2");
         });

         await waitFor(() => expect(result.current.isCheckingPair).toBe(false));

         await act(async () => {
            await result.current.addLiquidity({
               buildingAddress: validBuildingAddress,
               tokenAAddress: tokenA.address,
               tokenBAddress: tokenB.address,
               tokenAAmount: "1",
               tokenBAmount: "2",
            });
         });

         expect(toastErrorMock).toHaveBeenCalledWith("No wallet connected. Please connect first.");
         expect(executeTransactionMock).not.toHaveBeenCalled();
         expect(writeContractMock).not.toHaveBeenCalled();
      });

      it("errors when pair info not checked", async () => {
         setAddress("0xabc0000000000000000000000000000000000000");

         const Wrapper = createWrapper();
         const { result } = renderHook(() => useBuildingLiquidity(), { wrapper: Wrapper });

         await act(async () => {
            await result.current.addLiquidity({
               buildingAddress: validBuildingAddress,
               tokenAAddress: tokenA.address,
               tokenBAddress: tokenB.address,
               tokenAAmount: "1",
               tokenBAmount: "2",
            });
         });

         expect(result.current.txError).toBe("Please check pair information first");
         expect(executeTransactionMock).not.toHaveBeenCalled();
      });

      it("errors on invalid building address", async () => {
         setAddress("0xabc0000000000000000000000000000000000000");
         // Prepare pair data (not used in validation directly, but ensures pairCheckResult exists)
         readContractMock.mockImplementation((_cfg: any, { address, functionName }: any) => {
            if (address === UNISWAP_FACTORY_ADDRESS && functionName === "getPair")
               return ethers.ZeroAddress;
            return undefined;
         });

         const Wrapper = createWrapper();
         const { result } = renderHook(() => useBuildingLiquidity(), { wrapper: Wrapper });

         act(() => {
            result.current.checkPairAndCalculateAmounts(tokenA.address, tokenB.address, "1", "2");
         });
         await waitFor(() => expect(result.current.isCheckingPair).toBe(false));

         await act(async () => {
            await result.current.addLiquidity({
               buildingAddress: "invalid-address",
               tokenAAddress: tokenA.address,
               tokenBAddress: tokenB.address,
               tokenAAmount: "1",
               tokenBAmount: "2",
            });
         });

         expect(result.current.txError).toBe("Invalid EVM address: invalid-address");
         expect(executeTransactionMock).not.toHaveBeenCalled();
      });

      it("succeeds and sets txHash", async () => {
         setAddress("0xabc0000000000000000000000000000000000000");
         const pairAddress = "0xpa1r000000000000000000000000000000000000";
         readContractMock.mockImplementation((_cfg: any, { address, functionName }: any) => {
            if (address === UNISWAP_FACTORY_ADDRESS && functionName === "getPair")
               return pairAddress;
            if (address === pairAddress && functionName === "getReserves")
               return [BigInt(1000), BigInt(2000), 0];
            if (address === pairAddress && functionName === "token0") return tokenA.address;
            if (address === pairAddress && functionName === "token1") return tokenB.address;
            return undefined;
         });

         executeTransactionMock.mockImplementationOnce(async (fn: any) => {
            const res = await fn();
            return { tx: "tx-success", inner: res };
         });
         writeContractMock.mockResolvedValueOnce({ ok: true });

         const Wrapper = createWrapper();
         const { result } = renderHook(() => useBuildingLiquidity(), { wrapper: Wrapper });

         act(() => {
            result.current.checkPairAndCalculateAmounts(tokenA.address, tokenB.address, "1", "2");
         });
         await waitFor(() => expect(result.current.isCheckingPair).toBe(false));

         await act(async () => {
            await result.current.addLiquidity({
               buildingAddress: validBuildingAddress,
               tokenAAddress: tokenA.address,
               tokenBAddress: tokenB.address,
               tokenAAmount: "1",
               tokenBAmount: "2",
            });
         });

         expect(executeTransactionMock).toHaveBeenCalledTimes(1);
         expect(writeContractMock).toHaveBeenCalledTimes(1);
         expect(result.current.txHash).toEqual({ tx: "tx-success", inner: { ok: true } });
         expect(result.current.txError).toBeUndefined();
      });
   });
});
