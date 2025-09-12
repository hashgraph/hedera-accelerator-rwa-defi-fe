import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuditManagementForm } from "../index";
import ReactLib from "react";

// Mock interactive UI layers to avoid act warnings/timeouts
jest.mock("@/components/ui/tooltip", () => ({
   __esModule: true,
   Tooltip: ({ children }: any) => children,
   TooltipTrigger: ({ children }: any) => children,
   TooltipContent: ({ children }: any) => children,
   TooltipProvider: ({ children }: any) => children,
}));

jest.mock("@/hooks/useBuildingAudit", () => ({ useBuildingAudit: jest.fn() }));
jest.mock("@buidlerlabs/hashgraph-react-wallets", () => ({
   useEvmAddress: jest.fn(() => ({ data: "0x123" })),
}));
jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/components/CommonViews/TxResultView", () => ({
   TxResultToastView: ({ title }: { title: string }) => (
      <div data-testid="tx-result" data-title={title} />
   ),
}));
jest.mock("@/utils/pinata", () => ({
   pinata: {
      upload: {
         json: jest.fn(() => ({
            key: jest.fn().mockResolvedValue({ IpfsHash: "QmJSON" }),
         })),
         file: jest.fn(() => ({
            key: jest.fn().mockResolvedValue({ IpfsHash: "QmFILE" }),
         })),
      },
   },
}));
beforeAll(() => {
   const EP: any = Element.prototype as unknown as Record<string, any>;
   if (!EP.hasPointerCapture) {
      EP.hasPointerCapture = () => false;
   }
   if (!EP.setPointerCapture) {
      EP.setPointerCapture = () => {};
   }
   if (!EP.releasePointerCapture) {
      EP.releasePointerCapture = () => {};
   }
   if (!EP.scrollIntoView) {
      EP.scrollIntoView = () => {};
   }
   // Needed for Radix portal measurements in tests
   // @ts-ignore
   if (!document.elementFromPoint) document.elementFromPoint = () => null;
});

import { useBuildingAudit } from "@/hooks/useBuildingAudit";

describe("AuditManagementForm", () => {
   const mockAdd = jest.fn();
   const mockUpdate = jest.fn();
   const mockRevoke = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      global.fetch = jest.fn().mockResolvedValue({
         json: jest.fn().mockResolvedValue({ JWT: "test-jwt" }),
      });
   });

   const baseHookReturn = {
      addAuditRecordMutation: { mutateAsync: mockAdd, isPending: false },
      updateAuditRecordMutation: { mutateAsync: mockUpdate, isPending: false },
      revokeAuditRecord: { mutateAsync: mockRevoke, isPending: false },
      buildingDetailsLoaded: true,
      auditors: ["0x123"],
      auditData: undefined,
      auditRecords: [],
      userRoles: [],
      userRolesLoading: false,
   };

   it("creates a new audit record when form is valid", async () => {
      (useBuildingAudit as jest.Mock).mockReturnValue(baseHookReturn);
      mockAdd.mockResolvedValue({ txId: "0xadd" });

      render(<AuditManagementForm buildingAddress={"0xabc" as `0x${string}`} />);

      const user = userEvent.setup();

      await user.type(screen.getByRole("textbox", { name: /Company Name/i }), "ACME Audits");
      await user.type(screen.getByRole("textbox", { name: /Auditor Name/i }), "John Doe");
      await user.type(screen.getByLabelText(/^Audit Date\s*\*?$/i), "2025-01-10");

      await user.click(screen.getByRole("combobox", { name: /Audit Type\/Purpose/i }));
      await user.click(await screen.findByRole("option", { name: /Structural/i }));

      await user.type(
         screen.getByRole("textbox", { name: /Audit Reference\/ID Number/i }),
         "AUD-2025-001",
      );

      await user.type(screen.getByLabelText(/Audit Validity From/i), "2025-01-01");
      await user.type(screen.getByLabelText(/Audit Validity To/i), "2025-12-31");

      await user.click(screen.getByRole("combobox", { name: /Overall Condition Rating/i }));
      await user.click(await screen.findByRole("option", { name: /Good/i }));

      await user.click(screen.getByRole("combobox", { name: /Immediate Action Required/i }));
      await user.click(await screen.findByRole("option", { name: /^No$/i }));

      await user.type(screen.getByLabelText(/^Next Recommended Audit Date\s*\*?$/i), "2025-06-01");

      await user.type(
         screen.getByRole("textbox", { name: /PDF Audit Report Upload/i }),
         "QmREPORT",
      );

      await user.type(
         screen.getByPlaceholderText(/Any additional notes or observations/i),
         "All good",
      );

      await user.click(screen.getByRole("button", { name: /Create Audit Record/i }));

      await waitFor(() => {
         expect(mockAdd).toHaveBeenCalledTimes(1);
         expect(mockAdd).toHaveBeenCalledWith("QmJSON");
      });
   }, 15000);

   it("updates an existing audit record when form is valid and changed", async () => {
      const existingRecord = {
         recordId: "5",
         companyName: "Init Co",
         auditorName: "Alice",
         auditDate: "2025-01-01",
         auditType: "structural",
         auditReferenceId: "AUD-1",
         auditValidityFrom: "2025-01-01",
         auditValidityTo: "2025-12-31",
         overallConditionRating: "good",
         immediateActionRequired: "no",
         nextRecommendedAuditDate: "2025-06-01",
         auditReportIpfsId: "QmOLD",
         notes: "Initial notes",
      };

      (useBuildingAudit as jest.Mock).mockReturnValue({
         ...baseHookReturn,
         auditRecords: [existingRecord],
      });
      mockUpdate.mockResolvedValue({ txId: "0xupdate" });

      render(
         <AuditManagementForm
            buildingAddress={"0xabc" as `0x${string}`}
            recordId={existingRecord.recordId}
         />,
      );

      const user = userEvent.setup();

      const companyInput = screen.getByRole("textbox", { name: /Company Name/i });
      await user.clear(companyInput);
      await user.type(companyInput, "Updated Co");

      const updateBtn = screen.getByRole("button", { name: /Update Audit Record/i });
      expect(updateBtn).toBeEnabled();

      await user.click(updateBtn);

      await waitFor(() => {
         expect(mockUpdate).toHaveBeenCalledTimes(1);
         expect(mockUpdate).toHaveBeenCalledWith({
            auditRecordId: BigInt(existingRecord.recordId),
            newAuditIPFSHash: "QmJSON",
         });
      });

      expect(screen.getByRole("button", { name: /Revoke Record/i })).toBeInTheDocument();
   }, 15000);
});
