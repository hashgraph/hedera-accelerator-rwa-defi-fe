"use client";

import { Form, Formik, FormikProps } from "formik";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import { FormSelect } from "@/components/ui/formSelect";
import { pinata } from "@/utils/pinata";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useBuildingAudit } from "@/hooks/useBuildingAudit";
import { tryCatch } from "@/services/tryCatch";
import { TxResultToastView } from "@/components/CommonViews/TxResultView";
import {
   AuditFormValues,
   initialValues,
   validationSchema,
   auditTypeOptions,
   conditionRatingOptions,
   immediateActionOptions,
   getInitialValues,
} from "./helpers";
import { TransactionExtended } from "@/types/common";
import { FormInput } from "@/components/ui/formInput";
import { UploadFileButton } from "@/components/ui/upload-file-button";
import { Separator } from "@/components/ui/separator";
import { find } from "lodash";
import { useAccount } from "wagmi";

interface IProps {
   buildingAddress?: `0x${string}`;
   recordId?: string;
}

export function AuditManagementForm({ buildingAddress, recordId }: IProps) {
   const isEdit = Boolean(buildingAddress) && Boolean(recordId);
   const { address: evmAddress } = useAccount();
   const [selectedBuildingAddress, setSelectedBuildingAddress] = useState(buildingAddress ?? null);
   const [uploadingFile, setUploadingFile] = useState(false);
   const {
      addAuditRecordMutation,
      updateAuditRecordMutation,
      revokeAuditRecord,
      buildingDetailsLoaded,
      auditors,
      auditData,
      auditRecords,
      userRoles,
      userRolesLoading,
   } = useBuildingAudit(selectedBuildingAddress!);

   const auditRecordToEdit = find(auditRecords, { recordId });
   const isUserAuditor = auditors?.includes(evmAddress!);

   const handleFileUpload = async (
      file: File,
      setFieldValue: (field: string, value: any) => void,
   ) => {
      setUploadingFile(true);

      const { data, error } = await tryCatch(
         (async () => {
            const keyRequest = await fetch("/api/pinataKey");
            const keyData = await keyRequest.json();

            const { IpfsHash: fileIpfsHash } = await pinata.upload.file(file).key(keyData.JWT);

            return fileIpfsHash;
         })(),
      );

      if (data) {
         setFieldValue("auditReportIpfsId", data);
         setFieldValue("auditReportFile", file);
         toast.success("Audit report uploaded successfully to IPFS");
      } else {
         toast.error("Error uploading audit report to IPFS");
      }

      setUploadingFile(false);
   };

   const handleSubmit = async (values: AuditFormValues) => {
      const submissionData = {
         ...values,
         submissionDate: new Date().toISOString(),
      };

      const fileName = `audit-${selectedBuildingAddress}-${Date.now()}`;
      const keyRequest = await fetch("/api/pinataKey");
      const keyData = await keyRequest.json();

      const { IpfsHash: newIpfsHash } = await pinata.upload
         .json(submissionData, {
            metadata: { name: fileName },
         })
         .key(keyData.JWT);

      if (!newIpfsHash) {
         toast.error("Error during uploading Audit data to IPFS", {
            duration: Infinity,
            closeButton: true,
         });
      }

      if (isEdit) {
         const { data: updateAuditRecordResult, error } = await tryCatch(
            updateAuditRecordMutation.mutateAsync({
               auditRecordId: BigInt(recordId!),
               newAuditIPFSHash: newIpfsHash,
            }),
         );

         if (updateAuditRecordResult) {
            toast.success(
               <TxResultToastView
                  title="Audit successfully updated"
                  txSuccess={updateAuditRecordResult}
               />,
            );
         } else {
            toast.error(
               <TxResultToastView title="Error during submitting audit" txError={error.tx} />,
               { duration: Infinity, closeButton: true },
            );
         }
      } else {
         const { data: addAuditRecordResult, error } = await tryCatch<TransactionExtended>(
            addAuditRecordMutation.mutateAsync(newIpfsHash),
         );

         if (addAuditRecordResult) {
            toast.success(
               <TxResultToastView
                  title="Audit successfully submitted"
                  txSuccess={addAuditRecordResult}
               />,
            );
         } else {
            toast.error(
               <TxResultToastView title="Error during submitting audit" txError={error.tx} />,
               { duration: Infinity, closeButton: true },
            );
         }
      }
   };

   const handleRemoveAuditRecord = async (id: string) => {
      const { data: revokeAuditRecordResult, error } = await tryCatch(
         revokeAuditRecord.mutateAsync({
            auditRecordId: BigInt(id),
         }),
      );

      if (revokeAuditRecordResult) {
         toast.success(
            <TxResultToastView
               title="Audit successfully revoked"
               txSuccess={revokeAuditRecordResult}
            />,
            { duration: Infinity, closeButton: true },
         );
      } else {
         toast.error(<TxResultToastView title="Error during revoking audit" txError={error.tx} />, {
            duration: Infinity,
            closeButton: true,
         });
      }
   };

   return (
      <div className="flex">
         <Card className="py-0 w-200" variant="indigo">
            <CardHeader
               description={
                  isEdit
                     ? "Update already existed Audit record for a building."
                     : "Create new Audit record for a building."
               }
               title={isEdit ? "Update Audit Record" : "Create new Audit Record"}
            />

            <CardContent>
               <Formik
                  initialValues={
                     auditRecordToEdit ? getInitialValues(auditRecordToEdit) : initialValues
                  }
                  validationSchema={validationSchema}
                  enableReinitialize
                  onSubmit={(values, { setSubmitting }) => {
                     setSubmitting(false);
                     handleSubmit(values);
                  }}
               >
                  {({
                     getFieldProps,
                     handleSubmit,
                     errors,
                     touched,
                     setFieldValue,
                     values,
                     dirty,
                  }) => (
                     <Form onSubmit={handleSubmit} className="flex flex-col p-6">
                        {buildingDetailsLoaded && (
                           <>
                              {!isUserAuditor ? (
                                 <div>
                                    <div className="flex flex-col gap-4">
                                       <div className="text-center py-8">
                                          <p className="text-lg text-gray-600">
                                             You are not eligible to perform an audit.
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                              ) : (
                                 <div className="flex flex-col gap-4">
                                    <div className="space-y-4">
                                       <h3 className="text-lg font-semibold text-indigo-900">
                                          Audit Company Information
                                       </h3>

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <FormInput
                                             label="Company Name"
                                             required
                                             {...getFieldProps("companyName")}
                                             placeholder="Audit company name"
                                             error={
                                                touched?.companyName &&
                                                typeof errors.companyName === "string"
                                                   ? errors.companyName
                                                   : undefined
                                             }
                                          />

                                          <FormInput
                                             label="Auditor Name"
                                             required
                                             {...getFieldProps("auditorName")}
                                             placeholder="Lead auditor name"
                                             error={
                                                touched?.auditorName &&
                                                typeof errors.auditorName === "string"
                                                   ? errors.auditorName
                                                   : undefined
                                             }
                                          />
                                       </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="space-y-4">
                                       <h3 className="text-lg font-semibold text-indigo-900">
                                          Audit Details
                                       </h3>

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <FormInput
                                             label="Audit Date"
                                             required
                                             {...getFieldProps("auditDate")}
                                             type="date"
                                             error={
                                                touched?.auditDate &&
                                                typeof errors.auditDate === "string"
                                                   ? errors.auditDate
                                                   : undefined
                                             }
                                          />

                                          <FormSelect
                                             name="auditType"
                                             label="Audit Type/Purpose"
                                             required={true}
                                             placeholder="Select audit type"
                                             onValueChange={(value) =>
                                                setFieldValue("auditType", value)
                                             }
                                             value={values.auditType}
                                             error={
                                                touched?.auditType &&
                                                typeof errors.auditType === "string"
                                                   ? errors.auditType
                                                   : undefined
                                             }
                                          >
                                             {auditTypeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                   {option.label}
                                                </SelectItem>
                                             ))}
                                          </FormSelect>
                                       </div>

                                       <FormInput
                                          label="Audit Reference/ID Number"
                                          required
                                          {...getFieldProps("auditReferenceId")}
                                          placeholder="e.g. AUD-2024-001"
                                          error={
                                             touched?.auditReferenceId &&
                                             typeof errors.auditReferenceId === "string"
                                                ? errors.auditReferenceId
                                                : undefined
                                          }
                                       />

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <FormInput
                                             label="Audit Validity From"
                                             required
                                             {...getFieldProps("auditValidityFrom")}
                                             type="date"
                                             error={
                                                touched?.auditValidityFrom &&
                                                typeof errors?.auditValidityFrom === "string"
                                                   ? errors.auditValidityFrom
                                                   : undefined
                                             }
                                          />

                                          <FormInput
                                             label="Audit Validity To"
                                             required
                                             {...getFieldProps("auditValidityTo")}
                                             type="date"
                                             error={
                                                touched?.auditValidityTo &&
                                                typeof errors?.auditValidityTo === "string"
                                                   ? errors.auditValidityTo
                                                   : undefined
                                             }
                                          />
                                       </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="space-y-4">
                                       <h3 className="text-lg font-semibold text-indigo-900">
                                          Summary Information
                                       </h3>

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <FormSelect
                                             name="overallConditionRating"
                                             label="Overall Condition Rating"
                                             required={true}
                                             placeholder="Select condition rating"
                                             onValueChange={(value) =>
                                                setFieldValue("overallConditionRating", value)
                                             }
                                             value={values.overallConditionRating}
                                             error={
                                                touched?.overallConditionRating &&
                                                typeof errors.overallConditionRating === "string"
                                                   ? errors.overallConditionRating
                                                   : undefined
                                             }
                                          >
                                             {conditionRatingOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                   {option.label}
                                                </SelectItem>
                                             ))}
                                          </FormSelect>

                                          <FormSelect
                                             name="immediateActionRequired"
                                             label="Immediate Action Required"
                                             required={true}
                                             placeholder="Select yes or no"
                                             onValueChange={(value) =>
                                                setFieldValue("immediateActionRequired", value)
                                             }
                                             value={values.immediateActionRequired}
                                             error={
                                                touched?.immediateActionRequired &&
                                                typeof errors.immediateActionRequired === "string"
                                                   ? errors.immediateActionRequired
                                                   : undefined
                                             }
                                          >
                                             {immediateActionOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                   {option.label}
                                                </SelectItem>
                                             ))}
                                          </FormSelect>
                                       </div>

                                       <FormInput
                                          label="Next Recommended Audit Date"
                                          required
                                          {...getFieldProps("nextRecommendedAuditDate")}
                                          type="date"
                                          error={
                                             touched?.nextRecommendedAuditDate &&
                                             typeof errors.nextRecommendedAuditDate === "string"
                                                ? errors.nextRecommendedAuditDate
                                                : undefined
                                          }
                                       />
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="space-y-4">
                                       <h3 className="text-lg font-semibold text-indigo-900">
                                          Document Upload
                                       </h3>

                                       <div className="w-full">
                                          <div className="flex items-end gap-4 mt-2">
                                             <FormInput
                                                required
                                                label="PDF Audit Report Upload"
                                                {...getFieldProps("auditReportIpfsId")}
                                                placeholder="IPFS hash of audit report"
                                                error={
                                                   touched?.auditReportIpfsId &&
                                                   typeof errors.auditReportIpfsId === "string"
                                                      ? errors.auditReportIpfsId
                                                      : undefined
                                                }
                                             />

                                             <UploadFileButton
                                                isLoading={uploadingFile}
                                                onFileAdded={(file) =>
                                                   handleFileUpload(file, setFieldValue)
                                                }
                                                className="flex-shrink-0"
                                             />
                                          </div>
                                          <p className="text-sm text-gray-500 mt-1">
                                             Upload the complete audit report (PDF format
                                             recommended)
                                          </p>
                                          {touched?.auditReportIpfsId &&
                                             typeof errors.auditReportIpfsId === "string" && (
                                                <div className="text-red-600 text-sm mt-1">
                                                   {errors.auditReportIpfsId}
                                                </div>
                                             )}
                                       </div>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="space-y-4">
                                       <h3 className="text-lg font-semibold text-indigo-900">
                                          Additional Notes
                                       </h3>

                                       <div className="w-full">
                                          <Label htmlFor="notes">Notes (optional)</Label>
                                          <Textarea
                                             rows={4}
                                             className="mt-1"
                                             placeholder="Any additional notes or observations..."
                                             {...getFieldProps("notes")}
                                          />
                                       </div>
                                    </div>

                                    <div className="flex justify-end gap-5 pt-4">
                                       {isEdit && (
                                          <Button
                                             variant="destructive"
                                             onClick={() => handleRemoveAuditRecord(recordId!)}
                                          >
                                             Revoke Record
                                          </Button>
                                       )}
                                       <Button
                                          disabled={isEdit && !dirty}
                                          isLoading={addAuditRecordMutation.isPending}
                                          type="submit"
                                       >
                                          {isEdit ? "Update Audit Record" : "Create Audit Record"}
                                       </Button>
                                    </div>
                                 </div>
                              )}
                           </>
                        )}
                     </Form>
                  )}
               </Formik>
            </CardContent>
         </Card>
      </div>
   );
}
