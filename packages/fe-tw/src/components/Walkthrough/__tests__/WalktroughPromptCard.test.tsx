import { render, screen, fireEvent } from "@testing-library/react";
import { WalkthroughPromptCard } from "../WalktroughPromptCard";

describe("WalkthroughPromptCard", () => {
   const defaultProps = {
      title: "Test Title",
      description: "Test Description",
      currentGuide: "test-guide",
      guides: [{ guideId: "test-guide", priority: 1 }],
      currentStep: null,
      setCurrentStep: jest.fn(),
      confirmUserFinishedGuide: jest.fn(),
      setHideAllGuides: jest.fn(),
   };

   beforeEach(() => {
      jest.clearAllMocks();
   });

   it("should render the prompt card when conditions are met", () => {
      render(<WalkthroughPromptCard {...defaultProps} />);
      
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
      expect(screen.getByText("Yes")).toBeInTheDocument();
      expect(screen.getByText("No")).toBeInTheDocument();
      expect(screen.getByText("No, for all")).toBeInTheDocument();
   });

   it("should not render when currentStep is not null", () => {
      render(
         <WalkthroughPromptCard 
            {...defaultProps} 
            currentStep={1} 
         />
      );
      
      expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
   });

   it("should not render when currentGuide is null", () => {
      render(
         <WalkthroughPromptCard 
            {...defaultProps} 
            currentGuide={null} 
         />
      );
      
      expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
   });

   it("should not render when guide is not in guides array", () => {
      render(
         <WalkthroughPromptCard 
            {...defaultProps} 
            currentGuide="non-existent-guide"
         />
      );
      
      expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
   });

   it("should call setCurrentStep(1) when Yes button is clicked", () => {
      const setCurrentStepMock = jest.fn();
      
      render(
         <WalkthroughPromptCard 
            {...defaultProps} 
            setCurrentStep={setCurrentStepMock}
         />
      );
      
      fireEvent.click(screen.getByText("Yes"));
      expect(setCurrentStepMock).toHaveBeenCalledWith(1);
   });

   it("should call confirmUserFinishedGuide when No button is clicked", () => {
      const confirmUserFinishedGuideMock = jest.fn();
      
      render(
         <WalkthroughPromptCard 
            {...defaultProps} 
            confirmUserFinishedGuide={confirmUserFinishedGuideMock}
         />
      );
      
      fireEvent.click(screen.getByText("No"));
      expect(confirmUserFinishedGuideMock).toHaveBeenCalledWith("test-guide");
   });

   it("should call setHideAllGuides(true) when 'No, for all' button is clicked", () => {
      const setHideAllGuidesMock = jest.fn();
      
      render(
         <WalkthroughPromptCard 
            {...defaultProps} 
            setHideAllGuides={setHideAllGuidesMock}
         />
      );
      
      fireEvent.click(screen.getByText("No, for all"));
      expect(setHideAllGuidesMock).toHaveBeenCalledWith(true);
   });

   it("should render without title and description when not provided", () => {
      render(
         <WalkthroughPromptCard 
            {...defaultProps} 
            title={undefined}
            description={undefined}
         />
      );
      
      // Should still render the buttons
      expect(screen.getByText("Yes")).toBeInTheDocument();
      expect(screen.getByText("No")).toBeInTheDocument();
      expect(screen.getByText("No, for all")).toBeInTheDocument();
   });

   it("should have proper CSS classes for positioning", () => {
      const { container } = render(<WalkthroughPromptCard {...defaultProps} />);
      const card = container.querySelector('.fixed.right-2.bottom-2.max-w-xs');
      
      expect(card).toBeInTheDocument();
   });
});