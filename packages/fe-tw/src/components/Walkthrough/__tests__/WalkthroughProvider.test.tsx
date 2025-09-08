import { render, screen } from "@testing-library/react";
import { WalkthroughProvider } from "../WalkthroughProvider";

// Mock the dependencies
jest.mock("next/navigation", () => ({
   usePathname: jest.fn()
}));

jest.mock("../WalkthroughStore", () => ({
   useWalkthroughStore: jest.fn()
}));

jest.mock("../WalktroughSyncBarrier", () => ({
   walkthroughBarrier: {
      onBarrierComplete: jest.fn(),
      reset: jest.fn()
   }
}));

import { usePathname } from "next/navigation";
import { useWalkthroughStore } from "../WalkthroughStore";
import { walkthroughBarrier } from "../WalktroughSyncBarrier";

const mockedUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockedUseWalkthroughStore = useWalkthroughStore as jest.MockedFunction<typeof useWalkthroughStore>;
const mockedWalkthroughBarrier = walkthroughBarrier as jest.Mocked<typeof walkthroughBarrier>;

describe("WalkthroughProvider", () => {
   const initializeWalkthroughMock = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      mockedUsePathname.mockReturnValue("/test-path");
      mockedUseWalkthroughStore.mockReturnValue(initializeWalkthroughMock);
   });

   it("should render children correctly", () => {
      render(
         <WalkthroughProvider>
            <div data-testid="test-child">Test Content</div>
         </WalkthroughProvider>
      );

      expect(screen.getByTestId("test-child")).toBeInTheDocument();
      expect(screen.getByText("Test Content")).toBeInTheDocument();
   });

   it("should call walkthroughBarrier.onBarrierComplete with initializeWalkthrough callback", () => {
      render(
         <WalkthroughProvider>
            <div>Test Content</div>
         </WalkthroughProvider>
      );

      expect(mockedWalkthroughBarrier.onBarrierComplete).toHaveBeenCalledWith(
         expect.any(Function)
      );

      // Simulate barrier completion
      const onBarrierCompleteCallback = mockedWalkthroughBarrier.onBarrierComplete.mock.calls[0][0];
      onBarrierCompleteCallback();

      expect(initializeWalkthroughMock).toHaveBeenCalled();
   });

   it("should call walkthroughBarrier.reset on cleanup", () => {
      const { unmount } = render(
         <WalkthroughProvider>
            <div>Test Content</div>
         </WalkthroughProvider>
      );

      unmount();

      expect(mockedWalkthroughBarrier.reset).toHaveBeenCalled();
   });

   it("should re-setup effect when pathname changes", () => {
      const { rerender } = render(
         <WalkthroughProvider>
            <div>Test Content</div>
         </WalkthroughProvider>
      );

      // Clear previous calls
      jest.clearAllMocks();

      // Change pathname
      mockedUsePathname.mockReturnValue("/new-path");
      
      rerender(
         <WalkthroughProvider>
            <div>Test Content</div>
         </WalkthroughProvider>
      );

      // Should setup barrier again with new pathname
      expect(mockedWalkthroughBarrier.onBarrierComplete).toHaveBeenCalledWith(
         expect.any(Function)
      );
   });

   it("should handle multiple children", () => {
      render(
         <WalkthroughProvider>
            <div data-testid="child-1">Child 1</div>
            <div data-testid="child-2">Child 2</div>
            <span data-testid="child-3">Child 3</span>
         </WalkthroughProvider>
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
      expect(screen.getByTestId("child-3")).toBeInTheDocument();
   });

   it("should work with no children", () => {
      render(<WalkthroughProvider>{null}</WalkthroughProvider>);

      // Should not throw and should still setup the barrier
      expect(mockedWalkthroughBarrier.onBarrierComplete).toHaveBeenCalled();
   });
});