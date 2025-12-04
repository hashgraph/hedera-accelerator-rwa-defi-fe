"use client";

import React from "react";
import { toast } from "sonner";
import { Form, Formik } from "formik";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { FormSelect } from "@/components/ui/formSelect";
import { FormTextarea } from "@/components/ui/formTextarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CreateProposalPayload } from "@/types/erc3643/types";
import { tryCatch } from "@/services/tryCatch";
import { ProposalType } from "@/types/props";
import { TxResultToastView } from "../CommonViews/TxResultView";
import { FormInput } from "@/components/ui/formInput";
import { TransactionExtended } from "@/types/common";
import { validationSchema } from "./constants";
import { map } from "lodash";
import { useBuildingAudit } from "@/hooks/useBuildingAudit";

type Props = {
   buildingAddress: `0x${string}`;
   createProposal: (values: CreateProposalPayload) => Promise<TransactionExtended | undefined>;
   onProposalSuccesseed: () => void;
};

export function CreateProposalForm({
   buildingAddress,
   createProposal,
   onProposalSuccesseed,
}: Props) {
   const { auditors } = useBuildingAudit(buildingAddress);
   const handleSubmit = async (values: CreateProposalPayload & { title: string }) => {
      const { data, error } = await tryCatch<TransactionExtended | undefined, any>(
         createProposal(values),
      );

      if (!!data) {
         toast.success(
            <TxResultToastView title="Proposal submitted successfully!" txSuccess={data} />,
            {
               duration: 5000,
            },
         );
         onProposalSuccesseed();
      } else {
         const errorMessage = error?.message || error?.reason || (typeof error === 'string' ? error : 'Unknown error');
         console.error("Proposal submission error:", error);
         toast.error(`Proposal submission failed: ${errorMessage}`);
      }
   };

   return (
      <Formik
         initialValues={{
            title: "",
            description: "",
            amount: "",
            type: "" as ProposalType,
            to: "",
            auditorWalletAddress: "",
         }}
         validationSchema={validationSchema}
         onSubmit={(values, { setSubmitting }) => {
            setSubmitting(false);
            handleSubmit(values);
         }}
      >
         {({
            getFieldProps,
            setFieldValue,
            handleSubmit,
            isSubmitting,
            values,
            errors,
            touched,
         }) => (
            <Form onSubmit={handleSubmit} className="p-2 mt-4 space-y-4">
               <div>
                  <FormInput
                     required
                     label="Proposal Title"
                     placeholder="Enter proposal title"
                     error={touched.title && errors.title ? errors.title : undefined}
                     tooltipContent="Enter a clear and concise title that summarizes what this proposal is about. This will be visible to all voters."
                     {...getFieldProps("title")}
                  />
               </div>

               <div>
                  <FormTextarea
                     required
                     label="Proposal Description"
                     placeholder="Provide a detailed description of your proposal..."
                     error={
                        touched.description && errors.description ? errors.description : undefined
                     }
                     tooltipContent="Provide a comprehensive description explaining the purpose, benefits, and any relevant details of your proposal. This helps voters make informed decisions."
                     {...getFieldProps("description")}
                  />
               </div>

               {values.type === ProposalType.AddAuditorProposal && (
                  <FormInput
                     required
                     label="Auditor Wallet Address"
                     placeholder="e.g. 0x123"
                     type="text"
                     error={
                        touched.auditorWalletAddress && errors.auditorWalletAddress
                           ? errors.auditorWalletAddress
                           : undefined
                     }
                     tooltipContent="Enter the wallet address of the auditor you want to add to this building. Auditors help verify compliance and building operations."
                     {...getFieldProps("auditorWalletAddress")}
                  />
               )}

               {values.type === ProposalType.RemoveAuditorProposal && (
                  <FormSelect
                     name="auditorWalletAddress"
                     label="Auditor Wallet Address"
                     required={true}
                     placeholder="Select Auditor Address"
                     onValueChange={(value) => {
                        setFieldValue("auditorWalletAddress", value);
                     }}
                     error={
                        errors.auditorWalletAddress && touched.auditorWalletAddress
                           ? errors.auditorWalletAddress
                           : undefined
                     }
                     tooltipContent="Select the auditor you want to remove from this building. Only existing auditors are shown in this list."
                  >
                     {map(auditors, (auditor) => (
                        <SelectItem key={auditor} value={auditor}>
                           {auditor}
                        </SelectItem>
                     ))}
                  </FormSelect>
               )}

               {values.type === ProposalType.PaymentProposal && (
                  <FormInput
                     required
                     label="Proposal To"
                     placeholder="e.g. 0x123"
                     type="text"
                     error={errors.to && touched.to ? errors.to : undefined}
                     tooltipContent="Enter the wallet address of the recipient who will receive the payment if this proposal is approved."
                     {...getFieldProps("to")}
                  />
               )}

               {(values.type === ProposalType.PaymentProposal ||
                  values.type === ProposalType.ChangeReserveProposal) && (
                  <FormInput
                     required
                     label="Proposal Amount"
                     placeholder="e.g. 10"
                     type="number"
                     error={errors.amount && touched.amount ? errors.amount : undefined}
                     tooltipContent={
                        values.type === ProposalType.PaymentProposal
                           ? "Enter the amount to be paid to the recipient if this proposal is approved."
                           : "Enter the new reserve amount for the building. This affects the financial reserves maintained by the building."
                     }
                     {...getFieldProps("amount")}
                  />
               )}

               <FormSelect
                  name="propType"
                  label="Proposal Type"
                  placeholder="Select Proposal Type"
                  onValueChange={(value) => {
                     setFieldValue("type", value);
                  }}
                  error={errors.type && touched.type ? errors.type : undefined}
                  tooltipContent="Choose the type of proposal you want to create. Each type serves different purposes: Text for general discussions, Payment for fund transfers, Auditor management for adding/removing auditors, and Reserve changes for adjusting building finances."
               >
                  <SelectItem value={ProposalType.TextProposal}>Text Proposal</SelectItem>
                  <SelectItem value={ProposalType.PaymentProposal}>Payment Proposal</SelectItem>
                  <SelectItem value={ProposalType.AddAuditorProposal}>
                     Add Auditor Proposal
                  </SelectItem>
                  {auditors?.length !== 0 && (
                     <SelectItem value={ProposalType.RemoveAuditorProposal}>
                        Remove Auditor Proposal
                     </SelectItem>
                  )}
                  <SelectItem value={ProposalType.ChangeReserveProposal}>
                     Change Reserve Proposal
                  </SelectItem>
               </FormSelect>

               <Button className="mt-6" isLoading={isSubmitting} type="submit">
                  Submit
               </Button>
            </Form>
         )}
      </Formik>
   );
}
