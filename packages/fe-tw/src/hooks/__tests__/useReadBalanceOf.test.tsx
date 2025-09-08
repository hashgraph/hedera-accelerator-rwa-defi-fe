import { readBalanceOf } from "@/hooks/useReadBalanceOf";
import { readContract } from "@/services/contracts/readContract";

// Mock the readContract function
jest.mock("@/services/contracts/readContract", () => ({
   readContract: jest.fn(),
}));

const mockReadContract = readContract as jest.MockedFunction<typeof readContract>;

describe("useReadBalanceOf", () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   it("calls readContract with correct parameters", async () => {
      const tokenAddress = "0x1234567890123456789012345678901234567890" as const;
      const accountEvmAddress = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef";
      const expectedBalance = BigInt("1000000000000000000"); // 1 token with 18 decimals

      mockReadContract.mockResolvedValueOnce(expectedBalance);

      const result = await readBalanceOf(tokenAddress, accountEvmAddress);

      expect(mockReadContract).toHaveBeenCalledWith({
         abi: expect.any(Array), // tokenAbi
         functionName: "balanceOf",
         address: tokenAddress,
         args: [accountEvmAddress],
      });
      expect(result).toBe(expectedBalance);
   });

   it("handles null account address", async () => {
      const tokenAddress = "0x1234567890123456789012345678901234567890" as const;
      const accountEvmAddress = null;

      mockReadContract.mockResolvedValueOnce(BigInt(0));

      const result = await readBalanceOf(tokenAddress, accountEvmAddress);

      expect(mockReadContract).toHaveBeenCalledWith({
         abi: expect.any(Array),
         functionName: "balanceOf",
         address: tokenAddress,
         args: [null],
      });
      expect(result).toBe(BigInt(0));
   });

   it("propagates errors from readContract", async () => {
      const tokenAddress = "0x1234567890123456789012345678901234567890" as const;
      const accountEvmAddress = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef";
      const error = new Error("Contract call failed");

      mockReadContract.mockRejectedValueOnce(error);

      await expect(readBalanceOf(tokenAddress, accountEvmAddress)).rejects.toThrow(
         "Contract call failed"
      );
   });

   it("handles different token addresses", async () => {
      const tokenAddress1 = "0x1111111111111111111111111111111111111111" as const;
      const tokenAddress2 = "0x2222222222222222222222222222222222222222" as const;
      const accountEvmAddress = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef";

      mockReadContract.mockResolvedValueOnce(BigInt("100"));
      mockReadContract.mockResolvedValueOnce(BigInt("200"));

      const result1 = await readBalanceOf(tokenAddress1, accountEvmAddress);
      const result2 = await readBalanceOf(tokenAddress2, accountEvmAddress);

      expect(result1).toBe(BigInt("100"));
      expect(result2).toBe(BigInt("200"));
      expect(mockReadContract).toHaveBeenCalledTimes(2);
   });
});