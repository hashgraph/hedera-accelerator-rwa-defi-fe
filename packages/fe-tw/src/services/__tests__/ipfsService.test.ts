import { fetchJsonFromIpfs } from "@/services/ipfsService";

describe("ipfsService", () => {
   const originalFetch = global.fetch;

   afterEach(() => {
      global.fetch = originalFetch as any;
   });

   it("strips ipfs:// prefix and fetches JSON", async () => {
      const mockJson = { a: 1 };
      global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => mockJson });
      const res = await fetchJsonFromIpfs("ipfs://abc123");
      expect(global.fetch).toHaveBeenCalledWith("https://ipfs.io/ipfs/abc123");
      expect(res).toEqual(mockJson);
   });

   it("throws on non-ok response", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
      await expect(fetchJsonFromIpfs("bad")).rejects.toThrow("Failed to fetch IPFS data: 500");
   });
});
