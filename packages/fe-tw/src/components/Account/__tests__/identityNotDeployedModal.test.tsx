import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdentityNotDeployedModal from "@/components/Account/IdentityNotDeployedModal";

// WalkthroughStep as pass-through
jest.mock("../../Walkthrough", () => ({
   __esModule: true,
   WalkthroughStep: ({ children }: any) =>
      typeof children === "function" ? children({ confirmUserPassedStep: jest.fn() }) : children,
}));

beforeAll(() => {
   const EP: any = Element.prototype as unknown as Record<string, any>;
   if (!EP.hasPointerCapture) EP.hasPointerCapture = () => false;
   if (!EP.setPointerCapture) EP.setPointerCapture = () => {};
   if (!EP.releasePointerCapture) EP.releasePointerCapture = () => {};
   if (!EP.scrollIntoView) EP.scrollIntoView = () => {};
});

describe("IdentityNotDeployedModal", () => {
   function renderModal(open = true) {
      const onOpenChange = jest.fn();
      render(<IdentityNotDeployedModal isModalOpened={open} onOpenChange={onOpenChange} />);
      return { onOpenChange };
   }

   it("renders content when open", () => {
      renderModal(true);
      expect(screen.getByText(/Identity Required/i)).toBeInTheDocument();
      expect(screen.getByText(/Deploy your ERC3643 identity first/i)).toBeInTheDocument();
      expect(screen.getByText(/Next Steps/i)).toBeInTheDocument();
      // Link button exists
      expect(screen.getByRole("button", { name: /Deploy Identity/i })).toBeInTheDocument();
   });

   it("invokes onOpenChange(false) when Cancel is clicked", async () => {
      const { onOpenChange } = renderModal(true);
      await userEvent.click(screen.getByRole("button", { name: /Cancel/i }));
      expect(onOpenChange).toHaveBeenCalledWith(false);
   });
});
