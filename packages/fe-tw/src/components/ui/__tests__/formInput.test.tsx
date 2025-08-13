import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormInput } from "../formInput";

describe("FormInput", () => {
   it("renders label and input correctly", () => {
      render(<FormInput label="Test Label" name="test" />);
      
      expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
   });

   it("shows required asterisk when required prop is true", () => {
      render(<FormInput label="Test Label" name="test" required />);
      
      expect(screen.getByText("*")).toBeInTheDocument();
   });

   it("displays error message when error prop is provided", () => {
      render(<FormInput label="Test Label" name="test" error="Test error message" />);
      
      expect(screen.getByText("Test error message")).toBeInTheDocument();
   });

   it("displays description when description prop is provided", () => {
      render(<FormInput label="Test Label" name="test" description="Test description" />);
      
      expect(screen.getByText("Test description")).toBeInTheDocument();
   });

   it("shows tooltip icon when tooltipContent is provided", () => {
      render(<FormInput label="Test Label" name="test" tooltipContent="This is a tooltip" />);
      
      // Look for the help button
      expect(screen.getByRole("button", { name: "Help for Test Label" })).toBeInTheDocument();
   });

   it("does not show tooltip icon when tooltipContent is not provided", () => {
      render(<FormInput label="Test Label" name="test" />);
      
      // Should not find any help button
      expect(screen.queryByRole("button", { name: "Help for Test Label" })).not.toBeInTheDocument();
   });
});