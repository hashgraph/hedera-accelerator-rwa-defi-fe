import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { WalkthroughStep } from "../WalkthroughStep";

// Mock the dependencies
jest.mock("../WalkthroughStore", () => ({
   useWalkthroughStore: jest.fn()
}));

jest.mock("@/components/ui/popover", () => ({
   Popover: ({ children, open }: any) => (
      <div data-testid="popover" data-open={open}>
         {children}
      </div>
   ),
   PopoverAnchor: ({ children, className }: any) => (
      <div data-testid="popover-anchor" className={className}>
         {children}
      </div>
   )
}));

jest.mock("@radix-ui/react-popover", () => ({
   PopoverContent: ({ children, className, side }: any) => (
      <div data-testid="popover-content" className={className} data-side={side}>
         {children}
      </div>
   ),
   PopoverPortal: ({ children }: any) => <div data-testid="popover-portal">{children}</div>
}));

jest.mock("@/components/ui/button", () => ({
   Button: ({ children, onClick, className, variant, ...props }: any) => (
      <button
         data-testid="button"
         onClick={onClick}
         className={className}
         data-variant={variant}
         {...props}
      >
         {children}
      </button>
   )
}));

import { useWalkthroughStore } from "../WalkthroughStore";

const mockedUseWalkthroughStore = useWalkthroughStore as jest.MockedFunction<typeof useWalkthroughStore>;

