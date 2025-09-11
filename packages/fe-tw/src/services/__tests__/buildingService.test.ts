import {
   readBuildingsList,
   readBuildingDetails,
   fetchBuildingNFTsMetadata,
   convertBuildingNFTsData,
   getBuildingForToken,
   getBuildingValuation,
   getSlicesForBuilding,
   filterBuildingsByOnlyUniqueIpfsHash,
} from "@/services/buildingService";
import { readContract } from "@/services/contracts/readContract";
import { fetchJsonFromIpfs } from "@/services/ipfsService";
import { buildings } from "@/consts/buildings";
import { mockTokenToBuildingMap } from "@/consts/allocations";
import type { BuildingNFTData } from "@/types/erc3643/types";

jest.mock("@/services/contracts/readContract", () => ({
   readContract: jest.fn(),
}));

jest.mock("@/services/ipfsService", () => ({
   fetchJsonFromIpfs: jest.fn(),
}));

jest.mock("@/consts/buildings", () => ({
   buildings: [
      {
         id: 1234,
         title: "Test Building",
         purchasedAt: 1,
         description: "Desc",
         imageUrl: "https://ipfs.io/ipfs/imagehash1",
         voteItems: [],
         partOfSlices: ["0x1"],
         allocation: 10,
         info: {
            financial: {
               percentageOwned: 50,
               tokenPrice: 8,
               directExposure: 1600,
               yield: [
                  { percentage: 10, days: 50 },
                  { percentage: 30, days: 100 },
               ],
               treasury: 6000,
            },
            demographics: {
               constructedYear: "2000",
               type: "Hi-Rise",
               location: "Somewhere",
               locationType: "Urban",
            },
         },
      },
      {
         id: 5678,
         title: "Another Building",
         purchasedAt: 2,
         description: "Desc2",
         imageUrl: "https://ipfs.io/ipfs/imagehash2",
         voteItems: [],
         partOfSlices: ["0x2", "0x3"],
         allocation: 20,
         info: {
            financial: {
               percentageOwned: 50,
               tokenPrice: 8,
               directExposure: 1600,
               yield: [
                  { percentage: 10, days: 50 },
                  { percentage: 30, days: 100 },
               ],
               treasury: 6000,
            },
            demographics: {
               constructedYear: "2001",
               type: "Hi-Rise",
               location: "Elsewhere",
               locationType: "Urban",
            },
         },
      },
   ],
}));

jest.mock("@/consts/allocations", () => ({
   mockTokenToBuildingMap: {
      "0xTokenA": { buildingId: 1234 },
      "0xTokenB": { buildingId: 5678 },
   },
}));

const mockReadContract = readContract as jest.Mock;
const mockFetchJsonFromIpfs = fetchJsonFromIpfs as jest.Mock;

describe("buildingService", () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   it("readBuildingsList calls readContract with factory getBuildingList", () => {
      readBuildingsList();
      expect(mockReadContract).toHaveBeenCalledWith(
         expect.objectContaining({ functionName: "getBuildingList" }),
      );
   });

   it("readBuildingDetails calls readContract with getBuildingDetails and address arg", () => {
      const addr = "0x123" as `0x${string}`;
      readBuildingDetails(addr);
      expect(mockReadContract).toHaveBeenCalledWith(
         expect.objectContaining({ functionName: "getBuildingDetails", args: [addr] }),
      );
   });

   describe("fetchBuildingNFTsMetadata", () => {
      it("filters out already present buildings and fetches metadata", async () => {
         const existing = (await import("@/consts/buildings")).buildings;
         const addresses: `0x${string}`[] = ["0xAAA", "0xBBB"];
         mockReadContract
            .mockResolvedValueOnce([["meta1", "x", "ipfs1"]])
            .mockResolvedValueOnce([["meta2", "y", "ipfs2"]]);
         mockFetchJsonFromIpfs
            .mockResolvedValueOnce({ address: "0xAAA" })
            .mockResolvedValueOnce({ address: "0xBBB" });

         const { buildingAddressesProxiesData, buildingNFTsData } = await fetchBuildingNFTsMetadata(
            addresses,
            existing as any,
         );

         expect(buildingAddressesProxiesData).toHaveLength(2);
         expect(mockFetchJsonFromIpfs).toHaveBeenCalledWith("ipfs1");
         expect(mockFetchJsonFromIpfs).toHaveBeenCalledWith("ipfs2");
         expect(buildingNFTsData).toHaveLength(2);
      });
   });

   describe("convertBuildingNFTsData", () => {
      it("converts NFT data including demographics when attributes exist", () => {
         const input: BuildingNFTData[] = [
            {
               description: "d",
               image: "ipfs://hash123",
               name: "Name",
               address: "0x123" as `0x${string}`,
               allocation: 10,
               purchasedAt: 123,
               attributes: [
                  { trait_type: "constructedYear", display_type: "", value: "1990" },
                  { trait_type: "type", display_type: "", value: "Hi-Rise" },
                  { trait_type: "locationType", display_type: "", value: "Urban" },
                  { trait_type: "size", display_type: "", value: "1000" },
                  { trait_type: "location", display_type: "", value: "X" },
                  { trait_type: "state", display_type: "", value: "IL" },
               ],
            },
         ];
         const converted = convertBuildingNFTsData(input);
         expect(converted[0].info.demographics.constructedYear).toBe("1990");
         expect(converted[0].imageUrl).toContain("https://ipfs.io/ipfs/hash123");
      });

      it("handles missing attributes", () => {
         const input: BuildingNFTData[] = [
            {
               description: "d",
               image: "ipfs://hash123",
               name: "Name2",
               address: "0x124" as `0x${string}`,
               allocation: 10,
               purchasedAt: 123,
               attributes: undefined as any,
            },
         ];
         const converted = convertBuildingNFTsData(input);
         expect(converted[0].info.demographics.constructedYear).toBe("");
      });
   });

   describe("getBuildingForToken", () => {
      it("returns mapping building", async () => {
         const data = await getBuildingForToken("0xTokenA");
         expect(data?.nftId).toBe(1234);
      });

      it("returns null when no mapping", async () => {
         expect(await getBuildingForToken("0xUnknown")).toBeNull();
      });
   });

   it("getBuildingValuation returns mock", async () => {
      expect(await getBuildingValuation(1)).toBe(10000);
   });

   describe("getSlicesForBuilding", () => {
      it("returns slices for existing building", async () => {
         const slices = await getSlicesForBuilding(5678);
         expect(slices).toEqual(["0x2", "0x3"]);
      });

      it("returns empty for unknown building", async () => {
         const slices = await getSlicesForBuilding(999999);
         expect(slices).toEqual([]);
      });
   });

   describe("filterBuildingsByOnlyUniqueIpfsHash", () => {
      it("returns array with unique images", () => {
         const data: BuildingNFTData[] = [
            {
               description: "1",
               image: "image1",
               name: "n1",
               address: "0x1" as any,
               allocation: 1,
               purchasedAt: 1,
               attributes: [],
            },
            {
               description: "2",
               image: "image1",
               name: "n2",
               address: "0x2" as any,
               allocation: 2,
               purchasedAt: 2,
               attributes: [],
            },
            {
               description: "3",
               image: "image2",
               name: "n3",
               address: "0x3" as any,
               allocation: 3,
               purchasedAt: 3,
               attributes: [],
            },
         ];
         const filtered = filterBuildingsByOnlyUniqueIpfsHash(data);
         expect(filtered).toHaveLength(2);
         expect(filtered.map((f) => f.image)).toEqual(["image1", "image2"]);
      });
   });
});
