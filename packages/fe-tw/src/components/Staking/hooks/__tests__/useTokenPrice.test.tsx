import { renderHook, waitFor } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTokenPrice } from "@/components/Staking/hooks/useTokenPrice";

// Mock dependencies
jest.mock("@buidlerlabs/hashgraph-react-wallets", () => ({
   useReadContract: jest.fn(),
}));

jest.mock("@/hooks/useTokenInfo", () => ({
   useTokenInfo: jest.fn(),
}));

import { useReadContract } from "@buidlerlabs/hashgraph-react-wallets";
import { useTokenInfo } from "@/hooks/useTokenInfo";

describe("useTokenPrice", () => {
   const mockReadContract = jest.fn();
   const mockUseTokenInfo = useTokenInfo as jest.MockedFunction<typeof useTokenInfo>;

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
      (useReadContract as jest.Mock).mockReturnValue({
         readContract: mockReadContract,
      });
   });

   it("returns undefined when token address is undefined", async () => {
      mockUseTokenInfo.mockReturnValue({
         decimals: 6,
      } as any);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenPrice(undefined, 18), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBeUndefined();
   });

   it("returns undefined when token decimals is undefined", async () => {
      mockUseTokenInfo.mockReturnValue({
         decimals: 6,
      } as any);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenPrice("0x1234567890123456789012345678901234567890", undefined), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBeUndefined();
   });

   it("returns undefined when USDC decimals is not available", async () => {
      mockUseTokenInfo.mockReturnValue({
         decimals: undefined,
      } as any);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenPrice("0x1234567890123456789012345678901234567890", 18), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBeUndefined();
   });

   it("calculates token price correctly", async () => {
      const tokenAddress = "0x1234567890123456789012345678901234567890";
      const tokenDecimals = 18;
      const usdcDecimals = 6;

      mockUseTokenInfo.mockReturnValue({
         decimals: usdcDecimals,
      } as any);

      // Mock getAmountsOut to return [amountIn, usdcAmountOut]
      // For 1 token (with 18 decimals) = 2.5 USDC (with 6 decimals)
      const usdcAmountOut = BigInt("2500000"); // 2.5 USDC with 6 decimals
      mockReadContract.mockResolvedValue([
         BigInt("1000000000000000000"), // 1 token with 18 decimals
         usdcAmountOut,
      ]);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenPrice(tokenAddress, tokenDecimals), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Expected price: 2500000 / 10^6 = 2.5
      expect(result.current.data).toBe(2.5);

      expect(mockReadContract).toHaveBeenCalledWith({
         address: expect.any(String), // UNISWAP_ROUTER_ADDRESS
         abi: expect.any(Array), // uniswapRouterAbi
         functionName: "getAmountsOut",
         args: [
            BigInt("1000000000000000000"), // 1 token with 18 decimals
            [tokenAddress, expect.any(String)], // path: [token, USDC]
         ],
      });
   });

   it("handles different token decimals correctly", async () => {
      const tokenAddress = "0x1234567890123456789012345678901234567890";
      const tokenDecimals = 8; // Different decimals like BTC
      const usdcDecimals = 6;

      mockUseTokenInfo.mockReturnValue({
         decimals: usdcDecimals,
      } as any);

      // For 1 token (with 8 decimals) = 50000 USDC (with 6 decimals)
      const usdcAmountOut = BigInt("50000000000"); // 50000 USDC with 6 decimals
      mockReadContract.mockResolvedValue([
         BigInt("100000000"), // 1 token with 8 decimals
         usdcAmountOut,
      ]);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenPrice(tokenAddress, tokenDecimals), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Expected price: 50000000000 / 10^6 = 50000
      expect(result.current.data).toBe(50000);

      expect(mockReadContract).toHaveBeenCalledWith({
         address: expect.any(String),
         abi: expect.any(Array),
         functionName: "getAmountsOut",
         args: [
            BigInt("100000000"), // 1 token with 8 decimals
            [tokenAddress, expect.any(String)],
         ],
      });
   });

   it("handles contract call errors gracefully", async () => {
      const tokenAddress = "0x1234567890123456789012345678901234567890";
      const tokenDecimals = 18;

      mockUseTokenInfo.mockReturnValue({
         decimals: 6,
      } as any);

      mockReadContract.mockRejectedValue(new Error("Contract call failed"));

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenPrice(tokenAddress, tokenDecimals), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
   });

   it("is disabled when required parameters are missing", () => {
      mockUseTokenInfo.mockReturnValue({
         decimals: 6,
      } as any);

      const Wrapper = createWrapper();
      
      // Test with undefined token address
      const { result: result1 } = renderHook(() => useTokenPrice(undefined, 18), { wrapper: Wrapper });
      expect(result1.current.isLoading).toBe(false);

      // Test with undefined token decimals
      const { result: result2 } = renderHook(() => useTokenPrice("0x1234567890123456789012345678901234567890", undefined), { wrapper: Wrapper });
      expect(result2.current.isLoading).toBe(false);
   });

   it("handles zero USDC amount correctly", async () => {
      const tokenAddress = "0x1234567890123456789012345678901234567890";
      const tokenDecimals = 18;

      mockUseTokenInfo.mockReturnValue({
         decimals: 6,
      } as any);

      // Mock getAmountsOut to return zero USDC amount
      mockReadContract.mockResolvedValue([
         BigInt("1000000000000000000"), // 1 token with 18 decimals
         BigInt("0"), // 0 USDC
      ]);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenPrice(tokenAddress, tokenDecimals), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBe(0);
   });

   it("handles very small amounts correctly", async () => {
      const tokenAddress = "0x1234567890123456789012345678901234567890";
      const tokenDecimals = 18;

      mockUseTokenInfo.mockReturnValue({
         decimals: 6,
      } as any);

      // Mock getAmountsOut to return very small USDC amount
      const usdcAmountOut = BigInt("1"); // 0.000001 USDC
      mockReadContract.mockResolvedValue([
         BigInt("1000000000000000000"), // 1 token with 18 decimals
         usdcAmountOut,
      ]);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenPrice(tokenAddress, tokenDecimals), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Expected price: 1 / 10^6 = 0.000001
      expect(result.current.data).toBe(0.000001);
   });
});