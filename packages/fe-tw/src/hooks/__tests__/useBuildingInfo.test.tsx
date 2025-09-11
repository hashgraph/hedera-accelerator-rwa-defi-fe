import { renderHook, waitFor } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ethers } from "ethers";

jest.mock("@/hooks/useBuildings", () => ({
   readBuildingDetails: jest.fn(),
}));

jest.mock("@/services/erc20Service", () => ({
   getTokenDecimals: jest.fn(),
   getTokenBalanceOf: jest.fn(),
}));

jest.mock("@/hooks/useSwapsHistory", () => ({
   readUniswapPairs: jest.fn(),
}));


jest.mock("@buidlerlabs/hashgraph-react-wallets", () => ({
   useEvmAddress: () => ({ data: "0xabc0000000000000000000000000000000000000" as const }),
}));

jest.mock("@/hooks/useBuildingOwner", () => ({
   useBuildingOwner: jest.fn(() => ({
      buildingOwnerAddress: "0x0wn3000000000000000000000000000000000000",
      isLoading: false,
   })),
}));

import { useBuildingInfo } from "@/hooks/useBuildingInfo";
import * as BuildingOwnerModule from "@/hooks/useBuildingOwner";
import { readBuildingDetails } from "@/hooks/useBuildings";
import { getTokenBalanceOf, getTokenDecimals } from "@/services/erc20Service";
import { readUniswapPairs } from "@/hooks/useSwapsHistory";

describe("useBuildingInfo", () => {
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

   it("returns building details, owner, tokenAmountMinted and pair address", async () => {
      (readBuildingDetails as jest.Mock).mockResolvedValueOnce([
         [
            "0xb111000000000000000000000000000000000000", // [0] address
            null, // [1]
            null, // [2]
            "0xaud1000000000000000000000000000000000000", // [3] auditRegistryAddress
            "0xtok1000000000000000000000000000000000000", // [4] tokenAddress
            "0xtrs1000000000000000000000000000000000000", // [5] treasuryAddress
            "0xgov1000000000000000000000000000000000000", // [6] governanceAddress
            "0xval1000000000000000000000000000000000000", // [7] vaultAddress
            "0xcmp1000000000000000000000000000000000000", // [8] autoCompounder
         ],
      ]);

      (getTokenDecimals as jest.Mock).mockResolvedValueOnce([6]);
      (getTokenBalanceOf as jest.Mock).mockResolvedValueOnce([BigInt(1000000)]);
      (readUniswapPairs as jest.Mock).mockResolvedValueOnce([
         "0xpa1r000000000000000000000000000000000000",
      ]);

      const Wrapper = createWrapper();

      const { result } = renderHook(
         () => useBuildingInfo("0xdead000000000000000000000000000000000000"),
         { wrapper: Wrapper },
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.address).toBe("0xb111000000000000000000000000000000000000");
      expect(result.current.auditRegistryAddress).toBe(
         "0xaud1000000000000000000000000000000000000",
      );
      expect(result.current.tokenAddress).toBe("0xtok1000000000000000000000000000000000000");
      expect(result.current.treasuryAddress).toBe("0xtrs1000000000000000000000000000000000000");
      expect(result.current.governanceAddress).toBe("0xgov1000000000000000000000000000000000000");
      expect(result.current.vaultAddress).toBe("0xval1000000000000000000000000000000000000");
      expect(result.current.autoCompounderAddress).toBe(
         "0xcmp1000000000000000000000000000000000000",
      );

      expect(result.current.buildingOwnerAddress).toBe(
         "0x0wn3000000000000000000000000000000000000",
      );
      expect(result.current.tokenAmountMinted).toBe(1);
      expect(result.current.liquidityPairAddress).toBe(
         "0xpa1r000000000000000000000000000000000000",
      );
   });

   it("is disabled and returns undefined fields when id is not provided", async () => {
      jest
         .spyOn(BuildingOwnerModule, "useBuildingOwner")
         .mockReturnValue({ buildingOwnerAddress: undefined, isLoading: false } as any);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useBuildingInfo(undefined), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.address).toBeUndefined();
      expect(result.current.tokenAddress).toBeUndefined();
      expect(result.current.tokenAmountMinted).toBeUndefined();
      expect(result.current.liquidityPairAddress).toBeUndefined();
      expect(result.current.buildingOwnerAddress).toBeUndefined();
   });

   it("falls back to ZeroAddress when autoCompounder is missing", async () => {
      (readBuildingDetails as jest.Mock).mockResolvedValueOnce([
         [
            "0xb111000000000000000000000000000000000000",
            null,
            null,
            "0xaud1000000000000000000000000000000000000",
            "0xtok1000000000000000000000000000000000000",
            "0xtrs1000000000000000000000000000000000000",
            "0xgov1000000000000000000000000000000000000",
            "0xval1000000000000000000000000000000000000",
            undefined, // missing autoCompounderAddress
         ],
      ]);
      (getTokenDecimals as jest.Mock).mockResolvedValueOnce([6]);
      (getTokenBalanceOf as jest.Mock).mockResolvedValueOnce([BigInt(0)]);
      (readUniswapPairs as jest.Mock).mockResolvedValueOnce([null]);

      const Wrapper = createWrapper();
      const { result } = renderHook(
         () => useBuildingInfo("0xdead000000000000000000000000000000000000"),
         { wrapper: Wrapper },
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.autoCompounderAddress).toBe(ethers.ZeroAddress);
   });
});
