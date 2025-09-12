import { render, screen } from "@testing-library/react";
import { LoadingView } from "../LoadingView";

// Mock the Skeleton component
jest.mock("@/components/ui/skeleton", () => ({
   Skeleton: ({ className }: { className: string }) => (
      <div data-testid="skeleton" className={className} />
   ),
}));

describe("LoadingView", () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   it("should render loading skeletons when isLoading is true", () => {
      render(<LoadingView isLoading={true} />);

      const skeletons = screen.getAllByTestId("skeleton");
      expect(skeletons).toHaveLength(3); // 1 circular + 2 rectangular skeletons

      // Check for the circular skeleton
      expect(skeletons[0]).toHaveClass("h-12", "w-12", "rounded-full");

      // Check for the rectangular skeletons
      expect(skeletons[1]).toHaveClass("h-4", "w-[250px]");
      expect(skeletons[2]).toHaveClass("h-4", "w-[200px]");
   });

   it("should not render anything when isLoading is false", () => {
      render(<LoadingView isLoading={false} />);

      const skeletons = screen.queryAllByTestId("skeleton");
      expect(skeletons).toHaveLength(0);
   });

   it("should have correct container classes when isLoading is true", () => {
      const { container } = render(<LoadingView isLoading={true} />);

      const loadingContainer = container.querySelector("div");
      expect(loadingContainer).toHaveClass("flex", "items-center", "space-x-4");
   });

   it("should have nested structure with space-y-2 for text skeletons", () => {
      render(<LoadingView isLoading={true} />);

      const innerContainer = screen.getAllByTestId("skeleton")[1].parentElement;
      expect(innerContainer).toHaveClass("space-y-2");
   });
});