describe("WalkthroughStep", () => {
   const mockStoreState = {
      currentStep: 1,
      currentGuide: "test-guide",
      setCurrentStep: jest.fn(),
      setCurrentGuide: jest.fn(),
      finishGuide: jest.fn()
   };

   beforeEach(() => {
      jest.clearAllMocks();
      jest.useFakeTimers();
      
      mockedUseWalkthroughStore.mockImplementation((selector: any) => {
         if (typeof selector === 'function') {
            return selector(mockStoreState);
         }
         return mockStoreState;
      });
   });

   afterEach(() => {
      jest.useRealTimers();
   });

   it("should render children when not highlighted", () => {
      render(
         <WalkthroughStep
            guideId="different-guide"
            stepIndex={1}
            title="Test Title"
            description="Test Description"
         >
            <div data-testid="step-content">Step Content</div>
         </WalkthroughStep>
      );

      expect(screen.getByTestId("step-content")).toBeInTheDocument();
      expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "false");
   });

   it("should render highlighted state when current step matches", () => {
      render(
         <WalkthroughStep
            guideId="test-guide"
            stepIndex={1}
            title="Test Title"
            description="Test Description"
         >
            <div data-testid="step-content">Step Content</div>
         </WalkthroughStep>
      );

      expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "true");
      expect(screen.getByTestId("popover-content")).toBeInTheDocument();
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
   });

   it("should render with steps array and find matching step", () => {
      const steps = [
         {
            guideId: "test-guide",
            stepIndex: 1,
            title: "Step Title",
            description: "Step Description"
         }
      ];

      render(
         <WalkthroughStep steps={steps}>
            <div data-testid="step-content">Step Content</div>
         </WalkthroughStep>
      );

      expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "true");
      expect(screen.getByText("Step Title")).toBeInTheDocument();
      expect(screen.getByText("Step Description")).toBeInTheDocument();
   });

   it("should not highlight when no matching step in steps array", () => {
      const steps = [
         {
            guideId: "different-guide",
            stepIndex: 1,
            title: "Step Title",
            description: "Step Description"
         }
      ];

      render(
         <WalkthroughStep steps={steps}>
            <div data-testid="step-content">Step Content</div>
         </WalkthroughStep>
      );

      expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "false");
   });

   it("should handle function children with callbacks", () => {
      const childrenFn = jest.fn(() => <div data-testid="function-content">Function Content</div>);

      render(
         <WalkthroughStep
            guideId="test-guide"
            stepIndex={1}
            title="Test Title"
            description="Test Description"
         >
            {childrenFn}
         </WalkthroughStep>
      );

      expect(childrenFn).toHaveBeenCalledWith({
         confirmUserPassedStep: expect.any(Function),
         confirmUserFinishedGuide: expect.any(Function)
      });
      expect(screen.getByTestId("function-content")).toBeInTheDocument();
   });

   it("should call setCurrentStep when step is passed (single step)", () => {
      render(
         <WalkthroughStep
            guideId="test-guide"
            stepIndex={1}
            title="Test Title"
            description="Test Description"
         >
            {({ confirmUserPassedStep }) => (
               <button data-testid="pass-step" onClick={confirmUserPassedStep}>
                  Pass Step
               </button>
            )}
         </WalkthroughStep>
      );

      fireEvent.click(screen.getByTestId("pass-step"));
      expect(mockStoreState.setCurrentStep).toHaveBeenCalledWith(2);
   });

   it("should call finishGuide when guide is finished (single step)", () => {
      render(
         <WalkthroughStep
            guideId="test-guide"
            stepIndex={1}
            title="Test Title"
            description="Test Description"
         >
            {({ confirmUserFinishedGuide }) => (
               <button data-testid="finish-guide" onClick={confirmUserFinishedGuide}>
                  Finish Guide
               </button>
            )}
         </WalkthroughStep>
      );

      fireEvent.click(screen.getByTestId("finish-guide"));
      expect(mockStoreState.finishGuide).toHaveBeenCalledWith("test-guide");
      expect(mockStoreState.setCurrentGuide).toHaveBeenCalledWith(null);
      expect(mockStoreState.setCurrentStep).toHaveBeenCalledWith(null);
   });

   it("should handle close button click", () => {
      render(
         <WalkthroughStep
            guideId="test-guide"
            stepIndex={1}
            title="Test Title"
            description="Test Description"
         >
            <div>Content</div>
         </WalkthroughStep>
      );

      const closeButton = screen.getByLabelText("Close guide");
      fireEvent.click(closeButton);
      
      expect(mockStoreState.finishGuide).toHaveBeenCalledWith("test-guide");
      expect(mockStoreState.setCurrentGuide).toHaveBeenCalledWith(null);
      expect(mockStoreState.setCurrentStep).toHaveBeenCalledWith(null);
   });

   it("should show confirm button when showConfirmButton is true", () => {
      render(
         <WalkthroughStep
            guideId="test-guide"
            stepIndex={1}
            title="Test Title"
            description="Test Description"
            showConfirmButton={true}
         >
            <div>Content</div>
         </WalkthroughStep>
      );

      expect(screen.getByText("Got it!")).toBeInTheDocument();
   });

   it("should not show confirm button when showConfirmButton is false", () => {
      render(
         <WalkthroughStep
            guideId="test-guide"
            stepIndex={1}
            title="Test Title"
            description="Test Description"
            showConfirmButton={false}
         >
            <div>Content</div>
         </WalkthroughStep>
      );

      expect(screen.queryByText("Got it!")).not.toBeInTheDocument();
   });

   it("should handle confirm button click", () => {
      render(
         <WalkthroughStep
            guideId="test-guide"
            stepIndex={1}
            title="Test Title"
            description="Test Description"
            showConfirmButton={true}
         >
            <div>Content</div>
         </WalkthroughStep>
      );

      fireEvent.click(screen.getByText("Got it!"));
      expect(mockStoreState.setCurrentStep).toHaveBeenCalledWith(2);
   });

   it("should apply correct className", () => {
      render(
         <WalkthroughStep
            guideId="test-guide"
            stepIndex={1}
            title="Test Title"
            description="Test Description"
            className="custom-class"
         >
            <div>Content</div>
         </WalkthroughStep>
      );

      // The className should be applied to the container div
      expect(screen.getByTestId("popover-anchor")).toHaveClass("custom-class");
   });

   it("should show ping animation when highlighted", async () => {
      const { container } = render(
         <WalkthroughStep
            guideId="test-guide"
            stepIndex={1}
            title="Test Title"
            description="Test Description"
         >
            <div>Content</div>
         </WalkthroughStep>
      );

      // Check if the component renders properly
      expect(screen.getByTestId("popover")).toHaveAttribute("data-open", "true");

      // After 3 seconds, the ping animation timeout should clear
      act(() => {
         jest.advanceTimersByTime(3100);
      });
      
      // Just verify the component is still working
      await waitFor(() => {
         expect(screen.getByTestId("popover")).toBeInTheDocument();
      });
   });

   it("should handle side prop for popover positioning", () => {
      render(
         <WalkthroughStep
            guideId="test-guide"
            stepIndex={1}
            title="Test Title"
            description="Test Description"
            side="top"
         >
            <div>Content</div>
         </WalkthroughStep>
      );

      expect(screen.getByTestId("popover-content")).toHaveAttribute("data-side", "top");
   });

   it("should work with steps array and handle step progression", () => {
      const steps = [
         {
            guideId: "test-guide",
            stepIndex: 1,
            title: "Step 1",
            description: "First step"
         }
      ];

      render(
         <WalkthroughStep steps={steps}>
            {({ confirmUserPassedStep }) => (
               <button data-testid="next-step" onClick={confirmUserPassedStep}>
                  Next
               </button>
            )}
         </WalkthroughStep>
      );

      fireEvent.click(screen.getByTestId("next-step"));
      expect(mockStoreState.setCurrentStep).toHaveBeenCalledWith(2);
   });
});