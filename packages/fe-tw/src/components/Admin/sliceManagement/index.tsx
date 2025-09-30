"use client";

import { Formik, FormikErrors, FormikTouched } from "formik";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { tryCatch } from "@/services/tryCatch";
import { Button } from "@/components/ui/button";
import {
   Stepper,
   StepperStep,
   StepperStepContent,
   StepperStepStatus,
   StepperStepTitle,
} from "@/components/ui/stepper";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { LoadingView } from "@/components/LoadingView/LoadingView";
import { CreateSliceRequestData, SliceDeploymentStep } from "@/types/erc3643/types";
import { useCreateSlice } from "@/hooks/useCreateSlice";
import { AddSliceForm } from "@/components/Admin/sliceManagement/AddSliceForm";
import { AddSliceAllocationForm } from "@/components/Admin/sliceManagement/AddSliceAllocationForm";
import {
   INITIAL_VALUES,
   STEPS,
   FRIENDLY_STEP_NAME,
   FRIENDLY_STEP_STATUS,
   validationSchema,
} from "@/components/Admin/sliceManagement/constants";
import { TxResultToastView } from "@/components/CommonViews/TxResultView";
import { useEvmAddress } from "@buidlerlabs/hashgraph-react-wallets";
import { useBuildings } from "@/hooks/useBuildings";
import { getTokenBalanceOf } from "@/services/erc20Service";
import { StepsStatus } from "../buildingManagement/types";
import { WalkthroughStep } from "@/components/Walkthrough/WalkthroughStep";
import { useWalkthroughStore } from "@/components/Walkthrough/WalkthroughStore";

const getCurrentStepState = (
   isSelected: boolean,
   errors: FormikErrors<CreateSliceRequestData>,
   touched: FormikTouched<CreateSliceRequestData>,
   isSubmitting: boolean,
   step: SliceDeploymentStep,
): StepsStatus => {
   if (isSelected && !isSubmitting) {
      return StepsStatus.IN_PROGRESS;
   }

   if (!!touched[step]) {
      if (!!errors[step]) {
         return StepsStatus.INVALID;
      }

      return StepsStatus.VALID;
   }

   return StepsStatus.NOT_STARTED;
};

