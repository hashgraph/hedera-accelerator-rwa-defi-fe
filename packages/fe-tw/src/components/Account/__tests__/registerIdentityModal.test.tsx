import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterIdentityModal from "@/components/Account/registerIdentityModal";
import { toast } from "sonner";

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

jest.mock("../../CommonViews/TxResultView", () => ({
   TxResultToastView: ({ title }: { title: string }) => <span>{title}</span>,
}));

const mockAlpha2ToNumeric = jest.fn((code: string) =>
   code === "US" ? "840" : code === "CA" ? "124" : "0",
);
jest.mock("i18n-iso-countries", () => ({
   __esModule: true,
   default: {
      registerLocale: jest.fn(),
      getNames: jest.fn(() => ({ US: "United States", CA: "Canada" })),
      alpha2ToNumeric: (code: string) => mockAlpha2ToNumeric(code),
   },
}));

beforeAll(() => {
   const EP: any = Element.prototype as unknown as Record<string, any>;
   if (!EP.hasPointerCapture) EP.hasPointerCapture = () => false;
   if (!EP.setPointerCapture) EP.setPointerCapture = () => {};
   if (!EP.releasePointerCapture) EP.releasePointerCapture = () => {};
   if (!EP.scrollIntoView) EP.scrollIntoView = () => {};
});

const mockRegisterIdentity = jest.fn();
let mockIsRegistering = false;
jest.mock("../useIdentity", () => ({
   useIdentity: () => ({
      registerIdentity: mockRegisterIdentity,
      isRegistering: mockIsRegistering,
   }),
}));

describe("RegisterIdentityModal", () => {
   const buildingAddress = "0xBuilding";

   beforeEach(() => {
      jest.clearAllMocks();
      mockIsRegistering = false;
   });

   function renderModal(open = true) {
      const onOpenChange = jest.fn();
      render(
         <RegisterIdentityModal
            buildingAddress={buildingAddress}
            isModalOpened={open}
            onOpenChange={onOpenChange}
         />,
      );
      return { onOpenChange };
   }

   async function selectCountry(label: string) {
      await userEvent.click(screen.getByRole("combobox", { name: "Country of Residence" }));
      const option = await screen.findByRole("option", { name: label });
      await userEvent.click(option);
   }

   it("renders when open and disables submit until a country is selected", () => {
      renderModal(true);

      expect(screen.getByRole("heading", { name: /Register Identity/i })).toBeInTheDocument();
      expect(
         screen.getByText("Register ERC3643 compliant identity for your wallet"),
      ).toBeInTheDocument();

      const submitBtn = screen.getByRole("button", { name: "Register Identity" });
      expect(submitBtn).toBeDisabled();
   });

   it("allows selecting a country and submits successfully, closing the modal and toasting", async () => {
      mockRegisterIdentity.mockResolvedValueOnce({} as any);
      const { onOpenChange } = renderModal(true);

      await selectCountry("United States (US)");

      const submitBtn = screen.getByRole("button", { name: "Register Identity" });
      await userEvent.click(submitBtn);

      await waitFor(() => {
         // Register invoked with building and converted numeric country
         expect(mockRegisterIdentity).toHaveBeenCalledWith(buildingAddress, 840);
         expect(toast.success).toHaveBeenCalled();
         expect(onOpenChange).toHaveBeenCalledWith(false);
      });
   });

   it("shows error toast and keeps modal open on failure", async () => {
      mockRegisterIdentity.mockRejectedValueOnce(new Error("boom"));
      const { onOpenChange } = renderModal(true);

      await selectCountry("Canada (CA)");
      const submitBtn = screen.getByRole("button", { name: "Register Identity" });
      await userEvent.click(submitBtn);

      await waitFor(() => {
         expect(mockRegisterIdentity).toHaveBeenCalledWith(buildingAddress, 124);
         expect(toast.error).toHaveBeenCalled();
         expect(onOpenChange).not.toHaveBeenCalled();
      });
   });

   it("respects loading state (button disabled and label changes)", async () => {
      mockIsRegistering = true;
      renderModal(true);

      // When loading, label should show Registering... and be disabled
      expect(screen.getByRole("button", { name: "Registering..." })).toBeDisabled();
   });

   it("closes when Cancel is clicked", async () => {
      const { onOpenChange } = renderModal(true);
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onOpenChange).toHaveBeenCalledWith(false);
   });
});
