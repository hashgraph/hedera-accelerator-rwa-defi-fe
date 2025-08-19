"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateProposalForm } from "./CreateProposalForm";
import { ProposalsList } from "./ProposalsList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { ethers } from "ethers";
import { LoadingView } from "../LoadingView/LoadingView";
import { useGovernanceProposals } from "./hooks/useGovernanceProposals";
import { ProposalState } from "@/types/props";
import { useBuildingInfo } from "@/hooks/useBuildingInfo";
import { buildingGovernanceAbi } from "@/services/contracts/abi/buildingGovernanceAbi";
import WhyProposals from "./WhyProposals";

type Props = {
   buildingAddress: `0x${string}`;
};

const activeProposalStatuses = [
   ProposalState.ActiveProposal,
   ProposalState.PendingProposal,
   ProposalState.SucceededProposal,
   ProposalState.QueuedProposal,
];

export function ProposalsView(props: Props) {
   const [showModal, setShowModal] = useState(false);
   const [pageLoading, setPageLoading] = useState(true);
   const { replace } = useRouter();
   const {
      governanceAddress: buildingGovernance,
      tokenAddress: buildingToken,
      isLoading,
   } = useBuildingInfo(props.buildingAddress);

   const {
      createProposal,
      voteProposal,
      execProposal,
      delegateTokens,
      proposalStates,
      proposalVotes,
      governanceDefinedProposals,
      governanceCreatedProposals,
      proposalDeadlines,
      isDelegated,
   } = useGovernanceProposals(buildingGovernance, buildingToken);

   const activeProposals = useMemo(() => {
      return governanceCreatedProposals
         .filter((proposal) => activeProposalStatuses.includes(proposalStates[proposal.id]))
         .map((proposal) => ({
            ...proposal,
            ...(governanceDefinedProposals.find((prop) => prop.id === proposal.id) ?? {}),
         }));
   }, [governanceCreatedProposals, proposalStates, governanceDefinedProposals]);

   const pastProposals = useMemo(() => {
      return governanceCreatedProposals
         .filter((proposal) => !activeProposalStatuses.includes(proposalStates[proposal.id]))
         .map((proposal) => ({
            ...proposal,
            ...(governanceDefinedProposals.find((prop) => prop.id === proposal.id) ?? {}),
         }));
   }, [governanceCreatedProposals, proposalStates, governanceDefinedProposals]);

   const handleDelegate = async () => {
      try {
         const result = await delegateTokens();
         if (result?.data) {
            toast.success("Tokens delegated successfully! You can now vote on future proposals.");
         } else if (result?.error) {
            toast.error(`Failed to delegate tokens: ${result.error.message}`);
         }
      } catch (error) {
         toast.error(`Failed to delegate tokens: ${(error as Error).message}`);
      }
   };

   useEffect(() => {
      if (!isLoading) {
         if (buildingGovernance === ethers.ZeroAddress) {
            toast.warning(
               "Governance needs to be deployed before you can start submitting proposals",
            );
            replace(`/admin/buildingmanagement?governance=true&bAddress=${props.buildingAddress}`);
         } else {
            setPageLoading(false);
         }
      }
   }, [buildingGovernance, isLoading]);

   return pageLoading ? (
      <LoadingView isLoading />
   ) : (
      <div className="p-2">
         <WhyProposals />
         {!isDelegated && (
            <div className="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-lg">
               <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                     <svg
                        className="h-5 w-5 text-indigo-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                     >
                        <path
                           fillRule="evenodd"
                           d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                           clipRule="evenodd"
                        />
                     </svg>
                  </div>
                  <div className="flex-1">
                     <h3 className="text-sm font-medium text-indigo-800">
                        Delegation Required for Voting
                     </h3>
                     <div className="mt-2 text-sm text-indigo-700">
                        <p>
                           To participate in governance voting, you must first delegate your tokens
                           to yourself. This is a one-time setup that enables your voting power.
                        </p>
                        <p className="mt-2 font-medium">
                           Important: After delegating, you'll only be able to vote on future
                           proposals, not on existing ones.
                        </p>
                     </div>
                     <div className="mt-4">
                        <Button
                           onClick={handleDelegate}
                           className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                           Delegate My Tokens
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         <Tabs defaultValue="active" className="mt-4">
            <TabsList>
               <TabsTrigger value="active">Active</TabsTrigger>
               <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
               <div className="flex gap-4"></div>

               <Button type="button" onClick={() => setShowModal(true)} disabled={!isDelegated}>
                  Create New Proposal
               </Button>
            </div>

            <TabsContent value="active">
               <ProposalsList
                  proposalDeadlines={proposalDeadlines}
                  proposals={activeProposals}
                  proposalVotes={proposalVotes}
                  proposalStates={proposalStates}
                  voteProposal={voteProposal}
                  execProposal={execProposal}
                  isDelegated={isDelegated}
               />
            </TabsContent>
            <TabsContent value="past">
               <ProposalsList
                  isPastProposals
                  proposalDeadlines={proposalDeadlines}
                  proposals={pastProposals}
                  proposalVotes={proposalVotes}
                  voteProposal={voteProposal}
                  execProposal={execProposal}
                  proposalStates={proposalStates}
                  isDelegated={isDelegated}
               />
            </TabsContent>
         </Tabs>

         <Dialog open={showModal} onOpenChange={(state) => setShowModal(state)}>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle>Create New Proposal</DialogTitle>
                  <DialogDescription>
                     Fill in the details below to create a new proposal.
                  </DialogDescription>
               </DialogHeader>

               <CreateProposalForm
                  buildingAddress={props.buildingAddress}
                  onProposalSuccesseed={() => {
                     setShowModal(false);
                  }}
                  createProposal={createProposal}
               />
            </DialogContent>
         </Dialog>
      </div>
   );
}
