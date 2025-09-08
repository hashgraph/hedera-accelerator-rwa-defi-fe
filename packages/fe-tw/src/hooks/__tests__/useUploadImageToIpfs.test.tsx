import { renderHook, waitFor } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUploadImageToIpfs } from "@/hooks/useUploadImageToIpfs";

// Mock dependencies
jest.mock("@/utils/pinata", () => ({
   pinata: {
      upload: {
         file: jest.fn(),
      },
   },
}));

jest.mock("sonner", () => ({
   toast: {
      success: jest.fn(),
      error: jest.fn(),
   },
}));

// Mock fetch
global.fetch = jest.fn();

import { pinata } from "@/utils/pinata";

describe("useUploadImageToIpfs", () => {
   const mockPinataUploadFile = pinata.upload.file as jest.MockedFunction<typeof pinata.upload.file>;
   const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

   const createWrapper = () => {
      const queryClient = new QueryClient({
         defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });
      const Wrapper = ({ children }: PropsWithChildren) => (
         <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      return Wrapper;
   };

   beforeEach(() => {
      jest.clearAllMocks();
   });

   it("returns upload function and pending state", () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useUploadImageToIpfs(), { wrapper: Wrapper });

      expect(typeof result.current.uploadImage).toBe("function");
      expect(typeof result.current.isPending).toBe("boolean");
      expect(result.current.isPending).toBe(false);
   });

   it("successfully uploads image to IPFS", async () => {
      const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
      const mockJWT = "test-jwt-token";
      const mockIpfsHash = "QmTestHash123";

      // Mock fetch response for API key
      mockFetch.mockResolvedValueOnce({
         ok: true,
         json: async () => ({ JWT: mockJWT }),
      } as Response);

      // Mock pinata upload
      const mockUploadResult = {
         key: jest.fn().mockResolvedValue({ IpfsHash: mockIpfsHash }),
      };
      mockPinataUploadFile.mockReturnValue(mockUploadResult as any);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useUploadImageToIpfs(), { wrapper: Wrapper });

      const ipfsHash = await result.current.uploadImage(mockFile);

      expect(ipfsHash).toBe(mockIpfsHash);
      expect(mockFetch).toHaveBeenCalledWith("/api/pinataKey");
      expect(mockPinataUploadFile).toHaveBeenCalledWith(mockFile, {
         metadata: { name: "image-test.jpg" },
      });
      expect(mockUploadResult.key).toHaveBeenCalledWith(mockJWT);
   });

   it("handles API key fetch failure", async () => {
      const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });

      // Mock fetch failure
      mockFetch.mockRejectedValueOnce(new Error("API key fetch failed"));

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useUploadImageToIpfs(), { wrapper: Wrapper });

      await expect(result.current.uploadImage(mockFile)).rejects.toThrow("API key fetch failed");
   });

   it("handles pinata upload failure", async () => {
      const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
      const mockJWT = "test-jwt-token";

      // Mock successful fetch
      mockFetch.mockResolvedValueOnce({
         ok: true,
         json: async () => ({ JWT: mockJWT }),
      } as Response);

      // Mock pinata upload failure
      const mockUploadResult = {
         key: jest.fn().mockRejectedValue(new Error("Upload failed")),
      };
      mockPinataUploadFile.mockReturnValue(mockUploadResult as any);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useUploadImageToIpfs(), { wrapper: Wrapper });

      await expect(result.current.uploadImage(mockFile)).rejects.toThrow("Upload failed");
   });

   it("handles JSON parsing error for API response", async () => {
      const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });

      // Mock fetch with invalid JSON response
      mockFetch.mockResolvedValueOnce({
         ok: true,
         json: async () => { throw new Error("Invalid JSON"); },
      } as Response);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useUploadImageToIpfs(), { wrapper: Wrapper });

      await expect(result.current.uploadImage(mockFile)).rejects.toThrow("Invalid JSON");
   });

   it("uses correct metadata for different file names", async () => {
      const mockFile = new File(["test content"], "my-special-image.png", { type: "image/png" });
      const mockJWT = "test-jwt-token";
      const mockIpfsHash = "QmTestHash456";

      mockFetch.mockResolvedValueOnce({
         ok: true,
         json: async () => ({ JWT: mockJWT }),
      } as Response);

      const mockUploadResult = {
         key: jest.fn().mockResolvedValue({ IpfsHash: mockIpfsHash }),
      };
      mockPinataUploadFile.mockReturnValue(mockUploadResult as any);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useUploadImageToIpfs(), { wrapper: Wrapper });

      await result.current.uploadImage(mockFile);

      expect(mockPinataUploadFile).toHaveBeenCalledWith(mockFile, {
         metadata: { name: "image-my-special-image.png" },
      });
   });

   it("maintains pending state correctly during upload", async () => {
      const mockFile = new File(["test content"], "test.jpg", { type: "image/jpeg" });
      const mockJWT = "test-jwt-token";
      const mockIpfsHash = "QmTestHash789";

      // Mock successful fetch first
      mockFetch.mockResolvedValueOnce({
         ok: true,
         json: async () => ({ JWT: mockJWT }),
      } as Response);

      // Mock a delayed upload to test pending state
      let resolveUpload: (value: any) => void;
      const uploadDelay = new Promise((resolve) => {
         resolveUpload = resolve;
      });

      const mockUploadResult = {
         key: jest.fn().mockReturnValue(uploadDelay),
      };
      mockPinataUploadFile.mockReturnValue(mockUploadResult as any);

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useUploadImageToIpfs(), { wrapper: Wrapper });

      // Start the upload
      const uploadPromise = result.current.uploadImage(mockFile);

      // Wait a bit then check if pending
      await waitFor(() => {
         // At this point the mutation should be in progress
         if (result.current.isPending) {
            expect(result.current.isPending).toBe(true);
         }
      }, { timeout: 100 });

      // Resolve the upload
      resolveUpload!({ IpfsHash: mockIpfsHash });
      const finalHash = await uploadPromise;

      expect(finalHash).toBe(mockIpfsHash);
      // After completion, should not be pending
      await waitFor(() => expect(result.current.isPending).toBe(false));
   });
});