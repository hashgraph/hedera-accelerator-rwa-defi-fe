import { render, screen } from "@testing-library/react";
import { ConditionalWalkthroughStep } from "../ConditionalWalkthroughStep";

// Mock the WalkthroughStep component
jest.mock("../WalkthroughStep", () => ({
   WalkthroughStep: ({ children, steps, className, ...props }: any) => (
      <div 
         data-testid="walkthrough-step" 
         data-steps={JSON.stringify(steps)}
         className={className}
         data-props={JSON.stringify(props)}
      >
         {typeof children === "function" 
            ? children({ 
                confirmUserPassedStep: jest.fn(), 
                confirmUserFinishedGuide: jest.fn() 
              })
            : children
         }
      </div>
   )
}));

describe("ConditionalWalkthroughStep", () => {
   const defaultSteps = [
      { 
         guideId: "test-guide", 
         stepIndex: 1, 
         title: "Step 1", 
         description: "Test description 1",
         enabled: false 
      },
      { 
         guideId: "test-guide", 
         stepIndex: 2, 
         title: "Step 2", 
         description: "Test description 2",
         enabled: true 
      }
   ];

   const childrenMock = jest.fn(({ confirmUserPassedStep, confirmUserFinishedGuide }) => (
      <div data-testid="test-content">Test Content</div>
   ));

   beforeEach(() => {
      jest.clearAllMocks();
   });

   it("should render WalkthroughStep when an enabled step is found", () => {
      render(
         <ConditionalWalkthroughStep 
            steps={defaultSteps}
            className="test-class"
         >
            {childrenMock}
         </ConditionalWalkthroughStep>
      );

      const walkthroughStep = screen.getByTestId("walkthrough-step");
      expect(walkthroughStep).toBeInTheDocument();
      expect(walkthroughStep).toHaveClass("test-class");
      
      // Should pass the enabled step to WalkthroughStep
      const stepsData = JSON.parse(walkthroughStep.getAttribute("data-steps") || "[]");
      expect(stepsData).toHaveLength(1);
      expect(stepsData[0]).toEqual({
         guideId: "test-guide",
         stepIndex: 2,
         title: "Step 2", 
         description: "Test description 2",
         enabled: true
      });

      expect(screen.getByTestId("test-content")).toBeInTheDocument();
   });

   it("should render plain div when no enabled step is found", () => {
      const stepsWithoutEnabled = [
         { 
            guideId: "test-guide", 
            stepIndex: 1, 
            title: "Step 1", 
            description: "Test description 1",
            enabled: false 
         },
         { 
            guideId: "test-guide", 
            stepIndex: 2, 
            title: "Step 2", 
            description: "Test description 2",
            enabled: false 
         }
      ];

      render(
         <ConditionalWalkthroughStep 
            steps={stepsWithoutEnabled}
            className="test-class"
         >
            {childrenMock}
         </ConditionalWalkthroughStep>
      );

      // Should not render WalkthroughStep
      expect(screen.queryByTestId("walkthrough-step")).not.toBeInTheDocument();
      
      // Should render content in a plain div
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
      
      // The div should have the className
      const container = screen.getByTestId("test-content").parentElement;
      expect(container).toHaveClass("test-class");
   });

   it("should render plain div when steps array is empty", () => {
      render(
         <ConditionalWalkthroughStep 
            steps={[]}
            className="test-class"
         >
            {childrenMock}
         </ConditionalWalkthroughStep>
      );

      expect(screen.queryByTestId("walkthrough-step")).not.toBeInTheDocument();
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
   });

   it("should pass empty functions to children when no enabled step", () => {
      const stepsWithoutEnabled = [
         { 
            guideId: "test-guide", 
            stepIndex: 1, 
            title: "Step 1", 
            description: "Test description 1",
            enabled: false 
         }
      ];

      const childrenSpy = jest.fn(() => <div>content</div>);

      render(
         <ConditionalWalkthroughStep steps={stepsWithoutEnabled}>
            {childrenSpy}
         </ConditionalWalkthroughStep>
      );

      expect(childrenSpy).toHaveBeenCalledWith({
         confirmUserPassedStep: expect.any(Function),
         confirmUserFinishedGuide: expect.any(Function)
      });

      // The functions should be no-ops
      const { confirmUserPassedStep, confirmUserFinishedGuide } = childrenSpy.mock.calls[0][0];
      expect(() => confirmUserPassedStep()).not.toThrow();
      expect(() => confirmUserFinishedGuide()).not.toThrow();
   });

   it("should pass through additional walkthrough props to WalkthroughStep", () => {
      const additionalProps = {
         title: "Custom Title",
         description: "Custom Description",
         side: "top" as const,
         showConfirmButton: true
      };

      render(
         <ConditionalWalkthroughStep 
            steps={defaultSteps}
            {...additionalProps}
         >
            {childrenMock}
         </ConditionalWalkthroughStep>
      );

      const walkthroughStep = screen.getByTestId("walkthrough-step");
      const propsData = JSON.parse(walkthroughStep.getAttribute("data-props") || "{}");
      
      expect(propsData.title).toBe("Custom Title");
      expect(propsData.description).toBe("Custom Description");
      expect(propsData.side).toBe("top");
      expect(propsData.showConfirmButton).toBe(true);
   });

   it("should find the first enabled step when multiple are enabled", () => {
      const multipleEnabledSteps = [
         { 
            guideId: "test-guide", 
            stepIndex: 1, 
            title: "Step 1", 
            description: "Test description 1",
            enabled: false 
         },
         { 
            guideId: "test-guide", 
            stepIndex: 2, 
            title: "Step 2", 
            description: "Test description 2",
            enabled: true 
         },
         { 
            guideId: "test-guide", 
            stepIndex: 3, 
            title: "Step 3", 
            description: "Test description 3",
            enabled: true 
         }
      ];

      render(
         <ConditionalWalkthroughStep steps={multipleEnabledSteps}>
            {childrenMock}
         </ConditionalWalkthroughStep>
      );

      const walkthroughStep = screen.getByTestId("walkthrough-step");
      const stepsData = JSON.parse(walkthroughStep.getAttribute("data-steps") || "[]");
      
      // Should use the first enabled step (Step 2)
      expect(stepsData[0].stepIndex).toBe(2);
      expect(stepsData[0].title).toBe("Step 2");
   });
});