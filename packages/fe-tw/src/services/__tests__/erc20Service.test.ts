jest.mock("@/services/contracts/readContract", () => ({
   readContract: jest.fn(),
}));

jest.mock("sonner", () => ({
   toast: { error: jest.fn() },
}));

import {
   getTokenDecimals,
   getTokenBalanceOf,
   getTokenName,
   getTokenSymbol,
   addTokenToMM,
} from "@/services/erc20Service";
import { readContract } from "@/services/contracts/readContract";
import { toast } from "sonner";

describe("erc20Service", () => {
   const mockRead = readContract as jest.Mock;

   beforeEach(() => {
      jest.clearAllMocks();
   });

   it("getTokenDecimals calls readContract with decimals", async () => {
      mockRead.mockResolvedValueOnce([BigInt(18)]);
      const res = await getTokenDecimals("0x123" as `0x${string}`);
      expect(mockRead).toHaveBeenCalledWith(expect.objectContaining({ functionName: "decimals" }));
      expect(res).toEqual([BigInt(18)]);
   });

   it("getTokenBalanceOf calls readContract with balanceOf and user address", async () => {
      mockRead.mockResolvedValueOnce([BigInt(1000)]);
      const res = await getTokenBalanceOf("0x123" as `0x${string}`, "0xUser");
      expect(mockRead).toHaveBeenCalledWith(
         expect.objectContaining({ functionName: "balanceOf", args: ["0xUser"] }),
      );
      expect(res).toEqual([BigInt(1000)]);
   });

   it("getTokenName calls readContract with name", () => {
      mockRead.mockResolvedValueOnce(["TokenName"]);
      getTokenName("0x123" as `0x${string}`);
      expect(mockRead).toHaveBeenCalledWith(expect.objectContaining({ functionName: "name" }));
   });

   it("getTokenSymbol calls readContract with symbol", async () => {
      mockRead.mockResolvedValueOnce(["TOK"]);
      const res = await getTokenSymbol("0x123" as `0x${string}`);
      expect(mockRead).toHaveBeenCalledWith(expect.objectContaining({ functionName: "symbol" }));
      expect(res).toEqual(["TOK"]);
   });

   describe("addTokenToMM", () => {
      it("shows error toast when no window.ethereum", async () => {
         (toast.error as jest.Mock).mockClear();
         // Remove ethereum if exists
         if ((global as any).window) {
            delete (global as any).window.ethereum;
         }
         await addTokenToMM({
            tokenAddress: "0x123" as `0x${string}`,
            tokenDecimals: "18",
            tokenSymbol: "TOK",
            tokenType: "ERC20",
         });
         expect(toast.error).toHaveBeenCalledWith("Metamask needs to be connected");
      });

      it("requests wallet_watchAsset when ethereum present", async () => {
         const request = jest.fn().mockResolvedValue(true);
         (global as any).window.ethereum = { request };
         (toast.error as jest.Mock).mockClear();
         await addTokenToMM({
            tokenAddress: "0x123" as `0x${string}`,
            tokenDecimals: "18",
            tokenSymbol: "TOK",
            tokenType: "ERC20",
            tokenAvatar: "img",
         });
         expect(request).toHaveBeenCalledWith(
            expect.objectContaining({ method: "wallet_watchAsset" }),
         );
         expect(toast.error).not.toHaveBeenCalled();
      });

      it("catches error and shows toast", async () => {
         const request = jest.fn().mockRejectedValue(new Error("fail"));
         (global as any).window.ethereum = { request };
         (toast.error as jest.Mock).mockClear();
         await addTokenToMM({
            tokenAddress: "0x123" as `0x${string}`,
            tokenDecimals: "18",
            tokenSymbol: "TOK",
            tokenType: "ERC20",
         });
         expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Not possible"));
      });
   });
});
