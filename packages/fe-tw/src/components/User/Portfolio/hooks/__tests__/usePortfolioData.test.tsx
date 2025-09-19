import { renderHook, waitFor } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePortfolioData } from "@/components/User/Portfolio/hooks/usePortfolioData";

// Mock dependencies
jest.mock("@/services/buildingService", () => ({
   readBuildingDetails: jest.fn(),
   readBuildingsList: jest.fn(),
}));

jest.mock("@/services/erc20Service", () => ({
   getTokenBalanceOf: jest.fn(),
   getTokenDecimals: jest.fn(),
   getTokenSymbol: jest.fn(),
}));

jest.mock("@/services/contracts/readContract", () => ({
   readContract: jest.fn(),
}));

// Use the global wagmi mocks from jest.setup.ts

jest.mock("../../helpers", () => ({
   getUserReward: jest.fn(),
}));

import { readBuildingDetails, readBuildingsList } from "@/services/buildingService";
import { getTokenBalanceOf, getTokenDecimals, getTokenSymbol } from "@/services/erc20Service";
import { readContract } from "@/services/contracts/readContract";
import { useAccount } from "wagmi";
import { getUserReward } from "../../helpers";

describe("usePortfolioData", () => {
   const mockReadBuildingsList = readBuildingsList as jest.MockedFunction<typeof readBuildingsList>;
   const mockReadBuildingDetails = readBuildingDetails as jest.MockedFunction<
      typeof readBuildingDetails
   >;
   const mockGetTokenBalanceOf = getTokenBalanceOf as jest.MockedFunction<typeof getTokenBalanceOf>;
   const mockGetTokenDecimals = getTokenDecimals as jest.MockedFunction<typeof getTokenDecimals>;
   const mockGetTokenSymbol = getTokenSymbol as jest.MockedFunction<typeof getTokenSymbol>;
   const mockReadContract = readContract as jest.MockedFunction<typeof readContract>;
   // helper to set account
   const setAddress = (addr: string | null) => ((global as any).__TEST_WAGMI_ADDRESS__ = addr);
   const mockGetUserReward = getUserReward as jest.MockedFunction<typeof getUserReward>;

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
   });

   it("returns null when evmAddress is not available", async () => {
      setAddress(null);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => usePortfolioData(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBeUndefined(); // Query is disabled, so data is undefined
   });

   it("returns empty array when no buildings are found", async () => {
      setAddress("0xuser000000000000000000000000000000000000");
      mockReadBuildingsList.mockResolvedValue([]);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => usePortfolioData(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toEqual([]);
   });

   it("returns empty array when buildings list is empty", async () => {
      setAddress("0xuser000000000000000000000000000000000000");
      mockReadBuildingsList.mockResolvedValue([[]]);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => usePortfolioData(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toEqual([]);
   });

   it("returns portfolio data for buildings with non-zero balance", async () => {
      const userAddress = "0xuser000000000000000000000000000000000000";
      const building1Address = "0xbuild1000000000000000000000000000000000000";
      const building2Address = "0xbuild2000000000000000000000000000000000000";
      const token1Address = "0xtoken1000000000000000000000000000000000000";
      const token2Address = "0xtoken2000000000000000000000000000000000000";
      const treasury1Address = "0xtreas1000000000000000000000000000000000000";
      const treasury2Address = "0xtreas2000000000000000000000000000000000000";
      const vault1Address = "0xvault1000000000000000000000000000000000000";
      const vault2Address = "0xvault2000000000000000000000000000000000000";
      const rewardToken = "0xreward000000000000000000000000000000000000";

      setAddress(userAddress);

      // Mock buildings list
      mockReadBuildingsList.mockResolvedValue([[[building1Address], [building2Address]]]);

      // Mock building details
      mockReadBuildingDetails
         .mockResolvedValueOnce([[null, null, null, null, token1Address, treasury1Address]])
         .mockResolvedValueOnce([[null, null, null, null, token2Address, treasury2Address]]);

      // Mock vault addresses
      mockReadContract
         .mockResolvedValueOnce([vault1Address]) // vault for building1
         .mockResolvedValueOnce([vault2Address]) // vault for building2
         .mockResolvedValueOnce([rewardToken]) // reward tokens for building1
         .mockResolvedValueOnce([rewardToken]); // reward tokens for building2

      // Mock token data for building1 (with balance)
      mockGetTokenBalanceOf.mockResolvedValueOnce([BigInt("1000000000000000000")]); // 1 token
      mockGetTokenDecimals.mockResolvedValueOnce([18]);
      mockGetTokenSymbol.mockResolvedValueOnce("TOKEN1");
      mockGetUserReward.mockResolvedValueOnce(5.5);

      // Mock token data for building2 (with zero balance)
      mockGetTokenBalanceOf.mockResolvedValueOnce([BigInt("0")]); // 0 tokens
      mockGetTokenDecimals.mockResolvedValueOnce([18]);
      mockGetTokenSymbol.mockResolvedValueOnce("TOKEN2");
      mockGetUserReward.mockResolvedValueOnce(0);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => usePortfolioData(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Should only return tokens with non-zero balance
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]).toEqual({
         tokenAddress: token1Address,
         balance: 1, // 1 token with 18 decimals
         symbol: "TOKEN1",
         exchangeRateUSDC: 1,
         pendingRewards: 5.5,
      });

      expect(mockReadBuildingsList).toHaveBeenCalledTimes(1);
      expect(mockReadBuildingDetails).toHaveBeenCalledWith(building1Address);
      expect(mockReadBuildingDetails).toHaveBeenCalledWith(building2Address);
      expect(mockGetTokenBalanceOf).toHaveBeenCalledWith(token1Address, userAddress);
      expect(mockGetTokenBalanceOf).toHaveBeenCalledWith(token2Address, userAddress);
   });

   it("handles different token decimals correctly", async () => {
      const userAddress = "0xuser000000000000000000000000000000000000";
      const buildingAddress = "0xbuild1000000000000000000000000000000000000";
      const tokenAddress = "0xtoken1000000000000000000000000000000000000";
      const treasuryAddress = "0xtreas1000000000000000000000000000000000000";
      const vaultAddress = "0xvault1000000000000000000000000000000000000";
      const rewardToken = "0xreward000000000000000000000000000000000000";

      setAddress(userAddress);
      mockReadBuildingsList.mockResolvedValue([[buildingAddress]]);
      mockReadBuildingDetails.mockResolvedValue([
         [null, null, null, null, tokenAddress, treasuryAddress],
      ]);
      mockReadContract.mockResolvedValueOnce([vaultAddress]).mockResolvedValueOnce([rewardToken]);

      // Token with 6 decimals
      mockGetTokenBalanceOf.mockResolvedValue([BigInt("1000000")]); // 1 token with 6 decimals
      mockGetTokenDecimals.mockResolvedValue([6]);
      mockGetTokenSymbol.mockResolvedValue("USDC");
      mockGetUserReward.mockResolvedValue(2.5);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => usePortfolioData(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data?.[0]).toEqual({
         tokenAddress: tokenAddress,
         balance: 1, // 1 token with 6 decimals
         symbol: "USDC",
         exchangeRateUSDC: 1,
         pendingRewards: 2.5,
      });
   });

   it("handles missing token symbol gracefully", async () => {
      const userAddress = "0xuser000000000000000000000000000000000000";
      const buildingAddress = "0xbuild1000000000000000000000000000000000000";
      const tokenAddress = "0xtoken1000000000000000000000000000000000000";
      const treasuryAddress = "0xtreas1000000000000000000000000000000000000";
      const vaultAddress = "0xvault1000000000000000000000000000000000000";
      const rewardToken = "0xreward000000000000000000000000000000000000";

      setAddress(userAddress);
      mockReadBuildingsList.mockResolvedValue([[buildingAddress]]);
      mockReadBuildingDetails.mockResolvedValue([
         [null, null, null, null, tokenAddress, treasuryAddress],
      ]);
      mockReadContract.mockResolvedValueOnce([vaultAddress]).mockResolvedValueOnce([rewardToken]);

      mockGetTokenBalanceOf.mockResolvedValue([BigInt("1000000000000000000")]);
      mockGetTokenDecimals.mockResolvedValue([18]);
      mockGetTokenSymbol.mockResolvedValue(null); // Missing symbol
      mockGetUserReward.mockResolvedValue(0);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => usePortfolioData(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data?.[0].symbol).toBe("N/A");
   });

   it("is disabled when evmAddress is not available", () => {
      setAddress(null);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => usePortfolioData(), { wrapper: Wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
   });

   it("handles contract call errors gracefully", async () => {
      const userAddress = "0xuser000000000000000000000000000000000000";

      setAddress(userAddress);
      mockReadBuildingsList.mockRejectedValue(new Error("Failed to read buildings"));

      const Wrapper = createWrapper();
      const { result } = renderHook(() => usePortfolioData(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
   });

   it("processes multiple buildings with mixed balances correctly", async () => {
      const userAddress = "0xuser000000000000000000000000000000000000";
      const buildings = ["0xbuild1", "0xbuild2", "0xbuild3"].map((addr) => addr.padEnd(42, "0"));
      const tokens = ["0xtoken1", "0xtoken2", "0xtoken3"].map((addr) => addr.padEnd(42, "0"));
      const treasuries = ["0xtreas1", "0xtreas2", "0xtreas3"].map((addr) => addr.padEnd(42, "0"));
      const vaults = ["0xvault1", "0xvault2", "0xvault3"].map((addr) => addr.padEnd(42, "0"));
      const rewardToken = "0xreward".padEnd(42, "0");

      setAddress(userAddress);
      mockReadBuildingsList.mockResolvedValue([buildings]);

      // Mock building details for each building
      buildings.forEach((building, i) => {
         mockReadBuildingDetails.mockResolvedValueOnce([
            [null, null, null, null, tokens[i], treasuries[i]],
         ]);
      });

      // Mock vault and reward token calls
      vaults.forEach((vault) => {
         mockReadContract.mockResolvedValueOnce([vault]).mockResolvedValueOnce([rewardToken]);
      });

      // Mock token data: only first and third have balance
      mockGetTokenBalanceOf
         .mockResolvedValueOnce([BigInt("2000000000000000000")]) // 2 tokens
         .mockResolvedValueOnce([BigInt("0")]) // 0 tokens
         .mockResolvedValueOnce([BigInt("500000000000000000")]); // 0.5 tokens

      mockGetTokenDecimals
         .mockResolvedValueOnce([18])
         .mockResolvedValueOnce([18])
         .mockResolvedValueOnce([18]);

      mockGetTokenSymbol
         .mockResolvedValueOnce("TOK1")
         .mockResolvedValueOnce("TOK2")
         .mockResolvedValueOnce("TOK3");

      mockGetUserReward
         .mockResolvedValueOnce(10)
         .mockResolvedValueOnce(0)
         .mockResolvedValueOnce(3.5);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => usePortfolioData(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Should return only tokens with non-zero balance (first and third)
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0]).toEqual({
         tokenAddress: tokens[0],
         balance: 2,
         symbol: "TOK1",
         exchangeRateUSDC: 1,
         pendingRewards: 10,
      });
      expect(result.current.data?.[1]).toEqual({
         tokenAddress: tokens[2],
         balance: 0.5,
         symbol: "TOK3",
         exchangeRateUSDC: 1,
         pendingRewards: 3.5,
      });
   });
});
