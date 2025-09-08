import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock window.matchMedia since it's already set up in jest.setup.ts
const mockMatchMedia = window.matchMedia as jest.MockedFunction<typeof window.matchMedia>;

describe("useIsMobile", () => {
   let mockMQL: {
      matches: boolean;
      addEventListener: jest.Mock;
      removeEventListener: jest.Mock;
   };

   beforeEach(() => {
      jest.clearAllMocks();
      mockMQL = {
         matches: false,
         addEventListener: jest.fn(),
         removeEventListener: jest.fn(),
      };
      mockMatchMedia.mockReturnValue(mockMQL as any);
      
      // Mock window.innerWidth
      Object.defineProperty(window, "innerWidth", {
         writable: true,
         configurable: true,
         value: 1024,
      });
   });

   it("returns false for desktop screen sizes", () => {
      Object.defineProperty(window, "innerWidth", {
         writable: true,
         configurable: true,
         value: 1024,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
   });

   it("returns true for mobile screen sizes", () => {
      Object.defineProperty(window, "innerWidth", {
         writable: true,
         configurable: true,
         value: 500,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
   });

   it("returns true exactly at the mobile breakpoint boundary", () => {
      Object.defineProperty(window, "innerWidth", {
         writable: true,
         configurable: true,
         value: 767, // Just below 768px breakpoint
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
   });

   it("returns false just above the mobile breakpoint", () => {
      Object.defineProperty(window, "innerWidth", {
         writable: true,
         configurable: true,
         value: 768, // At the breakpoint
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
   });

   it("sets up media query listener with correct query", () => {
      renderHook(() => useIsMobile());
      expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
      expect(mockMQL.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
   });

   it("responds to media query changes", () => {
      const { result } = renderHook(() => useIsMobile());
      
      // Initially not mobile
      expect(result.current).toBe(false);

      // Simulate media query change to mobile
      Object.defineProperty(window, "innerWidth", {
         writable: true,
         configurable: true,
         value: 500,
      });

      // Get the change handler and call it
      const changeHandler = mockMQL.addEventListener.mock.calls[0][1];
      act(() => {
         changeHandler();
      });

      expect(result.current).toBe(true);
   });

   it("cleans up event listener on unmount", () => {
      const { unmount } = renderHook(() => useIsMobile());
      
      unmount();
      
      expect(mockMQL.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
   });
});