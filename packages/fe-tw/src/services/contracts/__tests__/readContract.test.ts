import { readContract } from "@/services/contracts/readContract";

jest.mock("ethers", () => {
   class Interface {
      abi: any;
      constructor(abi: any) {
         this.abi = abi;
      }
      encodeFunctionData(fn: string, args?: readonly unknown[]) {
         return `encoded:${fn}:${JSON.stringify(args ?? [])}`;
      }
      decodeFunctionResult(fn: string, data: string) {
         return [`decoded:${fn}:${data}`] as unknown as any;
      }
   }
   return { ethers: { Interface } };
});

describe("readContract", () => {
   const originalConsoleError = console.error;
   beforeEach(() => {
      jest.resetAllMocks();
   });

   afterEach(() => {
      console.error = originalConsoleError;
   });

   it("encodes call, posts to mirror node, and decodes result", async () => {
      const mockJson = jest.fn().mockResolvedValue({ result: "0xdeadbeef" });
      // @ts-ignore
      global.fetch = jest.fn().mockResolvedValue({ json: mockJson });

      const res = await readContract({
         abi: [{ name: "balanceOf" }] as any,
         functionName: "balanceOf",
         args: ["0xabc"],
         address: "0x123",
      });

      expect(global.fetch).toHaveBeenCalledWith(
         "https://testnet.mirrornode.hedera.com/api/v1/contracts/call",
         expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({ "Content-Type": "application/json" }),
         }),
      );

      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body).toEqual(
         expect.objectContaining({
            block: "latest",
            estimate: false,
            from: expect.any(String),
            gas: expect.any(Number),
            gasPrice: expect.any(Number),
            to: "0x123",
            value: 0,
         }),
      );
      expect(body.data).toMatch(/^encoded:balanceOf:\[/);

      // Returned value is whatever our mock decoder returns
      expect(res).toEqual(["decoded:balanceOf:0xdeadbeef"] as any);
   });

   it("throws when request fails", async () => {
      console.error = jest.fn();
      // @ts-ignore
      global.fetch = jest.fn().mockRejectedValue(new Error("network"));

      await expect(
         readContract({
            abi: [] as any,
            functionName: "foo",
            address: "0x0",
         }),
      ).rejects.toThrow("network");

      expect(console.error).toHaveBeenCalledWith("Error loading data from contract call");
   });
});
