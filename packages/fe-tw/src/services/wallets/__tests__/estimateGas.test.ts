import { ContractId } from "@hashgraph/sdk";
import { ethers } from "ethers";
import { estimateGas } from "../estimateGas";

// Mock ethers
jest.mock("ethers", () => ({
   ethers: {
      Interface: jest.fn(),
   },
}));

// Mock fetch
global.fetch = jest.fn();

describe("estimateGas", () => {
   const mockContractId = {
      toSolidityAddress: jest.fn().mockReturnValue("1234567890abcdef1234567890abcdef12345678"),
   } as unknown as ContractId;

   const mockAbi = [
      {
         name: "testFunction",
         type: "function",
         inputs: [{ name: "param1", type: "string" }],
      },
   ];

   const mockInterface = {
      encodeFunctionData: jest.fn(),
   };

   beforeEach(() => {
      jest.clearAllMocks();
      (ethers.Interface as jest.Mock).mockImplementation(() => mockInterface);
      (global.fetch as jest.Mock).mockResolvedValue({
         json: jest.fn().mockResolvedValue({ result: "success" }),
      });
   });

   describe("Successful gas estimation", () => {
      it("should estimate gas successfully with basic parameters", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = ["testArg"];
         const encodedData = "0x123456789abcdef";

         mockInterface.encodeFunctionData.mockReturnValue(encodedData);

         const result = await estimateGas(from, mockContractId, mockAbi, functionName, args);

         expect(ethers.Interface).toHaveBeenCalledWith(mockAbi);
         expect(mockInterface.encodeFunctionData).toHaveBeenCalledWith(functionName, args);
         expect(global.fetch).toHaveBeenCalledWith(
            "https://testnet.mirrornode.hedera.com/api/v1/contracts/call",
            {
               method: "POST",
               headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({
                  block: "latest",
                  data: encodedData,
                  estimate: true,
                  from,
                  gas: 15000000,
                  gasPrice: 1,
                  to: "0x1234567890abcdef1234567890abcdef12345678",
                  value: "0",
               }),
            }
         );
         expect(result).toEqual({ result: "success" });
      });

      it("should estimate gas with value parameter", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = ["testArg"];
         const value = BigInt("1000000000000000000"); // 1 ETH in wei (18 decimals)
         const encodedData = "0x123456789abcdef";

         mockInterface.encodeFunctionData.mockReturnValue(encodedData);

         await estimateGas(from, mockContractId, mockAbi, functionName, args, value);

         const expectedValue8 = value / BigInt("10000000000"); // Convert to 8 decimals
         expect(global.fetch).toHaveBeenCalledWith(
            "https://testnet.mirrornode.hedera.com/api/v1/contracts/call",
            expect.objectContaining({
               body: JSON.stringify({
                  block: "latest",
                  data: encodedData,
                  estimate: true,
                  from,
                  gas: 15000000,
                  gasPrice: 1,
                  to: "0x1234567890abcdef1234567890abcdef12345678",
                  value: expectedValue8.toString(),
               }),
            })
         );
      });

      it("should handle undefined value parameter", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = ["testArg"];
         const encodedData = "0x123456789abcdef";

         mockInterface.encodeFunctionData.mockReturnValue(encodedData);

         await estimateGas(from, mockContractId, mockAbi, functionName, args, undefined);

         expect(global.fetch).toHaveBeenCalledWith(
            "https://testnet.mirrornode.hedera.com/api/v1/contracts/call",
            expect.objectContaining({
               body: JSON.stringify({
                  block: "latest",
                  data: encodedData,
                  estimate: true,
                  from,
                  gas: 15000000,
                  gasPrice: 1,
                  to: "0x1234567890abcdef1234567890abcdef12345678",
                  value: "0",
               }),
            })
         );
      });

      it("should convert contract ID to Solidity address correctly", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = ["testArg"];

         await estimateGas(from, mockContractId, mockAbi, functionName, args);

         expect(mockContractId.toSolidityAddress).toHaveBeenCalled();
         expect(global.fetch).toHaveBeenCalledWith(
            "https://testnet.mirrornode.hedera.com/api/v1/contracts/call",
            expect.objectContaining({
               body: expect.stringContaining('"to":"0x1234567890abcdef1234567890abcdef12345678"'),
            })
         );
      });

      it("should encode function data with correct parameters", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = ["arg1", "arg2", 123];

         await estimateGas(from, mockContractId, mockAbi, functionName, args);

         expect(mockInterface.encodeFunctionData).toHaveBeenCalledWith(functionName, args);
      });
   });

   describe("Value conversion (18 to 8 decimals)", () => {
      it("should convert large value correctly", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = [];
         const value = BigInt("12345678901234567890"); // ~12.34 ETH

         await estimateGas(from, mockContractId, mockAbi, functionName, args, value);

         const expectedValue8 = BigInt("1234567890"); // 12.34 in 8 decimals
         expect(global.fetch).toHaveBeenCalledWith(
            "https://testnet.mirrornode.hedera.com/api/v1/contracts/call",
            expect.objectContaining({
               body: expect.stringContaining(`"value":"${expectedValue8.toString()}"`),
            })
         );
      });

      it("should handle zero value correctly", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = [];
         const value = BigInt("0");

         await estimateGas(from, mockContractId, mockAbi, functionName, args, value);

         expect(global.fetch).toHaveBeenCalledWith(
            "https://testnet.mirrornode.hedera.com/api/v1/contracts/call",
            expect.objectContaining({
               body: expect.stringContaining('"value":"0"'),
            })
         );
      });

      it("should handle small value (less than 8 decimals) correctly", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = [];
         const value = BigInt("123456789"); // Less than 10^10

         await estimateGas(from, mockContractId, mockAbi, functionName, args, value);

         const expectedValue8 = BigInt("0"); // Should round down to 0
         expect(global.fetch).toHaveBeenCalledWith(
            "https://testnet.mirrornode.hedera.com/api/v1/contracts/call",
            expect.objectContaining({
               body: expect.stringContaining('"value":"0"'),
            })
         );
      });
   });

   describe("Error handling", () => {
      it("should handle fetch network error", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = ["testArg"];

         (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

         await expect(estimateGas(from, mockContractId, mockAbi, functionName, args)).rejects.toThrow(
            "Network error"
         );
      });

      it("should handle JSON parsing error", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = ["testArg"];

         (global.fetch as jest.Mock).mockResolvedValue({
            json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
         });

         await expect(estimateGas(from, mockContractId, mockAbi, functionName, args)).rejects.toThrow(
            "Invalid JSON"
         );
      });

      it("should handle ethers interface creation error", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = ["testArg"];

         (ethers.Interface as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid ABI");
         });

         await expect(estimateGas(from, mockContractId, mockAbi, functionName, args)).rejects.toThrow(
            "Invalid ABI"
         );
      });

      it("should handle function encoding error", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = ["testArg"];

         mockInterface.encodeFunctionData.mockImplementation(() => {
            throw new Error("Function not found");
         });

         await expect(estimateGas(from, mockContractId, mockAbi, functionName, args)).rejects.toThrow(
            "Function not found"
         );
      });
   });

   describe("Request format validation", () => {
      beforeEach(() => {
         // Reset mocks for this section
         mockInterface.encodeFunctionData.mockReturnValue("0x123456789abcdef");
      });

      it("should send request with correct headers", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = [];

         await estimateGas(from, mockContractId, mockAbi, functionName, args);

         expect(global.fetch).toHaveBeenCalledWith(
            "https://testnet.mirrornode.hedera.com/api/v1/contracts/call",
            expect.objectContaining({
               method: "POST",
               headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
               },
            })
         );
      });

      it("should send request with correct default gas parameters", async () => {
         const from = "0xabcdef1234567890abcdef1234567890abcdef12";
         const functionName = "testFunction";
         const args = [];

         await estimateGas(from, mockContractId, mockAbi, functionName, args);

         expect(global.fetch).toHaveBeenCalledWith(
            "https://testnet.mirrornode.hedera.com/api/v1/contracts/call",
            expect.objectContaining({
               body: expect.stringContaining('"gas":15000000'),
            })
         );

         expect(global.fetch).toHaveBeenCalledWith(
            "https://testnet.mirrornode.hedera.com/api/v1/contracts/call",
            expect.objectContaining({
               body: expect.stringContaining('"gasPrice":1'),
            })
         );

         expect(global.fetch).toHaveBeenCalledWith(
            "https://testnet.mirrornode.hedera.com/api/v1/contracts/call",
            expect.objectContaining({
               body: expect.stringContaining('"block":"latest"'),
            })
         );

         expect(global.fetch).toHaveBeenCalledWith(
            "https://testnet.mirrornode.hedera.com/api/v1/contracts/call",
            expect.objectContaining({
               body: expect.stringContaining('"estimate":true'),
            })
         );
      });
   });

   describe("Integration with real-like data", () => {
      it("should handle realistic contract call scenario", async () => {
         const from = "0x742d35cc6000000000000000000000000000000123";
         const functionName = "transfer";
         const args = ["0x742d35cc6000000000000000000000000000000456", "1000000"];
         const value = BigInt("0");
         const encodedData = "0xa9059cbb000000000000000000000000742d35cc6000000000000000000000000000000456";

         mockInterface.encodeFunctionData.mockReturnValue(encodedData);
         (global.fetch as jest.Mock).mockResolvedValue({
            json: jest.fn().mockResolvedValue({
               result: "0x1234",
               gas_used: 21000,
            }),
         });

         const result = await estimateGas(from, mockContractId, mockAbi, functionName, args, value);

         expect(result).toEqual({
            result: "0x1234",
            gas_used: 21000,
         });

         expect(mockInterface.encodeFunctionData).toHaveBeenCalledWith(functionName, args);
      });
   });
});