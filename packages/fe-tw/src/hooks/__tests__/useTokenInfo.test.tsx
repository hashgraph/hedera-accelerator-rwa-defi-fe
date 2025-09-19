import { renderHook, waitFor } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTokenInfo } from "@/hooks/useTokenInfo";

// Mock the dependencies
jest.mock("wagmi/actions", () => ({
   readContract: jest.fn(),
}));

jest.mock("@/services/erc20Service", () => ({
   getTokenDecimals: jest.fn(),
}));

import { readContract } from "wagmi/actions";

describe("useTokenInfo", () => {
   const mockReadContract = readContract as unknown as jest.Mock;
   const setAddress = (addr: string | null) => ((global as any).__TEST_WAGMI_ADDRESS__ = addr);
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
      jest.clearAllMocks();
      setAddress("0xtest000000000000000000000000000000000000");
   });

   it("returns default values when token address is undefined", () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenInfo(undefined), { wrapper: Wrapper });

      expect(result.current.address).toBeUndefined();
      expect(result.current.decimals).toBe(18);
      expect(result.current.name).toBe("Unknown Token");
      expect(result.current.symbol).toBe("UNKNOWN");
      expect(result.current.totalSupply).toBe(BigInt(0));
      expect(result.current.balanceOf).toBe(BigInt(0));
      expect(result.current.isLoading).toBe(false);
   });

   it("returns default values when evm address is not available", () => {
      setAddress(null);

      const Wrapper = createWrapper();
      const tokenAddress = "0x1234567890123456789012345678901234567890" as const;
      const { result } = renderHook(() => useTokenInfo(tokenAddress), { wrapper: Wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.name).toBe("Unknown Token");
   });

   it("fetches token info when both token address and evm address are available", async () => {
      const tokenAddress = "0x1234567890123456789012345678901234567890" as const;

      // Create a more predictable mock implementation
      mockReadContract.mockImplementation((_cfg: any, config: any) => {
         switch (config.functionName) {
            case "decimals":
               return Promise.resolve(18);
            case "name":
               return Promise.resolve("Test Token");
            case "symbol":
               return Promise.resolve("TEST");
            case "totalSupply":
               return Promise.resolve(BigInt("1000000000000000000000"));
            case "balanceOf":
               return Promise.resolve(BigInt("100000000000000000000"));
            case "owner":
               return Promise.resolve("0xowner000000000000000000000000000000000000");
            case "compliance":
               return Promise.resolve("0xcomp0000000000000000000000000000000000000");
            default:
               return Promise.reject(new Error("Unknown function"));
         }
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenInfo(tokenAddress), { wrapper: Wrapper });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data to load
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.address).toBe(tokenAddress);
      expect(result.current.decimals).toBe(18);
      expect(result.current.name).toBe("Test Token");
      expect(result.current.symbol).toBe("TEST");
      expect(result.current.totalSupply).toBe(BigInt("1000000000000000000000"));
      expect(result.current.balanceOf).toBe(BigInt("100000000000000000000"));
      expect(result.current.owner).toBe("0xowner000000000000000000000000000000000000");
   });

   it("handles partial failures gracefully", async () => {
      const tokenAddress = "0x1234567890123456789012345678901234567890" as const;

      // Create a fresh mock that handles Promise.allSettled behavior
      mockReadContract.mockImplementation((_cfg: any, config: any) => {
         switch (config.functionName) {
            case "decimals":
               return Promise.resolve(6);
            case "name":
               return Promise.reject(new Error("Name call failed"));
            case "symbol":
               return Promise.resolve("PART");
            case "totalSupply":
               return Promise.reject(new Error("Total supply failed"));
            case "balanceOf":
               return Promise.resolve(BigInt("50000000"));
            case "owner":
               return Promise.reject(new Error("Owner call failed"));
            case "compliance":
               return Promise.resolve("0xcomp0000000000000000000000000000000000000");
            default:
               return Promise.reject(new Error("Unknown function"));
         }
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenInfo(tokenAddress), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.decimals).toBe(6);
      expect(result.current.name).toBe("Unknown Token"); // fallback
      expect(result.current.symbol).toBe("PART");
      expect(result.current.totalSupply).toBe(BigInt(0)); // fallback
      expect(result.current.balanceOf).toBe(BigInt("50000000"));
      expect(result.current.owner).toBeUndefined(); // fallback
   });

   it("fetches token price when token address is provided", async () => {
      const tokenAddress = "0x1234567890123456789012345678901234567890" as const;

      // Mock contract calls for price query
      mockReadContract.mockImplementation((_cfg: any, config: any) => {
         switch (config.functionName) {
            case "getPair":
               return Promise.resolve("0xpair000000000000000000000000000000000000");
            // reserves[0] -> USDC (6 decimals), reserves[1] -> Token (18 decimals)
            case "getReserves":
               return Promise.resolve([BigInt("2000000000"), BigInt("1000000000000000000")]);
            case "decimals":
               // Return different decimals based on the address
               if (config.address === tokenAddress) return Promise.resolve(18);
               return Promise.resolve(6); // USDC decimals
            case "name":
               return Promise.resolve("Test Token");
            case "symbol":
               return Promise.resolve("TEST");
            case "totalSupply":
               return Promise.resolve(BigInt("1000000000000000000000"));
            case "balanceOf":
               return Promise.resolve(BigInt("100000000000000000000"));
            case "owner":
               return Promise.resolve("0xowner000000000000000000000000000000000000");
            case "compliance":
               return Promise.resolve("0xcomp0000000000000000000000000000000000000");
            default:
               return Promise.reject(new Error("Unknown function"));
         }
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenInfo(tokenAddress), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await waitFor(() => expect(result.current.tokenPriceInUSDC).toBeDefined());

      // Price should be USDC amount / token amount = 2000 / 1 = 2000
      expect(result.current.tokenPriceInUSDC).toBe(2000);
   });

   it("returns 0 price when reserves are empty", async () => {
      const tokenAddress = "0x1234567890123456789012345678901234567890" as const;

      // Mock contract calls with empty reserves
      mockReadContract.mockImplementation((_cfg: any, config: any) => {
         switch (config.functionName) {
            case "getPair":
               return Promise.resolve("0xpair000000000000000000000000000000000000");
            case "getReserves":
               return Promise.resolve([BigInt("0"), BigInt("0")]); // empty reserves
            case "decimals":
               if (config.address === tokenAddress) return Promise.resolve(18);
               return Promise.resolve(6);
            case "name":
               return Promise.resolve("Test Token");
            case "symbol":
               return Promise.resolve("TEST");
            case "totalSupply":
               return Promise.resolve(BigInt("1000000000000000000000"));
            case "balanceOf":
               return Promise.resolve(BigInt("100000000000000000000"));
            case "owner":
               return Promise.resolve("0xowner000000000000000000000000000000000000");
            case "compliance":
               return Promise.resolve("0xcomp0000000000000000000000000000000000000");
            default:
               return Promise.reject(new Error("Unknown function"));
         }
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenInfo(tokenAddress), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.tokenPriceInUSDC).toBeDefined());

      expect(result.current.tokenPriceInUSDC).toBe(0);
   });

   it("provides refetch functionality", async () => {
      const tokenAddress = "0x1234567890123456789012345678901234567890" as const;

      mockReadContract.mockImplementation((config) => {
         switch (config.functionName) {
            case "decimals":
               return Promise.resolve(18);
            case "name":
               return Promise.resolve("Test Token");
            case "symbol":
               return Promise.resolve("TEST");
            case "totalSupply":
               return Promise.resolve(BigInt("1000000000000000000000"));
            case "balanceOf":
               return Promise.resolve(BigInt("100000000000000000000"));
            case "owner":
               return Promise.resolve("0xowner000000000000000000000000000000000000");
            case "compliance":
               return Promise.resolve("0xcomp0000000000000000000000000000000000000");
            default:
               return Promise.reject(new Error("Unknown function"));
         }
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useTokenInfo(tokenAddress), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(typeof result.current.refetch).toBe("function");

      // Test refetch doesn't throw
      expect(() => result.current.refetch()).not.toThrow();
   });
});
