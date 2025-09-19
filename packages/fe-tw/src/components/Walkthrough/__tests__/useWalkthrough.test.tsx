import { renderHook, act } from "@testing-library/react";
import { useWalkthrough } from "../useWalkthrough";

// Mock the dependencies
jest.mock("../WalkthroughStore", () => ({
   useWalkthroughStore: jest.fn(),
}));

jest.mock("../WalktroughSyncBarrier", () => ({
   walkthroughBarrier: {
      register: jest.fn(),
      unregister: jest.fn(),
   },
}));

import { useWalkthroughStore } from "../WalkthroughStore";
import { walkthroughBarrier } from "../WalktroughSyncBarrier";

const mockedUseWalkthroughStore = useWalkthroughStore as jest.MockedFunction<
   typeof useWalkthroughStore
>;
const mockedWalkthroughBarrier = walkthroughBarrier as jest.Mocked<typeof walkthroughBarrier>;

describe("useWalkthrough", () => {
   const mockStoreState = {
      currentGuide: "test-guide",
      currentStep: 1,
      setCurrentGuide: jest.fn(),
      finishGuide: jest.fn(),
      setCurrentStep: jest.fn(),
      setHideAllGuides: jest.fn(),
      registerGuides: jest.fn(),
      unregisterGuides: jest.fn(),
   };

   beforeEach(() => {
      jest.clearAllMocks();

      // Mock useWalkthroughStore to return different values based on selector
      mockedUseWalkthroughStore.mockImplementation((selector: any) => {
         if (typeof selector === "function") {
            return selector(mockStoreState);
         }
         return mockStoreState;
      });

      mockedWalkthroughBarrier.register.mockReturnValue(jest.fn());
   });

   it("should return correct state when no guides provided", () => {
      const { result } = renderHook(() => useWalkthrough());

      expect(result.current.currentGuide).toBe("test-guide");
      expect(result.current.currentStep).toBe(1);
      expect(typeof result.current.confirmUserPassedStep).toBe("function");
      expect(typeof result.current.confirmUserFinishedGuide).toBe("function");
      expect(typeof result.current.registerComponent).toBe("function");
   });

   it("should register guides when guides are provided", () => {
      const guides = [
         { guideId: "guide1", priority: 1 },
         { guideId: "guide2", priority: 2 },
      ];

      const { result } = renderHook(() => useWalkthrough(guides));

      expect(mockStoreState.registerGuides).toHaveBeenCalledWith(guides);
      expect(mockedWalkthroughBarrier.register).toHaveBeenCalled();
   });

   it("should unregister guides on cleanup", () => {
      const guides = [
         { guideId: "guide1", priority: 1 },
         { guideId: "guide2", priority: 2 },
      ];

      const { unmount } = renderHook(() => useWalkthrough(guides));

      unmount();

      expect(mockStoreState.unregisterGuides).toHaveBeenCalledWith(guides);
      expect(mockedWalkthroughBarrier.unregister).toHaveBeenCalled();
   });

   it("should not register/unregister when guides is undefined", () => {
      const { unmount } = renderHook(() => useWalkthrough());

      unmount();

      expect(mockStoreState.registerGuides).not.toHaveBeenCalled();
      expect(mockStoreState.unregisterGuides).not.toHaveBeenCalled();
   });

   it("should handle confirmUserPassedStep correctly", () => {
      const { result } = renderHook(() => useWalkthrough([{ guideId: "test-guide", priority: 1 }]));

      expect(result.current.currentGuide).toBe("test-guide");
      expect(result.current.currentStep).toBe(1);

      act(() => {
         result.current.confirmUserPassedStep(1, "test-guide");
      });

      expect(mockStoreState.setCurrentStep).toHaveBeenCalledWith(2);
   });

   it("should handle confirmUserFinishedGuide correctly when currentGuide matches", () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
         result.current.confirmUserFinishedGuide("test-guide");
      });

      expect(mockStoreState.finishGuide).toHaveBeenCalledWith("test-guide");
      expect(mockStoreState.setCurrentGuide).toHaveBeenCalledWith(null);
      expect(mockStoreState.setCurrentStep).toHaveBeenCalledWith(null);
   });

   it("should not finish guide when currentGuide does not match", () => {
      const { result } = renderHook(() => useWalkthrough());

      act(() => {
         result.current.confirmUserFinishedGuide("different-guide");
      });

      expect(mockStoreState.finishGuide).not.toHaveBeenCalled();
      expect(mockStoreState.setCurrentGuide).not.toHaveBeenCalled();
      expect(mockStoreState.setCurrentStep).not.toHaveBeenCalled();
   });

   it("should return PromptCardProps with correct values", () => {
      const guides = [{ guideId: "guide1", priority: 1 }];
      const { result } = renderHook(() => useWalkthrough(guides));

      expect(result.current.PromptCardProps).toEqual({
         guides,
         currentGuide: "test-guide",
         currentStep: 1,
         setCurrentStep: mockStoreState.setCurrentStep,
         confirmUserFinishedGuide: expect.any(Function),
         setHideAllGuides: mockStoreState.setHideAllGuides,
      });
   });

   it("should call ready callback when registerComponent is invoked", () => {
      const readyCallbackMock = jest.fn();
      mockedWalkthroughBarrier.register.mockReturnValue(readyCallbackMock);

      const guides = [{ guideId: "guide1", priority: 1 }];
      const { result } = renderHook(() => useWalkthrough(guides));

      // Simulate calling registerComponent
      act(() => {
         result.current.registerComponent();
      });

      expect(readyCallbackMock).toHaveBeenCalled();
   });

   it("should handle empty guides array", () => {
      const { result } = renderHook(() => useWalkthrough([]));

      // Empty array should not trigger registration due to isEmpty check
      expect(mockStoreState.registerGuides).not.toHaveBeenCalled();
      expect(result.current.PromptCardProps.guides).toEqual([]);
   });

   it("should re-register guides when guides prop changes", () => {
      const initialGuides = [{ guideId: "guide1", priority: 1 }];
      const updatedGuides = [{ guideId: "guide2", priority: 2 }];

      const { rerender } = renderHook(({ guides }) => useWalkthrough(guides), {
         initialProps: { guides: initialGuides },
      });

      expect(mockStoreState.registerGuides).toHaveBeenCalledWith(initialGuides);

      // Clear mocks to check new calls
      jest.clearAllMocks();

      rerender({ guides: updatedGuides });

      expect(mockStoreState.unregisterGuides).toHaveBeenCalledWith(initialGuides);
      expect(mockStoreState.registerGuides).toHaveBeenCalledWith(updatedGuides);
   });
});
