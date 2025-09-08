import { renderHook } from "@testing-library/react";
import { useExecuteTransaction } from "@/hooks/useExecuteTransaction";
import { TransactionReceipt } from "@hashgraph/sdk";

// Mock dependencies
jest.mock("@buidlerlabs/hashgraph-react-wallets", () => ({
   useWatchTransactionReceipt: jest.fn(),
}));

import { useWatchTransactionReceipt } from "@buidlerlabs/hashgraph-react-wallets";

describe("useExecuteTransaction", () => {
   const mockWatch = jest.fn();
   const mockUseWatchTransactionReceipt = useWatchTransactionReceipt as jest.MockedFunction<typeof useWatchTransactionReceipt>;

   beforeEach(() => {
      jest.clearAllMocks();
      mockUseWatchTransactionReceipt.mockReturnValue({
         watch: mockWatch,
      });
   });

   it("returns executeTransaction function", () => {
      const { result } = renderHook(() => useExecuteTransaction());
      
      expect(typeof result.current.executeTransaction).toBe("function");
   });

   it("executes transaction successfully with string result", async () => {
      const transactionId = "0.0.123@1234567890.123456789";
      const expectedResult = { transaction_id: transactionId, status: "success" };
      
      const mockTransactionFn = jest.fn().mockResolvedValue(transactionId);
      
      // Mock watch to immediately call onSuccess
      mockWatch.mockImplementation((txId, callbacks) => {
         setTimeout(() => callbacks.onSuccess(expectedResult), 0);
      });

      const { result } = renderHook(() => useExecuteTransaction());
      
      const executePromise = result.current.executeTransaction(mockTransactionFn);
      const actualResult = await executePromise;

      expect(mockTransactionFn).toHaveBeenCalled();
      expect(mockWatch).toHaveBeenCalledWith(transactionId, {
         onSuccess: expect.any(Function),
         onError: expect.any(Function),
      });
      expect(actualResult).toEqual(expectedResult);
   });

   it("executes transaction successfully with TransactionReceipt result", async () => {
      const mockReceipt = {
         toString: () => "0.0.123@1234567890.123456789",
         status: { toString: () => "SUCCESS" },
      } as TransactionReceipt;
      
      const expectedResult = { transaction_id: "0.0.123@1234567890.123456789", status: "success" };
      
      const mockTransactionFn = jest.fn().mockResolvedValue(mockReceipt);
      
      mockWatch.mockImplementation((txId, callbacks) => {
         setTimeout(() => callbacks.onSuccess(expectedResult), 0);
      });

      const { result } = renderHook(() => useExecuteTransaction());
      
      const actualResult = await result.current.executeTransaction(mockTransactionFn);

      expect(mockTransactionFn).toHaveBeenCalled();
      expect(mockWatch).toHaveBeenCalledWith("0.0.123@1234567890.123456789", {
         onSuccess: expect.any(Function),
         onError: expect.any(Function),
      });
      expect(actualResult).toEqual(expectedResult);
   });

   it("handles transaction function failure", async () => {
      const error = new Error("Transaction function failed");
      const mockTransactionFn = jest.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useExecuteTransaction());
      
      await expect(result.current.executeTransaction(mockTransactionFn)).rejects.toEqual({
         error,
         transaction_id: "",
         tx: "",
      });

      expect(mockTransactionFn).toHaveBeenCalled();
      expect(mockWatch).not.toHaveBeenCalled();
   });

   it("handles null result from transaction function", async () => {
      const mockTransactionFn = jest.fn().mockResolvedValue(null);

      const { result } = renderHook(() => useExecuteTransaction());
      
      await expect(result.current.executeTransaction(mockTransactionFn)).rejects.toEqual({
         error: new Error("Transaction failed: received null result"),
         transaction_id: "",
         tx: "",
      });

      expect(mockTransactionFn).toHaveBeenCalled();
      expect(mockWatch).not.toHaveBeenCalled();
   });

   it("handles watch onError callback", async () => {
      const transactionId = "0.0.123@1234567890.123456789";
      const watchError = new Error("Watch failed");
      
      const mockTransactionFn = jest.fn().mockResolvedValue(transactionId);
      
      // Mock watch to immediately call onError
      mockWatch.mockImplementation((txId, callbacks) => {
         setTimeout(() => callbacks.onError(null, watchError), 0);
      });

      const { result } = renderHook(() => useExecuteTransaction());
      
      await expect(result.current.executeTransaction(mockTransactionFn)).rejects.toBe(watchError);

      expect(mockTransactionFn).toHaveBeenCalled();
      expect(mockWatch).toHaveBeenCalledWith(transactionId, {
         onSuccess: expect.any(Function),
         onError: expect.any(Function),
      });
   });

   it("includes transaction_id in error when transaction function succeeds but watch fails", async () => {
      const transactionId = "0.0.123@1234567890.123456789";
      const originalError = new Error("Original error");
      
      // Mock transaction function to throw after getting the transaction ID
      const mockTransactionFn = jest.fn().mockImplementation(async () => {
         const result = transactionId;
         // Simulate error after getting transaction ID
         throw originalError;
      });

      const { result } = renderHook(() => useExecuteTransaction());
      
      await expect(result.current.executeTransaction(mockTransactionFn)).rejects.toEqual({
         error: originalError,
         transaction_id: "",
         tx: "",
      });
   });

   it("handles different transaction result types correctly", async () => {
      const transactionResults = [
         "simple-string-tx-id",
         { toString: () => "object-with-toString" },
         "0.0.123@1234567890.123456789",
      ];

      const { result } = renderHook(() => useExecuteTransaction());

      for (const txResult of transactionResults) {
         const mockTransactionFn = jest.fn().mockResolvedValue(txResult);
         const expectedResult = { success: true };
         
         mockWatch.mockImplementation((txId, callbacks) => {
            setTimeout(() => callbacks.onSuccess(expectedResult), 0);
         });

         const actualResult = await result.current.executeTransaction(mockTransactionFn);
         
         expect(actualResult).toEqual(expectedResult);
         
         const expectedTxId = typeof txResult === "string" ? txResult : txResult.toString();
         expect(mockWatch).toHaveBeenCalledWith(expectedTxId, expect.any(Object));
         
         jest.clearAllMocks();
         mockUseWatchTransactionReceipt.mockReturnValue({ watch: mockWatch });
      }
   });

   it("properly types the generic transaction result", async () => {
      interface CustomTransaction {
         transaction_id: string;
         customField: string;
      }

      const transactionId = "0.0.123@1234567890.123456789";
      const expectedResult: CustomTransaction = { 
         transaction_id: transactionId, 
         customField: "custom-value" 
      };
      
      const mockTransactionFn = jest.fn().mockResolvedValue(transactionId);
      
      mockWatch.mockImplementation((txId, callbacks) => {
         setTimeout(() => callbacks.onSuccess(expectedResult), 0);
      });

      const { result } = renderHook(() => useExecuteTransaction());
      
      const actualResult = await result.current.executeTransaction<CustomTransaction>(mockTransactionFn);

      expect(actualResult).toEqual(expectedResult);
      expect(actualResult.customField).toBe("custom-value");
   });
});