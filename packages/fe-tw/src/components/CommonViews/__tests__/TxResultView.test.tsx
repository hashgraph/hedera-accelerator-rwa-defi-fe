import { render, screen } from "@testing-library/react";
import { TxResultToastView } from "../TxResultView";
import type { Transaction } from "../../Staking/types";

describe("TxResultToastView", () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   describe("Successful transaction scenarios", () => {
      const mockSuccessfulTransaction: Transaction = {
         transaction_id: "0.0.1234-1234567890-123456789",
      };

      it("should render successful transaction with default title", () => {
         render(<TxResultToastView txSuccess={mockSuccessfulTransaction} />);

         expect(screen.getByText("Successful transaction!")).toBeInTheDocument();
         expect(screen.getByText("View transaction")).toBeInTheDocument();
         
         const link = screen.getByRole("link", { name: "View transaction" });
         expect(link).toHaveAttribute(
            "href",
            "https://hashscan.io/testnet/transaction/0.0.1234-1234567890-123456789"
         );
         expect(link).toHaveAttribute("target", "_blank");
         expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });

      it("should render successful transaction with custom title", () => {
         render(
            <TxResultToastView
               title="Custom Success Message"
               txSuccess={mockSuccessfulTransaction}
            />
         );

         expect(screen.getByText("Custom Success Message")).toBeInTheDocument();
         expect(screen.getByText("View transaction")).toBeInTheDocument();
      });

      it("should render custom success view when provided", () => {
         const customSuccessView = <div data-testid="custom-success">Custom Success Content</div>;
         
         render(
            <TxResultToastView
               txSuccess={mockSuccessfulTransaction}
               customSuccessView={customSuccessView}
            />
         );

         expect(screen.getByTestId("custom-success")).toBeInTheDocument();
         expect(screen.getByText("Custom Success Content")).toBeInTheDocument();
      });
   });

   describe("Error transaction scenarios", () => {
      it("should render error with string error message", () => {
         const errorMessage = "Transaction failed: insufficient funds";
         
         render(<TxResultToastView txError={errorMessage} />);

         expect(screen.getByText("Error occurred")).toBeInTheDocument();
         
         const link = screen.getByRole("link", { name: "View transaction" });
         expect(link).toHaveAttribute(
            "href",
            `https://hashscan.io/testnet/transaction/${errorMessage}`
         );
      });

      it("should render error with object containing transaction_id", () => {
         const errorObject = { transaction_id: "0.0.5678-9876543210-987654321" };
         
         render(<TxResultToastView txError={errorObject} />);

         expect(screen.getByText("Error occurred")).toBeInTheDocument();
         
         const link = screen.getByRole("link", { name: "View transaction" });
         expect(link).toHaveAttribute(
            "href",
            "https://hashscan.io/testnet/transaction/0.0.5678-9876543210-987654321"
         );
      });

      it("should render error with boolean error (no transaction link)", () => {
         render(<TxResultToastView txError={true} />);

         expect(screen.getByText("Error occurred")).toBeInTheDocument();
         expect(screen.queryByRole("link", { name: "View transaction" })).not.toBeInTheDocument();
      });

      it("should render error with custom title", () => {
         render(
            <TxResultToastView
               title="Custom Error Message"
               txError="some-error"
            />
         );

         expect(screen.getByText("Custom Error Message")).toBeInTheDocument();
      });
   });

   describe("No transaction scenarios", () => {
      it("should render nothing when no txSuccess and no txError", () => {
         const { container } = render(<TxResultToastView />);

         expect(container.firstChild).toBeNull();
      });

      it("should render nothing when txSuccess and txError are falsy", () => {
         const { container } = render(
            <TxResultToastView txSuccess={undefined} txError={undefined} />
         );

         expect(container.firstChild).toBeNull();
      });
   });

   describe("CSS classes and accessibility", () => {
      it("should have correct CSS classes for success state", () => {
         const mockTransaction: Transaction = {
            transaction_id: "0.0.1234-1234567890-123456789",
         };
         
         render(<TxResultToastView txSuccess={mockTransaction} />);

         const container = screen.getByText("Successful transaction!").closest("div");
         expect(container).toHaveClass("flex", "flex-col");
         
         const link = screen.getByRole("link");
         expect(link).toHaveClass("text-blue-500");
      });

      it("should have correct CSS classes for error state", () => {
         render(<TxResultToastView txError="error" />);

         const container = screen.getByText("Error occurred").closest("div");
         expect(container).toHaveClass("flex", "flex-col");
         
         const link = screen.getByRole("link");
         expect(link).toHaveClass("text-blue-500");
      });
   });

   describe("Edge cases", () => {
      it("should handle error object without transaction_id gracefully", () => {
         const errorObject = { message: "Some error message" };
         
         render(<TxResultToastView txError={errorObject as any} />);

         expect(screen.getByText("Error occurred")).toBeInTheDocument();
         
         const link = screen.getByRole("link", { name: "View transaction" });
         expect(link).toHaveAttribute(
            "href",
            `https://hashscan.io/testnet/transaction/${errorObject}`
         );
      });

      it("should handle both txSuccess and txError (both are rendered)", () => {
         const mockTransaction: Transaction = {
            transaction_id: "0.0.1234-1234567890-123456789",
         };
         
         render(
            <TxResultToastView
               txSuccess={mockTransaction}
               txError="some error"
            />
         );

         // Both success and error should be rendered
         expect(screen.getByText("Successful transaction!")).toBeInTheDocument();
         expect(screen.getByText("Error occurred")).toBeInTheDocument();
      });
   });
});