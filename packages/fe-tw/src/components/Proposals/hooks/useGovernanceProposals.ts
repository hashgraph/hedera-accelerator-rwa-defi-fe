import { buildingGovernanceAbi } from "@/services/contracts/abi/buildingGovernanceAbi";
import { CreateProposalPayload } from "@/types/erc3643/types";
import {
   Proposal,
   ProposalDeadlines,
   ProposalStates,
   ProposalType,
   ProposalVotes,
} from "@/types/props";
import { useWatchTransactionReceipt, useEvmAddress } from "@buidlerlabs/hashgraph-react-wallets";
import { formatUnits } from "viem";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { readContract } from "@/services/contracts/readContract";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import { ContractId, TransactionReceipt } from "@hashgraph/sdk";
import { useState, useEffect, useMemo } from "react";
import { tryCatch } from "@/services/tryCatch";
import { tokenVotesAbi } from "@/services/contracts/abi/tokenVotesAbi";
import { useExecuteTransaction } from "@/hooks/useExecuteTransaction";
import useWriteContract from "@/hooks/useWriteContract";

export const useGovernanceProposals = (
   buildingGovernanceAddress?: `0x${string}`,
   buildingToken?: `0x${string}`,
) => {
   const { writeContract } = useWriteContract();
   const { executeTransaction } = useExecuteTransaction();
   const { data: evmAddress } = useEvmAddress();
   const queryClient = useQueryClient();
   const [governanceCreatedProposals, setGovernanceCreatedProposals] = useState<Proposal[]>([]);
   const [governanceDefinedProposals, setGovernanceDefinedProposals] = useState<any[]>([]);
   const [isDelegated, setIsDelegated] = useState<boolean>(false);

   const execProposal = async (
      proposalId: number,
      proposalType: ProposalType,
   ): Promise<string | undefined> => {
      if (!buildingGovernanceAddress) {
         return Promise.reject("No governance deployed for a building");
      }

      let functionName = "executeTextProposal";

      if (proposalType === ProposalType.ChangeReserveProposal) {
         functionName = "executeChangeReserveProposal";
      } else if (proposalType === ProposalType.PaymentProposal) {
         functionName = "executePaymentProposal";
      }

      const tx = (await executeTransaction(() =>
         writeContract({
            functionName,
            args: [proposalId],
            abi: buildingGovernanceAbi,
            contractId: ContractId.fromEvmAddress(0, 0, buildingGovernanceAddress),
         }),
      )) as { transaction_id: string };

      return tx?.transaction_id;
   };

   const createPaymentProposal = async (
      proposalPayload: CreateProposalPayload,
   ): Promise<string> => {
      if (!buildingGovernanceAddress) {
         return Promise.reject("No governance deployed for a building");
      }

      const tx = (await executeTransaction(() =>
         writeContract({
            functionName: "createPaymentProposal",
            args: [proposalPayload.amount, proposalPayload.to, proposalPayload.description],
            abi: buildingGovernanceAbi,
            contractId: ContractId.fromEvmAddress(0, 0, buildingGovernanceAddress),
         }),
      )) as { transaction_id: string };

      return tx?.transaction_id;
   };

   const createTextProposal = async (proposalPayload: CreateProposalPayload): Promise<string> => {
      if (!buildingGovernanceAddress) {
         return Promise.reject("No governance deployed for a building");
      }

      const tx = (await executeTransaction(() =>
         writeContract({
            functionName: "createTextProposal",
            args: [0, proposalPayload.description],
            abi: buildingGovernanceAbi,
            contractId: ContractId.fromEvmAddress(0, 0, buildingGovernanceAddress),
         }),
      )) as { transaction_id: string };

      return tx?.transaction_id;
   };

   const createChangeReserveProposal = async (
      proposalPayload: CreateProposalPayload,
   ): Promise<string | undefined> => {
      if (!buildingGovernanceAddress) {
         return Promise.reject("No governance deployed for a building");
      }

      const tx = (await executeTransaction(() =>
         writeContract({
            functionName: "createChangeReserveProposal",
            args: [proposalPayload.amount, proposalPayload.description],
            abi: buildingGovernanceAbi,
            contractId: ContractId.fromEvmAddress(0, 0, buildingGovernanceAddress),
         }),
      )) as { transaction_id: string };

      return tx?.transaction_id;
   };

   const createProposal = async (
      proposalPayload: CreateProposalPayload & { title?: string },
   ): Promise<string | undefined> => {
      // Combine title and description into JSON if title exists
      const processedPayload: CreateProposalPayload = {
         ...proposalPayload,
         description: proposalPayload.title
            ? JSON.stringify({
                 title: proposalPayload.title,
                 description: proposalPayload.description,
              })
            : proposalPayload.description,
      };

      if (proposalPayload.type === ProposalType.PaymentProposal) {
         return await createPaymentProposal(processedPayload);
      } else if (proposalPayload.type === ProposalType.TextProposal) {
         return await createTextProposal(processedPayload);
      } else if (proposalPayload.type === ProposalType.ChangeReserveProposal) {
         return await createChangeReserveProposal(processedPayload);
      }
   };

   const delegateTokens = async () => {
      if (!buildingToken || !evmAddress) {
         throw new Error("Missing building token or user address");
      }

      const { data: delegateTx, error: delegateTxError } = await tryCatch(
         writeContract({
            contractId: ContractId.fromEvmAddress(0, 0, buildingToken as string),
            abi: tokenVotesAbi,
            functionName: "delegate",
            args: [evmAddress],
         }),
      );

      if (delegateTx) {
         return { data: delegateTx };
      } else {
         return { error: delegateTxError };
      }
   };

   const voteProposal = async (proposalId: number, choice: 1 | 0): Promise<string | undefined> => {
      if (!buildingGovernanceAddress) {
         return Promise.reject("No governance deployed for a building");
      }
      const tx = (await executeTransaction(() =>
         writeContract({
            functionName: "castVote",
            args: [proposalId, choice],
            abi: buildingGovernanceAbi,
            contractId: ContractId.fromEvmAddress(0, 0, buildingGovernanceAddress),
         }),
      )) as { transaction_id: string };

      return tx?.transaction_id;
   };

   const watchDelegateChanges = () => {
      return watchContractEvent({
         address: buildingToken as `0x${string}`,
         abi: tokenVotesAbi,
         eventName: "DelegateChanged",
         onLogs: (delegateChangedData) => {
            delegateChangedData.forEach((log) => {
               const args = (log as unknown as { args: any[] }).args;
               const delegator = args[0];
               const fromDelegate = args[1];
               const toDelegate = args[2];

               if (delegator === evmAddress && toDelegate === evmAddress) {
                  setIsDelegated(true);
               } else if (delegator === evmAddress && toDelegate !== evmAddress) {
                  setIsDelegated(false);
               }
            });
         },
      });
   };

   const watchCreatedProposals = () => {
      return watchContractEvent({
         address: buildingGovernanceAddress as `0x${string}`,
         abi: buildingGovernanceAbi,
         eventName: "ProposalCreated",
         onLogs: (proposalCreatedData) => {
            setGovernanceCreatedProposals((prev) => [
               ...prev,
               ...proposalCreatedData
                  .filter(
                     (log) =>
                        !prev.find(
                           (proposal) =>
                              proposal.id === (log as unknown as { args: any[] }).args[0],
                        ),
                  )
                  .map((log) => {
                     const rawDescription = (log as unknown as { args: any[] }).args[8];
                     let title = "";
                     let description = rawDescription;

                     // Try to parse as JSON to extract title and description
                     try {
                        const parsed = JSON.parse(rawDescription);
                        if (parsed.title && parsed.description) {
                           title = parsed.title;
                           description = parsed.description;
                        }
                     } catch {
                        // If parsing fails, use the raw description as is
                        description = rawDescription;
                     }

                     return {
                        id: (log as unknown as { args: any[] }).args[0],
                        title,
                        description,
                        started: Number((log as unknown as { args: any[] }).args[6].toString()),
                        expiry: Number((log as unknown as { args: any[] }).args[7].toString()),
                        to: undefined,
                        amount: undefined,
                        propType: undefined,
                     };
                  }),
            ]);
         },
      });
   };

   const watchDefinedProposals = () => {
      return watchContractEvent({
         address: buildingGovernanceAddress as `0x${string}`,
         abi: buildingGovernanceAbi,
         eventName: "ProposalDefined",
         onLogs: (proposalDefinedData) => {
            setGovernanceDefinedProposals((prev) => [
               ...prev,
               ...proposalDefinedData
                  .filter(
                     (log) =>
                        !prev.find(
                           (proposal) =>
                              proposal.id === (log as unknown as { args: any[] }).args[0],
                        ),
                  )
                  .map((log) => ({
                     amount: Number((log as unknown as { args: any[] }).args[4].toString()),
                     to: (log as unknown as { args: any[] }).args[3],
                     propType: (
                        log as unknown as { args: any[] }
                     ).args[1].toString() as ProposalType,
                     id: (log as unknown as { args: any[] }).args[0],
                  })),
            ]);
         },
      });
   };

   const watchVoteCast = () => {
      return watchContractEvent({
         address: buildingGovernanceAddress as `0x${string}`,
         abi: buildingGovernanceAbi,
         eventName: "VoteCast",
         onLogs: (voteCastData) => {
            queryClient.invalidateQueries({
               queryKey: ["proposalVotes", proposalIds],
            });
         },
      });
   };

   useEffect(() => {
      if (!!buildingGovernanceAddress && !!buildingToken) {
         const unwatch_1 = watchCreatedProposals();
         const unwatch_2 = watchDefinedProposals();
         const unwatch_3 = watchDelegateChanges();
         const unwatch_4 = watchVoteCast();

         return () => {
            unwatch_1();
            unwatch_2();
            unwatch_3();
            unwatch_4();
         };
      }
   }, [buildingGovernanceAddress, buildingToken, evmAddress]);

   // Memoize proposal IDs to prevent query key recreation
   const proposalIds = useMemo(
      () => governanceCreatedProposals.map((proposal) => proposal.id?.toString()),
      [governanceCreatedProposals],
   );

   const { data: proposalDeadlines } = useQuery({
      queryKey: ["proposalDeadlines", proposalIds],
      queryFn: async () => {
         const proposalDeadlinesData = await Promise.allSettled(
            governanceCreatedProposals.map((proposal) =>
               readContract({
                  abi: buildingGovernanceAbi,
                  address: buildingGovernanceAddress,
                  functionName: "proposalDeadline",
                  args: [proposal.id],
               }),
            ),
         );

         const proposalDeadlines: ProposalDeadlines = {};

         proposalDeadlinesData.forEach((deadline, stateId) => {
            proposalDeadlines[governanceCreatedProposals[stateId].id] = new Date(
               Number((deadline as any).value[0].toString()) * 1000,
            ).toISOString();
         });

         return proposalDeadlines;
      },
      enabled: governanceCreatedProposals?.length > 0,
      initialData: {},
      refetchInterval: 10000,
   });

   const { data: proposalStates } = useQuery({
      queryKey: ["proposalStates", proposalIds],
      queryFn: async () => {
         const proposalStatesData = await Promise.allSettled(
            governanceCreatedProposals.map((proposal) =>
               readContract({
                  abi: buildingGovernanceAbi,
                  address: buildingGovernanceAddress,
                  functionName: "state",
                  args: [proposal.id],
               }),
            ),
         );

         const proposalStates: ProposalStates = {};

         proposalStatesData.forEach((state, stateId) => {
            proposalStates[governanceCreatedProposals[stateId].id] = (
               state as any
            ).value[0].toString();
         });

         return proposalStates;
      },
      enabled: governanceCreatedProposals?.length > 0,
      initialData: {},
      refetchInterval: 10000,
   });

   const { data: proposalVotes } = useQuery({
      queryKey: ["proposalVotes", proposalIds],
      queryFn: async () => {
         const proposalVotesResponse = await Promise.allSettled(
            governanceCreatedProposals.map((proposal) =>
               readContract({
                  abi: buildingGovernanceAbi,
                  address: buildingGovernanceAddress,
                  functionName: "proposalVotes",
                  args: [proposal.id],
               }),
            ),
         );

         const proposalVotes: ProposalVotes = {};

         proposalVotesResponse.forEach((vote, voteId) => {
            proposalVotes[governanceCreatedProposals[voteId].id] = {
               no: Number(formatUnits((vote as any).value[0], 18)),
               yes: Number(formatUnits((vote as any).value[1], 18)),
            };
         });

         return proposalVotes;
      },
      enabled: governanceCreatedProposals?.length > 0,
      initialData: {},
      refetchInterval: 10000,
   });

   return {
      createProposal,
      voteProposal,
      execProposal,
      delegateTokens,
      proposalDeadlines,
      proposalStates,
      proposalVotes,
      governanceCreatedProposals,
      governanceDefinedProposals,
      isDelegated,
   };
};