export const SliceManagement = () => {
   const [currentSetupStep, setCurrentSetupStep] = useState(1);
   const [isTransactionInProgress, setIsTransactionInProgress] = useState<boolean>(false);
   const [deploymentStage, setDeploymentStage] = useState<"slice" | "allocation" | null>(null);
   const [assetsOptions, setAssetsOptions] = useState<any>();
   const [lastSliceDeployed, setLastSliceDeployed] = useState<`0x${string}`>();
   const { buildingsInfo } = useBuildings();
   const currentStep = useWalkthroughStore((state) => state.currentStep);
   const currentGuide = useWalkthroughStore((state) => state.currentGuide);
   const setCurrentStep = useWalkthroughStore((state) => state.setCurrentStep);

   const {
      createSlice,
      waitForLastSliceDeployed,
      ipfsHashUploadingInProgress,
      addAllocationsToSliceMutation,
   } = useCreateSlice();
   const { data: evmAddress } = useEvmAddress();

   useEffect(() => {
      setAssetOptionsAsync();
   }, [buildingsInfo, evmAddress]);

   const setAssetOptionsAsync = async () => {
      const tokens = buildingsInfo?.map((building) => building.tokenAddress);

      if (tokens && evmAddress) {
         const balances = await Promise.all(
            tokens.map((tok) => getTokenBalanceOf(tok, evmAddress)),
         );
         const balancesToTokens = balances.map((balance, index) => ({
            balance,
            building: buildingsInfo?.[index].buildingAddress,
         }));
         setAssetsOptions(
            buildingsInfo?.filter(
               (b) =>
                  Number(
                     balancesToTokens.find((b2) => b2.building === b.buildingAddress)?.balance,
                  ) > 0,
            ),
         );
      }
   };

   useEffect(() => {
      return () => {
         if (
            currentGuide === "USER_SLICE_GUIDE" &&
            Number(currentStep) > 3 &&
            Number(currentStep) < 16
         ) {
            setCurrentStep(3);
         }
      };
   }, []);

   const handleSubmit = async (values: CreateSliceRequestData, e: { resetForm: () => void }) => {
      setIsTransactionInProgress(true);
      setDeploymentStage("slice");
      e.resetForm();
      setCurrentSetupStep(1);

      const deployResult = await tryCatch(createSlice(values));
      const lastDeployedSliceResult = await tryCatch(waitForLastSliceDeployed());

      if (deployResult.data && lastDeployedSliceResult.data) {
         // If there are allocations to add, deploy them
         if (values.sliceAllocation?.tokenAssets?.length > 0) {
            setDeploymentStage("allocation");

            const { data, error } = await tryCatch(
               addAllocationsToSliceMutation.mutateAsync({
                  deployedSliceAddress: lastDeployedSliceResult.data,
                  ...values,
               }),
            );

            if (data?.every((tx) => !!tx)) {
               // Success - show the success dialog
               setLastSliceDeployed(lastDeployedSliceResult.data);
            } else {
               // Error during allocation
               toast.error(<TxResultToastView title="Error during adding allocation" txError />, {
                  duration: Infinity,
                  closeButton: true,
               });
            }
         } else {
            // No allocations, just show success dialog
            setLastSliceDeployed(lastDeployedSliceResult.data);
         }
      } else {
         toast.error(
            <TxResultToastView
               title={`Error during slice deployment ${deployResult.error?.message}`}
               txError={deployResult.error?.message}
            />,
            { duration: Infinity, closeButton: true },
         );
      }

      setIsTransactionInProgress(false);
      setDeploymentStage(null);
   };

   return (
      <div>
         <h1 className="text-2xl font-bold mb-4">Slice Management</h1>
         <p className="mb-4">Create and manage slice, include deployment of new slice.</p>

         {isTransactionInProgress ? (
            <LoadingView isLoading />
         ) : (
            <Formik
               initialValues={INITIAL_VALUES}
               validationSchema={validationSchema}
               onSubmit={handleSubmit}
            >
               {({ errors, touched, isSubmitting, isValid, values, setFieldValue, submitForm }) => (
                  <>
                     <Stepper>
                        {STEPS.map((step, stepId) => {
                           const currentState = getCurrentStepState(
                              currentSetupStep === stepId + 1,
                              errors,
                              touched,
                              isSubmitting,
                              step as SliceDeploymentStep,
                           );

                           return (
                              <StepperStep
                                 key={step}
                                 data-state={currentState}
                                 onClick={() => setCurrentSetupStep(stepId + 1)}
                              >
                                 <StepperStepContent>
                                    <StepperStepTitle>
                                       {FRIENDLY_STEP_NAME[step as "slice"]}
                                    </StepperStepTitle>
                                    <StepperStepStatus>
                                       {FRIENDLY_STEP_STATUS[currentState]}
                                    </StepperStepStatus>
                                 </StepperStepContent>
                              </StepperStep>
                           );
                        })}
                     </Stepper>

                     <div className="mt-4">
                        {currentSetupStep === 1 && <AddSliceForm />}
                        {currentSetupStep === 2 && (
                           <AddSliceAllocationForm
                              assetOptions={assetsOptions}
                              formik={{
                                 values: values.sliceAllocation,
                                 errors: errors.sliceAllocation!,
                              }}
                              setFieldValue={(name, value) => setFieldValue(name, value)}
                              useOnCreateSlice
                           />
                        )}
                     </div>

                     <div className="flex justify-end mt-10">
                        {currentSetupStep === 1 ? (
                           <WalkthroughStep
                              guideId={"USER_SLICE_GUIDE"}
                              stepIndex={8}
                              title="Ready to proceed to asset allocation"
                              description="Now that you've configured your slice's basic properties, let's move to the next step where you'll select which buildings to include and set their allocation percentages."
                              side="bottom"
                           >
                              {({ confirmUserPassedStep: confirmSliceInvestStep }) => (
                                 <Button
                                    size="lg"
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                       setCurrentSetupStep((step) => step + 1);
                                       confirmSliceInvestStep();
                                    }}
                                 >
                                    Next
                                 </Button>
                              )}
                           </WalkthroughStep>
                        ) : (
                           <WalkthroughStep
                              guideId={"USER_SLICE_GUIDE"}
                              stepIndex={15}
                              title="Deploy your slice to the blockchain"
                              description="Once you've configured all allocations (they must total exactly 100%), click here to deploy your slice as a smart contract on the Hedera network."
                              side="bottom"
                           >
                              {({ confirmUserPassedStep }) => (
                                 <Button type="submit" onClick={submitForm} disabled={!isValid}>
                                    Deploy Slice
                                 </Button>
                              )}
                           </WalkthroughStep>
                        )}
                     </div>
                  </>
               )}
            </Formik>
         )}

         <Dialog
            open={isTransactionInProgress || !!lastSliceDeployed}
            onOpenChange={(state) => {
               if (!isTransactionInProgress) {
                  setLastSliceDeployed(undefined);
               }
            }}
         >
            <DialogContent onInteractOutside={(e) => e.preventDefault()}>
               <DialogHeader>
                  <DialogTitle>
                     {isTransactionInProgress
                        ? ipfsHashUploadingInProgress
                           ? "Hash deployment in progress..."
                           : deploymentStage === "allocation"
                             ? "Deploying slice allocations..."
                             : "Slice deployment in progress..."
                        : "Slice Successfully Deployed"}
                  </DialogTitle>
               </DialogHeader>

               <DialogDescription className="flex flex-col text-xl items-center gap-4 p-10">
                  {isTransactionInProgress ? (
                     <Loader size={64} className="animate-spin" />
                  ) : (
                     <a
                        className="text-blue-500"
                        href={`/slices/${lastSliceDeployed}`}
                        target="_blank"
                        rel="noopener noreferrer"
                     >
                        View recently created slice
                     </a>
                  )}
               </DialogDescription>
            </DialogContent>
         </Dialog>
      </div>
   );
};
