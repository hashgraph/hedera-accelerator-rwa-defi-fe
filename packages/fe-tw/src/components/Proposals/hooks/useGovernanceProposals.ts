import { buildingGovernanceAbi } from "@/services/contracts/abi/buildingGovernanceAbi";
import { CreateProposalPayload } from "@/types/erc3643/types";
import {
   Proposal,
   ProposalDeadlines,
   ProposalStates,
   ProposalType,
   ProposalVotes,
} from "@/types/props";
import { formatUnits } from "viem";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { readContract } from "@/services/contracts/readContract";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import { useState, useEffect, useMemo } from "react";
import { tokenVotesAbi } from "@/services/contracts/abi/tokenVotesAbi";
import { executeTransaction } from "@/hooks/useExecuteTransaction";
import useWriteContract from "@/hooks/useWriteContract";
import { TransactionExtended } from "@/types/common";
import { useAccount } from "wagmi";

export const useGovernanceProposals = (
   buildingGovernanceAddress?: `0x${string}`,
   buildingToken?: `0x${string}`,
) => {
   const { writeContract } = useWriteContract();
   const { address: evmAddress } = useAccount();
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

      let functionName: string;

      switch (proposalType) {
         case ProposalType.ChangeReserveProposal:
            functionName = "executeChangeReserveProposal";
            break;
         case ProposalType.PaymentProposal:
            functionName = "executePaymentProposal";
            break;
         case ProposalType.AddAuditorProposal:
            functionName = "executeAddAuditorProposal";
            break;
         case ProposalType.RemoveAuditorProposal:
            functionName = "executeRemoveAuditorProposal";
            break;
         case ProposalType.TextProposal:
         default:
            functionName = "executeTextProposal";
            break;
      }

      const tx = await executeTransaction(() =>
         writeContract({
            functionName,
            args: [proposalId],
            abi: buildingGovernanceAbi,
            address: buildingGovernanceAddress,
         }),
      );

      return tx?.transaction_id;
   };

   const createPaymentProposal = async (
      proposalPayload: CreateProposalPayload,
   ): Promise<TransactionExtended> => {
      if (!buildingGovernanceAddress) {
         return Promise.reject("No governance deployed for a building");
      }

      const tx = await executeTransaction(() =>
         writeContract({
            functionName: "createPaymentProposal",
            args: [proposalPayload.amount, proposalPayload.to, proposalPayload.description],
            abi: buildingGovernanceAbi,
            address: buildingGovernanceAddress,
         }),
      );

      return tx;
   };

   const createTextProposal = async (
      proposalPayload: CreateProposalPayload,
   ): Promise<TransactionExtended> => {
      if (!buildingGovernanceAddress) {
         return Promise.reject("No governance deployed for a building");
      }

      const tx = await executeTransaction(() =>
         writeContract({
            functionName: "createTextProposal",
            args: [0, proposalPayload.description],
            abi: buildingGovernanceAbi,
            address: buildingGovernanceAddress,
         }),
      );

      return tx;
   };

   const createChangeReserveProposal = async (
      proposalPayload: CreateProposalPayload,
   ): Promise<TransactionExtended> => {
      if (!buildingGovernanceAddress) {
         return Promise.reject("No governance deployed for a building");
      }

      const tx = await executeTransaction(() =>
         writeContract({
            functionName: "createChangeReserveProposal",
            args: [proposalPayload.amount, proposalPayload.description],
            abi: buildingGovernanceAbi,
            address: buildingGovernanceAddress,
         }),
      );

      return tx;
   };

   const createAddAuditorProposal = async (
      proposalPayload: CreateProposalPayload,
   ): Promise<TransactionExtended> => {
      if (!buildingGovernanceAddress) {
         return Promise.reject("No governance deployed for a building");
      }

      const tx = await executeTransaction(() =>
         writeContract({
            functionName: "createAddAuditorProposal",
            abi: buildingGovernanceAbi,
            address: buildingGovernanceAddress,
            args: [proposalPayload.auditorWalletAddress, proposalPayload.description],
         }),
      );

      return tx;
   };

   const createRemoveAuditorProposal = async (
      proposalPayload: CreateProposalPayload,
   ): Promise<TransactionExtended> => {
      if (!buildingGovernanceAddress) {
         return Promise.reject("No governance deployed for a building");
      }

      const tx = await executeTransaction(() =>
         writeContract({
            functionName: "createRemoveAuditorProposal",
            args: [proposalPayload.auditorWalletAddress, proposalPayload.description],
            abi: buildingGovernanceAbi,
            address: buildingGovernanceAddress,
         }),
      );

      return tx;
   };

   const createProposal = async (
      proposalPayload: CreateProposalPayload & { title?: string },
   ): Promise<TransactionExtended | undefined> => {
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

      switch (proposalPayload.type) {
         case ProposalType.PaymentProposal:
            return await createPaymentProposal(processedPayload);
         case ProposalType.TextProposal:
            return await createTextProposal(processedPayload);
         case ProposalType.ChangeReserveProposal:
            return await createChangeReserveProposal(processedPayload);
         case ProposalType.AddAuditorProposal:
            return await createAddAuditorProposal(processedPayload);
         case ProposalType.RemoveAuditorProposal:
            return await createRemoveAuditorProposal(processedPayload);
         default:
            throw new Error(`Unknown proposal type: ${proposalPayload.type}`);
      }
   };

   const delegateTokens = async () => {
      if (!buildingToken || !evmAddress) {
         throw new Error("Missing building token or user address");
      }

      const tx = await executeTransaction(() =>
         writeContract({
            address: buildingToken as `0x${string}`,
            abi: tokenVotesAbi,
            functionName: "delegate",
            args: [evmAddress],
         }),
      );

      return { data: tx };
   };

   const voteProposal = async (proposalId: number, choice: 1 | 0): Promise<string | undefined> => {
      if (!buildingGovernanceAddress) {
         return Promise.reject("No governance deployed for a building");
      }
      const tx = await executeTransaction(() =>
         writeContract({
            functionName: "castVote",
            args: [proposalId, choice],
            abi: buildingGovernanceAbi,
            address: buildingGovernanceAddress,
         }),
      );

      return tx?.transactionHash;
   };

   const watchDelegateChanges = () => {
      return watchContractEvent({
         address: buildingToken as `0x${string}`,
         abi: tokenVotesAbi,
         eventName: "DelegateChanged",
         onLogs: (delegateChangedData) => {
            delegateChangedData.forEach((log) => {
               const args = (log as unknown as { args: string[] }).args;
               const delegator = args[0];
               const toDelegate = args[2];

               if (
                  delegator.toLowerCase() === evmAddress?.toLowerCase() &&
                  toDelegate.toLowerCase() === evmAddress?.toLowerCase()
               ) {
                  setIsDelegated(true);
               } else if (
                  delegator.toLowerCase() === evmAddress?.toLowerCase() &&
                  toDelegate.toLowerCase() !== evmAddress?.toLowerCase()
               ) {
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
                           (proposal) => proposal.id === log.args[0], //
                        ),
                  )
                  .map((log) => {
                     const rawDescription = log.args[8];
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
                        id: log.args[0],
                        title,
                        description,
                        started: Number(log.args[6].toString()),
                        expiry: Number(log.args[7].toString()),
                        to: undefined,
                        amount: undefined,
                        propType: undefined,
                        votesYes: 0,
                        votesNo: 0,
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
                  .filter((log) => !prev.find((proposal) => proposal.id === log.args[0]))
                  .map((log) => ({
                     amount: Number(log.args[4].toString()),
                     to: log.args[3],
                     propType: log.args[1].toString() as ProposalType,
                     id: log.args[0],
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

         proposalDeadlinesData
            .filter((promise) => promise.status === "fulfilled")
            .forEach((deadline, stateId) => {
               proposalDeadlines[governanceCreatedProposals[stateId].id] = new Date(
                  Number(deadline.value[0].toString()) * 1000,
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

         proposalStatesData
            .filter((promise) => promise.status === "fulfilled")
            .forEach((state, stateId) => {
               proposalStates[governanceCreatedProposals[stateId].id] = state.value[0].toString();
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

         proposalVotesResponse
            .filter((promise) => promise.status === "fulfilled")
            .forEach((vote, voteId) => {
               proposalVotes[governanceCreatedProposals[voteId].id] = {
                  no: Number(formatUnits(vote.value[0], 18)),
                  yes: Number(formatUnits(vote.value[1], 18)),
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
