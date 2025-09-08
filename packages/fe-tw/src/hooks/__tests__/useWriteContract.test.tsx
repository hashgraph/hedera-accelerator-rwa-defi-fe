import { renderHook } from "@testing-library/react";
import useWriteContract from "@/hooks/useWriteContract";
import { ContractId } from "@hashgraph/sdk";

// Mock dependencies
jest.mock("@/services/tryCatch", () => ({
   tryCatch: jest.fn(),
}));

jest.mock("@/services/wallets/estimateGas", () => ({
   estimateGas: jest.fn(),
}));

jest.mock("@buidlerlabs/hashgraph-react-wallets", () => ({
   useEvmAddress: jest.fn(),
   useWallet: jest.fn(),
   useWriteContract: jest.fn(),
}));

import { tryCatch } from "@/services/tryCatch";
import { estimateGas } from "@/services/wallets/estimateGas";
import { useEvmAddress, useWallet, useWriteContract as useOriginalWriteContract } from "@buidlerlabs/hashgraph-react-wallets";

describe("useWriteContract", () => {
   const mockWriteContract = jest.fn();
   const mockTryCatch = tryCatch as jest.MockedFunction<typeof tryCatch>;
   const mockEstimateGas = estimateGas as jest.MockedFunction<typeof estimateGas>;
   const mockUseEvmAddress = useEvmAddress as jest.MockedFunction<typeof useEvmAddress>;
   const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;
   const mockUseOriginalWriteContract = useOriginalWriteContract as jest.MockedFunction<typeof useOriginalWriteContract>;

   const mockParams = {
      contractId: ContractId.fromString("0.0.1234"),
      abi: [],
      functionName: "testFunction",
      args: ["arg1", "arg2"],
      metaArgs: { customValue: "test" },
   };

   beforeEach(() => {
      jest.clearAllMocks();
      mockUseOriginalWriteContract.mockReturnValue({ writeContract: mockWriteContract });
      mockUseEvmAddress.mockReturnValue({ data: "0xtest000000000000000000000000000000000000" });
      mockUseWallet.mockReturnValue({ isConnected: false });
   });

   it("returns writeContract function", () => {
      const { result } = renderHook(() => useWriteContract());
      
      expect(typeof result.current.writeContract).toBe("function");
   });

   it("calls original writeContract when Hashpack not connected and gas estimation disabled", async () => {
      mockUseWallet.mockReturnValue({ isConnected: false });
      
      const { result } = renderHook(() => useWriteContract());
      
      await result.current.writeContract(mockParams);
      
      expect(mockWriteContract).toHaveBeenCalledWith(mockParams);
      expect(mockEstimateGas).not.toHaveBeenCalled();
   });

   it("estimates gas when Hashpack is connected and evm address available", async () => {
      mockUseWallet.mockReturnValue({ isConnected: true });
      mockUseEvmAddress.mockReturnValue({ data: "0xtest000000000000000000000000000000000000" });
      
      const mockEstimatedGas = { result: "21000" };
      mockTryCatch.mockResolvedValueOnce({ data: mockEstimatedGas, error: null });
      
      const { result } = renderHook(() => useWriteContract());
      
      await result.current.writeContract(mockParams);
      
      expect(mockEstimateGas).toHaveBeenCalledWith(
         "0xtest000000000000000000000000000000000000",
         mockParams.contractId,
         mockParams.abi,
         mockParams.functionName,
         mockParams.args
      );
      
      expect(mockWriteContract).toHaveBeenCalledWith({
         ...mockParams,
         metaArgs: { ...mockParams.metaArgs, gas: 21000 },
      });
   });

   it("estimates gas when shouldEstimateGas is true", async () => {
      mockUseWallet.mockReturnValue({ isConnected: false });
      
      const mockEstimatedGas = { result: 42000 };
      mockTryCatch.mockResolvedValueOnce({ data: mockEstimatedGas, error: null });
      
      const { result } = renderHook(() => useWriteContract({ shouldEstimateGas: true }));
      
      await result.current.writeContract(mockParams);
      
      expect(mockEstimateGas).toHaveBeenCalled();
      expect(mockWriteContract).toHaveBeenCalledWith({
         ...mockParams,
         metaArgs: { ...mockParams.metaArgs, gas: 42000 },
      });
   });

   it("falls back to original params when gas estimation fails", async () => {
      mockUseWallet.mockReturnValue({ isConnected: true });
      mockUseEvmAddress.mockReturnValue({ data: "0xtest000000000000000000000000000000000000" });
      
      const mockError = new Error("Gas estimation failed");
      mockTryCatch.mockResolvedValueOnce({ data: null, error: mockError });
      
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      
      const { result } = renderHook(() => useWriteContract());
      
      await result.current.writeContract(mockParams);
      
      expect(consoleSpy).toHaveBeenCalledWith(
         "Error estimating gas, proceeding with original params:",
         mockError
      );
      expect(mockWriteContract).toHaveBeenCalledWith(mockParams);
      
      consoleSpy.mockRestore();
   });

   it("falls back to original params when gas estimation returns invalid number", async () => {
      mockUseWallet.mockReturnValue({ isConnected: true });
      mockUseEvmAddress.mockReturnValue({ data: "0xtest000000000000000000000000000000000000" });
      
      const mockEstimatedGas = { result: "invalid" };
      mockTryCatch.mockResolvedValueOnce({ data: mockEstimatedGas, error: null });
      
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      
      const { result } = renderHook(() => useWriteContract());
      
      await result.current.writeContract(mockParams);
      
      expect(consoleSpy).toHaveBeenCalledWith(
         "Gas estimation did not return a valid number. Proceeding with original params."
      );
      expect(mockWriteContract).toHaveBeenCalledWith(mockParams);
      
      consoleSpy.mockRestore();
   });

   it("falls back to original params when gas estimation returns undefined result", async () => {
      mockUseWallet.mockReturnValue({ isConnected: true });
      mockUseEvmAddress.mockReturnValue({ data: "0xtest000000000000000000000000000000000000" });
      
      const mockEstimatedGas = { result: undefined };
      mockTryCatch.mockResolvedValueOnce({ data: mockEstimatedGas, error: null });
      
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      
      const { result } = renderHook(() => useWriteContract());
      
      await result.current.writeContract(mockParams);
      
      expect(consoleSpy).toHaveBeenCalledWith(
         "Gas estimation did not return a valid number. Proceeding with original params."
      );
      expect(mockWriteContract).toHaveBeenCalledWith(mockParams);
      
      consoleSpy.mockRestore();
   });

   it("handles missing metaArgs parameter", async () => {
      mockUseWallet.mockReturnValue({ isConnected: true });
      mockUseEvmAddress.mockReturnValue({ data: "0xtest000000000000000000000000000000000000" });
      
      const paramsWithoutMetaArgs = {
         contractId: ContractId.fromString("0.0.1234"),
         abi: [],
         functionName: "testFunction",
         args: ["arg1", "arg2"],
      };
      
      const mockEstimatedGas = { result: "30000" };
      mockTryCatch.mockResolvedValueOnce({ data: mockEstimatedGas, error: null });
      
      const { result } = renderHook(() => useWriteContract());
      
      await result.current.writeContract(paramsWithoutMetaArgs);
      
      expect(mockWriteContract).toHaveBeenCalledWith({
         ...paramsWithoutMetaArgs,
         metaArgs: { gas: 30000 },
      });
   });

   it("handles numeric gas estimation result", async () => {
      mockUseWallet.mockReturnValue({ isConnected: true });
      mockUseEvmAddress.mockReturnValue({ data: "0xtest000000000000000000000000000000000000" });
      
      const mockEstimatedGas = { result: 25000 }; // numeric instead of string
      mockTryCatch.mockResolvedValueOnce({ data: mockEstimatedGas, error: null });
      
      const { result } = renderHook(() => useWriteContract());
      
      await result.current.writeContract(mockParams);
      
      expect(mockWriteContract).toHaveBeenCalledWith({
         ...mockParams,
         metaArgs: { ...mockParams.metaArgs, gas: 25000 },
      });
   });

   it("does not estimate gas when Hashpack is connected but no evm address", async () => {
      mockUseWallet.mockReturnValue({ isConnected: true });
      mockUseEvmAddress.mockReturnValue({ data: null });
      
      const { result } = renderHook(() => useWriteContract());
      
      await result.current.writeContract(mockParams);
      
      expect(mockEstimateGas).not.toHaveBeenCalled();
      expect(mockWriteContract).toHaveBeenCalledWith(mockParams);
   });
});