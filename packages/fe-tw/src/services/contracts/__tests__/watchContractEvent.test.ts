import { watchContractEvent } from "@/services/contracts/watchContractEvent";

// Mock ethers Interface with parseLog
jest.mock("ethers", () => {
   class Interface {
      constructor(abi: any) {}
      // Parse log returns objects with name and args
      parseLog(item: { topics: readonly string[]; data: string }) {
         // Simple heuristic: last topic as event name, data as args JSON when provided
         const name = (item.topics?.[0] || "").replace("0x", "");
         try {
            const parsed = JSON.parse(item.data || "null");
            return { name, args: parsed } as any;
         } catch {
            return { name, args: item.data } as any;
         }
      }
   }
   return { ethers: { Interface } };
});

describe("watchContractEvent", () => {
   const flush = async () => {
      // Flush a few microtasks to allow fetch/json awaits to resolve
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
   };
   beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(global, "setTimeout");
   });

   afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      jest.restoreAllMocks();
   });

   it("polls mirror node, decodes logs and calls onLogs for matching event", async () => {
      const responses = [
         {
            logs: [
               { timestamp: "100", topics: ["0xMyEvent"], data: JSON.stringify([1, 2]) },
               { timestamp: "101", topics: ["0xOther"], data: JSON.stringify([3]) },
            ],
         },
         { logs: [] },
      ];

      // Ensure global.fetch exists and is a jest mock
      // @ts-ignore
      global.fetch = jest
         .fn()
         .mockResolvedValueOnce({ json: async () => responses[0] } as any)
         .mockResolvedValueOnce({ json: async () => responses[1] } as any);

      const onLogs = jest.fn();

      const unwatch = watchContractEvent({
         abi: [] as any,
         address: "0xabc",
         eventName: "MyEvent" as any,
         onLogs,
      });

      // Allow async fetch/json inside poll to resolve
      await flush();

      // onLogs should be called once with only matching event "MyEvent"
      expect(onLogs).toHaveBeenCalledTimes(1);
      const passed = onLogs.mock.calls[0][0];
      expect(Array.isArray(passed)).toBe(true);
      expect(passed[0]).toEqual(expect.objectContaining({ name: "MyEvent" }));

      // Ensure subsequent poll schedules a longer timeout when no logs
      jest.runOnlyPendingTimers();

      // Stop watching
      unwatch();

      // No further fetches after unwatch
      const callCount = (global.fetch as jest.Mock).mock.calls.length;
      jest.advanceTimersByTime(6000);
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(callCount);
   });

   it("ignores when no logs returned", async () => {
      // Ensure global.fetch exists and is a jest mock
      // @ts-ignore
      global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ logs: [] }) } as any);
      const onLogs = jest.fn();
      const unwatch = watchContractEvent({
         abi: [] as any,
         address: "0xabc",
         eventName: undefined as any,
         onLogs,
      });
      await flush();
      jest.runOnlyPendingTimers();
      expect(onLogs).not.toHaveBeenCalled();
      unwatch();
   });
});
