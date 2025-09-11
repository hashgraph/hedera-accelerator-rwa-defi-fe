import { renderHook, act } from "@testing-library/react";
import { useFilter } from "@/hooks/useFilter";

// Mock the nuqs library
const mockSetQueryStates = jest.fn();
jest.mock("nuqs", () => ({
   parseAsString: jest.fn(),
   useQueryStates: jest.fn(() => [
      {},
      mockSetQueryStates,
   ]),
}));

import { useQueryStates } from "nuqs";

describe("useFilter", () => {
   const mockUseQueryStates = useQueryStates as jest.MockedFunction<typeof useQueryStates>;

   beforeEach(() => {
      jest.clearAllMocks();
      mockSetQueryStates.mockClear();
   });

   const sampleItems = [
      { id: 1, name: "Apple", category: "fruit", price: 1.2 },
      { id: 2, name: "Banana", category: "fruit", price: 0.8 },
      { id: 3, name: "Carrot", category: "vegetable", price: 1.5 },
      { id: 4, name: "Broccoli", category: "vegetable", price: 2.0 },
   ];

   const filterOptions = {
      category: null,
      minPrice: null,
   };

   it("returns all items when no filters are applied", () => {
      mockUseQueryStates.mockReturnValue([{}, mockSetQueryStates]);

      const { result } = renderHook(() => useFilter(sampleItems, filterOptions));

      expect(result.current.filteredItems).toEqual(sampleItems);
      expect(result.current.filterState).toEqual({});
   });

   it("filters items when configuration path is provided", () => {
      const nestedItems = [
         { id: 1, details: { category: "fruit", price: 1.2 } },
         { id: 2, details: { category: "vegetable", price: 1.5 } },
      ];

      const filterState = { category: "fruit" };
      mockUseQueryStates.mockReturnValue([filterState, mockSetQueryStates]);

      const { result } = renderHook(() => 
         useFilter(nestedItems, filterOptions, { filterPropertiesPath: "details" })
      );

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].details.category).toBe("fruit");
   });

   it("returns empty array when no items match filters with nested path", () => {
      const nestedItems = [
         { id: 1, details: { category: "fruit", price: 1.2 } },
         { id: 2, details: { category: "vegetable", price: 1.5 } },
      ];

      const filterState = { category: "dairy" };
      mockUseQueryStates.mockReturnValue([filterState, mockSetQueryStates]);

      const { result } = renderHook(() => 
         useFilter(nestedItems, filterOptions, { filterPropertiesPath: "details" })
      );

      expect(result.current.filteredItems).toHaveLength(0);
   });

   it("ignores null/undefined filter values", () => {
      const nestedItems = [
         { id: 1, details: { category: "fruit", price: 1.2 } },
         { id: 2, details: { category: "vegetable", price: 1.5 } },
      ];

      const filterState = { category: "fruit", minPrice: null, maxPrice: undefined };
      mockUseQueryStates.mockReturnValue([filterState, mockSetQueryStates]);

      const { result } = renderHook(() => 
         useFilter(nestedItems, filterOptions, { filterPropertiesPath: "details" })
      );

      // Should only filter by category, ignoring null/undefined values
      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].details.category).toBe("fruit");
   });

   it("updates filter state when handleFilterChange is called", () => {
      const initialState = {};
      mockUseQueryStates.mockReturnValue([initialState, mockSetQueryStates]);

      const { result } = renderHook(() => useFilter(sampleItems, filterOptions));

      act(() => {
         result.current.handleFilterChange("category", "vegetable");
      });

      expect(mockSetQueryStates).toHaveBeenCalledWith(expect.any(Function));
      
      // Test the updater function
      const updaterFunction = mockSetQueryStates.mock.calls[0][0];
      const newState = updaterFunction(initialState);
      expect(newState).toEqual({ category: "vegetable" });
   });

   it("filters with multiple criteria when path is specified", () => {
      const nestedItems = [
         { id: 1, details: { category: "fruit", price: 1.2 } },
         { id: 2, details: { category: "fruit", price: 0.8 } },
         { id: 3, details: { category: "vegetable", price: 1.5 } },
      ];

      const filterState = { category: "fruit", price: 1.2 };
      mockUseQueryStates.mockReturnValue([filterState, mockSetQueryStates]);

      const { result } = renderHook(() => 
         useFilter(nestedItems, filterOptions, { filterPropertiesPath: "details" })
      );

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].details.category).toBe("fruit");
      expect(result.current.filteredItems[0].details.price).toBe(1.2);
   });

   it("handles empty items array", () => {
      mockUseQueryStates.mockReturnValue([{}, mockSetQueryStates]);

      const { result } = renderHook(() => useFilter([], filterOptions));

      expect(result.current.filteredItems).toEqual([]);
   });

   it("updates filter state correctly with different value types", () => {
      const initialState = { category: "fruit" };
      mockUseQueryStates.mockReturnValue([initialState, mockSetQueryStates]);

      const { result } = renderHook(() => useFilter(sampleItems, filterOptions));

      // Test with string value
      act(() => {
         result.current.handleFilterChange("category", "vegetable");
      });

      // Test with number value
      act(() => {
         result.current.handleFilterChange("minPrice", 1.0);
      });

      // Test with boolean value
      act(() => {
         result.current.handleFilterChange("inStock", true);
      });

      expect(mockSetQueryStates).toHaveBeenCalledTimes(3);
   });
});