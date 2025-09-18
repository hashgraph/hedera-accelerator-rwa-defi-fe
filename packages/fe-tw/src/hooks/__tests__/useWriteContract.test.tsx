import { renderHook } from "@testing-library/react";
import useWriteContract from "@/hooks/useWriteContract";

const wagmiWriteMock = jest.fn();
jest.mock("wagmi/actions", () => ({
   writeContract: (...args: any[]) => wagmiWriteMock(...args),
}));

describe("useWriteContract (wagmi proxy)", () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   it("returns writeContract function", () => {
      const { result } = renderHook(() => useWriteContract());
      expect(typeof result.current.writeContract).toBe("function");
   });

   it("calls wagmi writeContract with config and params", async () => {
      const { result } = renderHook(() => useWriteContract());

      const params = {
         address: "0x0000000000000000000000000000000000000000" as const,
         abi: [],
         functionName: "foo",
         args: [1, 2, 3],
      } as any;

      wagmiWriteMock.mockResolvedValue("0xdeadbeef");
      const res = await result.current.writeContract(params);

      expect(wagmiWriteMock).toHaveBeenCalled();
      const [passedConfig, passedParams] = wagmiWriteMock.mock.calls[0];
      expect(passedConfig).toBeDefined();
      expect(passedParams).toMatchObject(params);
      expect(res).toBe("0xdeadbeef");
   });
});
