import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Mock localStorage
const localStorageMock = {
   getItem: jest.fn(),
   setItem: jest.fn(),
   removeItem: jest.fn(),
   clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
   value: localStorageMock,
});

// Mock console.error to test error handling
const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

describe("useLocalStorage", () => {
   beforeEach(() => {
      jest.clearAllMocks();
      mockConsoleError.mockClear();
   });

   afterAll(() => {
      mockConsoleError.mockRestore();
   });

   it("returns initial value when localStorage is empty", () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useLocalStorage("testKey", "initialValue"));
      
      expect(result.current[0]).toBe("initialValue");
      expect(localStorageMock.getItem).toHaveBeenCalledWith("testKey");
   });

   it("returns stored value from localStorage", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify("storedValue"));
      
      const { result } = renderHook(() => useLocalStorage("testKey", "initialValue"));
      
      expect(result.current[0]).toBe("storedValue");
   });

   it("handles complex objects", () => {
      const complexObject = { name: "test", count: 42, items: ["a", "b"] };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(complexObject));
      
      const { result } = renderHook(() => useLocalStorage("testKey", {}));
      
      expect(result.current[0]).toEqual(complexObject);
   });

   it("returns initial value when JSON parsing fails", () => {
      localStorageMock.getItem.mockReturnValue("invalid-json");
      
      const { result } = renderHook(() => useLocalStorage("testKey", "fallback"));
      
      expect(result.current[0]).toBe("fallback");
   });

   it("updates localStorage when setValue is called with direct value", () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const { result } = renderHook(() => useLocalStorage("testKey", "initial"));
      
      act(() => {
         result.current[1]("newValue");
      });
      
      expect(result.current[0]).toBe("newValue");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("testKey", JSON.stringify("newValue"));
   });

   it("updates localStorage when setValue is called with function", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify("initial"));
      
      const { result } = renderHook(() => useLocalStorage("testKey", ""));
      
      act(() => {
         result.current[1]((prev) => prev + "_updated");
      });
      
      expect(result.current[0]).toBe("initial_updated");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("testKey", JSON.stringify("initial_updated"));
   });

   it("handles setValue errors gracefully", () => {
      localStorageMock.getItem.mockReturnValue(null);
      localStorageMock.setItem.mockImplementation(() => {
         throw new Error("Storage quota exceeded");
      });
      
      const { result } = renderHook(() => useLocalStorage("testKey", "initial"));
      
      act(() => {
         result.current[1]("newValue");
      });
      
      // Value should still be updated in state even if localStorage fails
      expect(result.current[0]).toBe("newValue");
      expect(mockConsoleError).toHaveBeenCalledWith("Error saving to localStorage:", expect.any(Error));
   });

   it("works with number values", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(42));
      
      const { result } = renderHook(() => useLocalStorage("numberKey", 0));
      
      expect(result.current[0]).toBe(42);
      
      act(() => {
         result.current[1](100);
      });
      
      expect(result.current[0]).toBe(100);
      expect(localStorageMock.setItem).toHaveBeenCalledWith("numberKey", JSON.stringify(100));
   });

   it("works with boolean values", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(true));
      
      const { result } = renderHook(() => useLocalStorage("boolKey", false));
      
      expect(result.current[0]).toBe(true);
      
      act(() => {
         result.current[1](false);
      });
      
      expect(result.current[0]).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith("boolKey", JSON.stringify(false));
   });
});