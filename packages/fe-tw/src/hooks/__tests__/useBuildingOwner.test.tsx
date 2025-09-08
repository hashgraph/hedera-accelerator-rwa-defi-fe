import { renderHook, waitFor } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("@/services/contracts/readContract", () => ({
   readContract: jest.fn(),
}));

import { useBuildingOwner } from "@/hooks/useBuildingOwner";
import { readContract } from "@/services/contracts/readContract";

describe("useBuildingOwner", () => {
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

   it("returns owner address when provided a valid building address", async () => {
      const buildingAddress = "0xdead000000000000000000000000000000000000" as `0x${string}`;
      (readContract as jest.Mock).mockResolvedValueOnce([
         "0x0wn3000000000000000000000000000000000000",
      ]);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useBuildingOwner(buildingAddress), {
         wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(readContract).toHaveBeenCalledWith(
         expect.objectContaining({
            address: buildingAddress,
            functionName: "owner",
            args: [],
         }),
      );
      expect(result.current.buildingOwnerAddress).toBe(
         "0x0wn3000000000000000000000000000000000000",
      );
   });

   it("is disabled and returns undefined when building address is not provided", async () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useBuildingOwner(undefined as any), {
         wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.buildingOwnerAddress).toBeUndefined();
      expect(readContract).not.toHaveBeenCalled();
   });

   it("handles readContract error by exposing undefined address and not loading", async () => {
      const buildingAddress = "0xdead000000000000000000000000000000000000" as `0x${string}`;
      (readContract as jest.Mock).mockRejectedValueOnce(new Error("failed"));

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useBuildingOwner(buildingAddress), {
         wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.buildingOwnerAddress).toBeUndefined();
   });
});
