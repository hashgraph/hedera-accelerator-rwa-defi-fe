import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Account from "@/components/Account/account";
import { toast } from "sonner";

// Mocks
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

jest.mock("../../CommonViews/TxResultView", () => ({
   TxResultToastView: ({ title }: { title: string }) => <span>{title}</span>,
}));

// WalkthroughStep as pass-through render-prop component
jest.mock("../../Walkthrough", () => ({
   __esModule: true,
   WalkthroughStep: ({ children }: any) =>
      typeof children === "function" ? children({ confirmUserPassedStep: jest.fn() }) : children,
}));

// Router mock
const mockRouterBack = jest.fn();
jest.mock("next/navigation", () => ({
   useRouter: () => ({ back: mockRouterBack }),
}));

// EVM address mock
let mockEvmAddress: string | null = null;
jest.mock("@buidlerlabs/hashgraph-react-wallets", () => ({
   useEvmAddress: () => ({ data: mockEvmAddress }),
}));

// useIdentity mock
const mockDeployIdentity = jest.fn();
let mockIdentityData = {
   isDeployed: false,
   isIdentityRegistered: false,
   isLoading: false,
   isFetched: true,
};
jest.mock("../useIdentity", () => ({
   useIdentity: () => ({
      identityData: mockIdentityData,
      deployIdentity: mockDeployIdentity,
   }),
}));

// tryCatch mock to control outcomes
type TryCatchResult = { data?: any; error?: any };
let mockTryCatchImpl: (p: Promise<any>) => Promise<TryCatchResult> = async (p) => ({
   data: await p,
});
jest.mock("@/services/tryCatch", () => ({
   tryCatch: (p: Promise<any>) => mockTryCatchImpl(p),
}));

beforeAll(() => {
   const EP: any = Element.prototype as unknown as Record<string, any>;
   if (!EP.hasPointerCapture) EP.hasPointerCapture = () => false;
   if (!EP.setPointerCapture) EP.setPointerCapture = () => {};
   if (!EP.releasePointerCapture) EP.releasePointerCapture = () => {};
   if (!EP.scrollIntoView) EP.scrollIntoView = () => {};
});

describe("Account", () => {
   beforeEach(() => {
      jest.clearAllMocks();
      mockEvmAddress = null;
      mockIdentityData = {
         isDeployed: false,
         isIdentityRegistered: false,
         isLoading: false,
         isFetched: true,
      };
   });

   it("shows connect wallet message when no wallet is connected", () => {
      render(<Account />);
      expect(screen.getByText(/Connect wallet first/i)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Deploy Identity/i })).not.toBeInTheDocument();
   });

   it("shows identity deployed status and no deploy button when already deployed", () => {
      mockEvmAddress = "0xabc";
      mockIdentityData = { ...mockIdentityData, isDeployed: true };
      render(<Account />);
      expect(screen.getByText(/Identity deployed/i)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Deploy Identity/i })).not.toBeInTheDocument();
   });

   it("shows warning and deploy button when wallet is connected and not deployed", () => {
      mockEvmAddress = "0xabc";
      render(<Account />);
      expect(screen.getByText(/No identity deployed for this wallet/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Deploy Identity/i })).toBeEnabled();
   });

   it("deploys identity successfully, shows toast, and navigates back", async () => {
      mockEvmAddress = "0x123";
      mockDeployIdentity.mockResolvedValueOnce({ success: true });
      mockTryCatchImpl = async (p) => ({ data: await p });

      render(<Account />);

      await userEvent.click(screen.getByRole("button", { name: /Deploy Identity/i }));

      await waitFor(() => {
         expect(mockDeployIdentity).toHaveBeenCalledWith("0x123");
         expect(toast.success).toHaveBeenCalled();
         expect(mockRouterBack).toHaveBeenCalled();
      });
   });

   it("shows tx error toast when tx returns error field", async () => {
      mockEvmAddress = "0x123";
      mockDeployIdentity.mockResolvedValueOnce({ error: { message: "tx failed" } });
      mockTryCatchImpl = async (p) => ({ data: await p });

      render(<Account />);
      await userEvent.click(screen.getByRole("button", { name: /Deploy Identity/i }));

      await waitFor(() => {
         expect(toast.error).toHaveBeenCalled();
         expect(mockRouterBack).not.toHaveBeenCalled();
      });
   });

   it("shows toast error when tryCatch returns error", async () => {
      mockEvmAddress = "0x123";
      mockDeployIdentity.mockResolvedValueOnce({});
      mockTryCatchImpl = async () => ({ error: { message: "boom" } });

      render(<Account />);
      await userEvent.click(screen.getByRole("button", { name: /Deploy Identity/i }));

      await waitFor(() => {
         expect(toast.error).toHaveBeenCalled();
         expect(mockRouterBack).not.toHaveBeenCalled();
      });
   });
});
