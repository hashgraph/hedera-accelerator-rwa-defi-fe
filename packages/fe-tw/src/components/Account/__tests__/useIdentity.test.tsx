import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { useIdentity } from "../useIdentity";
import { BUILDING_FACTORY_ADDRESS } from "@/services/contracts/addresses";
import { ContractId } from "@hashgraph/sdk";
import { buildingFactoryAbi } from "@/services/contracts/abi/buildingFactoryAbi";

const unsubscribeMock = jest.fn();
const watchContractEventSpy = jest.fn(() => unsubscribeMock);
jest.mock("@/services/contracts/watchContractEvent", () => ({
   watchContractEvent: (...args: any[]) => (watchContractEventSpy as any)(...args),
}));

const EVM_ADDRESS = "0xEVM_ADDRESS";
const readContractMock = jest.fn();
jest.mock("@buidlerlabs/hashgraph-react-wallets", () => ({
   useReadContract: () => ({ readContract: readContractMock }),
   useEvmAddress: () => ({ data: EVM_ADDRESS }),
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

describe("useIdentity tests", () => {
   const buildingAddress = "0xBUILDING_ADDRESS" as const;

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
   });

   describe("IdentityRegistered event", () => {
      it("should subscribe and unsubscribe IdentityRegistered events by building address", () => {
         const { unmount } = renderHook(() => useIdentity(buildingAddress), {
            wrapper: createWrapper(),
         });

         expect(watchContractEventSpy).toHaveBeenCalledWith(
            expect.objectContaining({
               address: BUILDING_FACTORY_ADDRESS,
               eventName: "IdentityRegistered",
            }),
         );

         unmount();

         expect(unsubscribeMock).toHaveBeenCalled();
      });

      it("should not subscribe if no building address", () => {
         const { unmount } = renderHook(() => useIdentity(), {
            wrapper: createWrapper(),
         });

         expect(watchContractEventSpy).not.toHaveBeenCalled();
      });

      it("should receive event and correctly return that identity was regsitered", async () => {
         const { unmount, result } = renderHook(() => useIdentity(buildingAddress), {
            wrapper: createWrapper(),
         });

         const onLogs = watchContractEventSpy.mock.calls[0][0].onLogs;

         onLogs([
            {
               args: [buildingAddress, EVM_ADDRESS],
            },
         ]);

         await waitFor(() => {
            expect(result.current.identityData.isIdentityRegistered).toBeTruthy();
         });
      });

      it("should receive event and correctly return that identity was not regsitered", async () => {
         const { result } = renderHook(() => useIdentity(buildingAddress), {
            wrapper: createWrapper(),
         });

         const onLogs = watchContractEventSpy.mock.calls[0][0].onLogs;

         onLogs([
            {
               args: [buildingAddress, "0x_ANOTHER_EVM"],
            },
         ]);

         await waitFor(() => {
            expect(result.current.identityData.isIdentityRegistered).toBeFalsy();
         });
      });
   });

   describe("Identity", () => {
      it("should read contract and return that identity for evm was deployed", async () => {
         readContractMock.mockReturnValueOnce("0x_DEPLOYMENT_ADDRESS");

         const { result } = renderHook(() => useIdentity(buildingAddress), {
            wrapper: createWrapper(),
         });

         expect(readContractMock).toHaveBeenCalledWith(
            expect.objectContaining({
               address: BUILDING_FACTORY_ADDRESS,
               functionName: "getIdentity",
               args: [EVM_ADDRESS],
            }),
         );

         await waitFor(() => {
            expect(result.current.identityData.isDeployed).toBeTruthy();
         });
      });

      it("should deploy identity", async () => {
         const EVM_TO_DEPLOY = "0x_EVM_TO_DEPLOY";
         writeContractMock.mockReturnValueOnce(Promise.resolve({ transaction_id: "1" }));

         const { result } = renderHook(() => useIdentity(buildingAddress), {
            wrapper: createWrapper(),
         });

         await result.current.deployIdentity(EVM_TO_DEPLOY);

         expect(writeContractMock).toHaveBeenCalledWith(
            expect.objectContaining({
               contractId: ContractId.fromEvmAddress(0, 0, BUILDING_FACTORY_ADDRESS),
               functionName: "deployIdentityForWallet",
               args: [EVM_TO_DEPLOY],
            }),
         );
      });

      it("should register identity", async () => {
         writeContractMock.mockReturnValueOnce(Promise.resolve({ transaction_id: "1" }));

         const { result } = renderHook(() => useIdentity(buildingAddress), {
            wrapper: createWrapper(),
         });

         await result.current.registerIdentity(buildingAddress, 804);

         expect(writeContractMock).toHaveBeenCalledWith(
            expect.objectContaining({
               contractId: ContractId.fromEvmAddress(0, 0, BUILDING_FACTORY_ADDRESS),
               functionName: "registerIdentity",
               args: [buildingAddress, EVM_ADDRESS, 804],
            }),
         );
      });
   });
});
