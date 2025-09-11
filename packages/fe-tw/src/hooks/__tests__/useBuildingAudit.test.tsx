import { renderHook, waitFor, act } from "@testing-library/react";
import React, { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("@/services/auditRegistryService", () => ({
   getAuditRecordIdsForBuilding: jest.fn(),
   getAuditRecordDetails: jest.fn(),
}));

jest.mock("@/services/ipfsService", () => ({
   fetchJsonFromIpfs: jest.fn(),
}));

const unsubscribeMock = jest.fn();
const watchContractEventSpy = jest.fn(() => unsubscribeMock);
jest.mock("@/services/contracts/watchContractEvent", () => ({
   watchContractEvent: (...args: any[]) => (watchContractEventSpy as any)(...args),
}));

jest.mock("@/services/contracts/abi/auditRegistryAbi", () => ({
   auditRegistryAbi: [],
}));

const writeContractMock = jest.fn();
jest.mock("@/hooks/useWriteContract", () => ({
   __esModule: true,
   default: () => ({ writeContract: writeContractMock }),
}));

const executeTransactionMock = jest.fn((fn: any) => fn());
jest.mock("@/hooks/useExecuteTransaction", () => ({
   __esModule: true,
   useExecuteTransaction: () => ({ executeTransaction: executeTransactionMock }),
}));

const readContractMock = jest.fn();
const walletStub = { wallet: true } as any;
jest.mock("@buidlerlabs/hashgraph-react-wallets", () => ({
   useWallet: () => walletStub,
   useReadContract: () => ({ readContract: readContractMock }),
   useEvmAddress: () => ({ data: "0xabc0000000000000000000000000000000000000" as const }),
}));

const readContractActionMock = jest.fn();
jest.mock("@buidlerlabs/hashgraph-react-wallets/actions", () => ({
   readContract: (...args: any[]) => (readContractActionMock as any)(...args),
}));

jest.mock("@/utils/helpers", () => ({
   prepareStorageIPFSfileURL: (id: string) => `ipfs://${id}`,
}));

jest.mock("@/hooks/useBuildingInfo", () => ({
   useBuildingInfo: (buildingAddress: string) => ({
      auditRegistryAddress: "0x1230000000000000000000000000000000000000",
      isLoading: false,
   }),
}));

import { useBuildingAudit } from "@/hooks/useBuildingAudit";
import {
   getAuditRecordIdsForBuilding,
   getAuditRecordDetails,
} from "@/services/auditRegistryService";
import { fetchJsonFromIpfs } from "@/services/ipfsService";

describe("useBuildingAudit", () => {
   const buildingAddress = "0xdead000000000000000000000000000000000000" as const;

   const createWrapper = () => {
      const queryClient = new QueryClient({
         defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });
      const Wrapper = ({ children }: PropsWithChildren) => (
         <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      return Wrapper;
   };

   beforeEach(() => {
      jest.clearAllMocks();
      readContractMock.mockImplementation(({ functionName }: any) => {
         if (functionName === "getAuditors") return [];
         if (functionName === "getAuditRecordsByBuilding") return [];
         if (functionName === "DEFAULT_ADMIN_ROLE") return "0xadmin";
         if (functionName === "AUDITOR_ROLE") return "0xauditor";
         if (functionName === "hasRole") return false;
         return undefined;
      });
   });

   it("subscribes and unsubscribes to AuditRecordRevoked events", async () => {
      const Wrapper = createWrapper();
      const { unmount } = renderHook(() => useBuildingAudit(buildingAddress), { wrapper: Wrapper });

      expect(watchContractEventSpy).toHaveBeenCalledTimes(1);
      const watchArgs = (watchContractEventSpy as jest.Mock).mock.calls[0][0];
      expect(watchArgs).toMatchObject({
         address: "0x1230000000000000000000000000000000000000",
         eventName: "AuditRecordRevoked",
      });

      unmount();
      expect(unsubscribeMock).toHaveBeenCalledTimes(1);
   });

   it("returns auditors list from contract", async () => {
      readContractMock.mockImplementation(({ functionName }: any) => {
         if (functionName === "getAuditors") return ["0x1", "0x2"];
         if (functionName === "DEFAULT_ADMIN_ROLE") return "0xadmin";
         if (functionName === "AUDITOR_ROLE") return "0xauditor";
         if (functionName === "hasRole") return false;
         if (functionName === "getAuditRecordsByBuilding") return [];
         return undefined;
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useBuildingAudit(buildingAddress), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.auditors).toEqual(["0x1", "0x2"]));
   });

   it("maps auditRecords with details and IPFS data", async () => {
      readContractMock.mockImplementation(({ functionName }: any) => {
         if (functionName === "getAuditRecordsByBuilding") return [1n, 2n];
         if (functionName === "DEFAULT_ADMIN_ROLE") return "0xadmin";
         if (functionName === "AUDITOR_ROLE") return "0xauditor";
         if (functionName === "hasRole") return false;
         return undefined;
      });

      (readContractActionMock as jest.Mock).mockResolvedValueOnce({
         building: buildingAddress,
         auditor: "0xaaa",
         timestamp: 111,
         revoked: false,
         ipfsHash: "hash1",
      });
      (fetchJsonFromIpfs as jest.Mock).mockResolvedValueOnce({
         auditReportIpfsId: "Qm1",
         extra: 1,
      });

      (readContractActionMock as jest.Mock).mockResolvedValueOnce({
         building: buildingAddress,
         auditor: "0xbbb",
         timestamp: 222,
         revoked: false,
         ipfsHash: "hash2",
      });
      (fetchJsonFromIpfs as jest.Mock).mockResolvedValueOnce({
         auditReportIpfsId: "Qm2",
         extra: 2,
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useBuildingAudit(buildingAddress), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.auditRecords).toBeTruthy());
      expect(result.current.auditRecords).toHaveLength(2);
      expect(result.current.auditRecords?.[0]).toMatchObject({
         recordId: "1",
         auditor: "0xaaa",
         auditReportIpfsUrl: "ipfs://Qm1",
         extra: 1,
      });
      expect(result.current.auditRecords?.[1]).toMatchObject({
         recordId: "2",
         auditor: "0xbbb",
         auditReportIpfsUrl: "ipfs://Qm2",
         extra: 2,
      });
   });

   it("returns userRoles using hasRole queries", async () => {
      readContractMock.mockImplementation(({ functionName, args }: any) => {
         if (functionName === "DEFAULT_ADMIN_ROLE") return "0xadmin";
         if (functionName === "AUDITOR_ROLE") return "0xauditor";
         if (functionName === "hasRole") {
            if (args?.[0] === "0xauditor") return true;
            if (args?.[0] === "0xadmin") return false;
         }
         if (functionName === "getAuditRecordsByBuilding") return [];
         return undefined;
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useBuildingAudit(buildingAddress), { wrapper: Wrapper });

      await waitFor(() =>
         expect(result.current.userRoles).toEqual({ isAdminRole: false, isAuditorRole: true }),
      );
   });

   it("returns auditData for the latest non-revoked record", async () => {
      const idsMock = getAuditRecordIdsForBuilding as jest.Mock;
      idsMock.mockResolvedValue([[1n, 2n]]);

      const detailsMock = getAuditRecordDetails as jest.Mock;
      detailsMock.mockResolvedValue([[null, null, 0, false, "Qm-audit-json"]]);

      (fetchJsonFromIpfs as jest.Mock).mockResolvedValue({ dataFromIpfs: true });

      readContractMock.mockImplementation(({ functionName }: any) => {
         if (functionName === "getAuditRecordsByBuilding") return [];
         if (functionName === "DEFAULT_ADMIN_ROLE") return "0xadmin";
         if (functionName === "AUDITOR_ROLE") return "0xauditor";
         if (functionName === "hasRole") return false;
         return undefined;
      });

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useBuildingAudit(buildingAddress), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.auditData).toBeTruthy());
      expect(result.current.auditData).toEqual({ data: { dataFromIpfs: true }, recordId: 2n });
   });

   it("exposes mutations that call writeContract via executeTransaction", async () => {
      writeContractMock.mockResolvedValue("ok");

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useBuildingAudit(buildingAddress), { wrapper: Wrapper });

      await act(async () => {
         const res1 = await result.current.addAuditRecordMutation.mutateAsync("Qm123");
         expect(res1).toBe("ok");
         const res2 = await result.current.updateAuditRecordMutation.mutateAsync({
            auditRecordId: 1n,
            newAuditIPFSHash: "Qm456",
         });
         expect(res2).toBe("ok");
         const res3 = await result.current.revokeAuditRecord.mutateAsync({ auditRecordId: 2n });
         expect(res3).toBe("ok");
      });

      expect(executeTransactionMock).toHaveBeenCalledTimes(3);
      const functionNames = writeContractMock.mock.calls.map((c) => c[0]?.functionName);
      expect(functionNames).toEqual(["addAuditRecord", "updateAuditRecord", "revokeAuditRecord"]);
   });
});
