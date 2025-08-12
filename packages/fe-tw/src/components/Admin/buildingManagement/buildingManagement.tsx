"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { Formik, FormikHelpers } from "formik";
import some from "lodash/some";
import { Button } from "@/components/ui/button";
import {
   ERROR_TO_DESCRIPTION,
   FRIENDLY_STEP_NAME,
   FRIENDLY_STEP_STATUS,
   INITIAL_VALUES,
   MAJOR_STEP_TO_FRIENDLY_NAME,
   MINOR_STEP_TO_FRIENDLY_NAME,
   STEPS,
   stepsKeyTypes,
   VALIDATION_SCHEMA,
} from "./constants";
import { useBuildingOrchestration } from "./hooks";
import {
   Stepper,
   StepperStep,
   StepperStepContent,
   StepperStepStatus,
   StepperStepTitle,
} from "@/components/ui/stepper";
import BuildingInfoForm from "./infoForm";
import TreasuryGovernanceAndVaultForm from "./treasuryGovernanceAndVaultForm";
import TokenForm from "./tokenForm";
import { Check, Loader, TriangleAlert, Wand2 } from "lucide-react";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { tryCatch } from "@/services/tryCatch";
import { BuildingFormProps, Error, StepsStatus } from "./types";
import Link from "next/link";
import { useWalkthrough, WalkthroughStep } from "@/components/Walkthrough";
import { useWalkthroughStore } from "@/components/Walkthrough/WalkthroughStore";
import { BUILDING_MOCKS, makePrefilledFormFromMock } from "./buildings.mocks";

const BuildingManagement = () => {
   const { confirmUserFinishedGuide } = useWalkthrough();
   const currentStep = useWalkthroughStore((state) => state.currentStep);
   const currentGuide = useWalkthroughStore((state) => state.currentGuide);
   const setCurrentStep = useWalkthroughStore((state) => state.setCurrentStep);

   const [isModalOpened, setIsModalOpened] = useState<boolean>();
   const [newBuildingAddress, setNewBuildingAddress] = useState<string | null>();
   const [error, setError] = useState<Error | null>(null);
   const { currentDeploymentStep, submitBuilding } = useBuildingOrchestration();
   const [majorDeploymentStep, minorDeploymentStep] = currentDeploymentStep;
   const [currentSetupStep, setCurrentSetupStep] = useState(1);

   const getCurrentState = (
      isSelected: boolean,
      hasErrors: boolean,
      isDirty: boolean,
      isSubmitting: boolean,
   ) => {
      if (isSelected && !isSubmitting) {
         return StepsStatus.IN_PROGRESS;
      }
      if (isDirty) {
         if (hasErrors) {
            return StepsStatus.INVALID;
         }
         return StepsStatus.VALID;
      }
      return StepsStatus.NOT_STARTED;
   };

   const handleSubmit = async (
      values: BuildingFormProps,
      formikHelpers: FormikHelpers<BuildingFormProps>,
   ) => {
      setIsModalOpened(true);
      const { data: buildingAddress, error } = await tryCatch(submitBuilding(values));

      if (error) {
         setError(error.message as Error);
         return;
      }
      formikHelpers.resetForm();
      setNewBuildingAddress(buildingAddress);
   };

   useEffect(() => {
      return () => {
         if (
            currentGuide === "ADMIN_BUILDING_GUIDE" &&
            Number(currentStep) > 3 &&
            Number(currentStep) < 16
         ) {
            setCurrentStep(3);
         }
      };
   }, []);

   return (
      <div>
         <Formik<BuildingFormProps>
            initialValues={INITIAL_VALUES as BuildingFormProps}
            validationSchema={VALIDATION_SCHEMA}
            onSubmit={handleSubmit}
         >
            {({ errors, touched, isSubmitting, submitForm, values, setValues, setTouched }) => {
               const stepGt6 = Number(currentStep) > 6;

               return (
                  <>
                     <WalkthroughStep
                        guideId="ADMIN_BUILDING_GUIDE"
                        stepIndex={3}
                        title="Welcome to Building Management"
                        description="This is where you tokenize a building. We'll go through the key fields together."
                        side="bottom"
                        showConfirmButton
                     >
                        <div className="flex items-start justify-between gap-4">
                           <div>
                              <h1 className="text-2xl font-bold mb-2">Building Management</h1>
                              <p className="mb-4">
                                 Manage your buildings, including deploying and updating building
                                 metadata.
                              </p>
                           </div>
                           <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                 const idx = Math.floor(Math.random() * BUILDING_MOCKS.length);
                                 const mock = BUILDING_MOCKS[idx];
                                 const prefilled = makePrefilledFormFromMock(mock);
                                 await setValues(prefilled, true);
                                 await setTouched({
                                    info: {
                                       buildingTitle: true,
                                    },
                                    token: {
                                       tokenName: true,
                                    },
                                    treasuryAndGovernance: {
                                       reserve: true,
                                    },
                                 });
                              }}
                              title="Pre-fill the form with an example building"
                           >
                              <Wand2 className="mr-2 h-4 w-4" />
                              Fill with example
                           </Button>
                        </div>
                     </WalkthroughStep>

                     <Stepper>
                        {STEPS.map((step, index) => {
                           const currentState = getCurrentState(
                              currentSetupStep === index + 1,
                              some(errors[step as stepsKeyTypes], (_, value) => !!value),
                              some(touched[step as stepsKeyTypes], (_, value) => !!value),
                              isSubmitting,
                           );
                           return (
                              <StepperStep
                                 key={step}
                                 data-state={currentState}
                                 data-testid={`stepper-step-${step}`}
                                 onClick={() => setCurrentSetupStep(index + 1)}
                              >
                                 <StepperStepContent>
                                    <StepperStepTitle>
                                       {FRIENDLY_STEP_NAME[step as stepsKeyTypes]}
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
                        {currentSetupStep === 1 && <BuildingInfoForm />}
                        {currentSetupStep === 2 && <TokenForm />}
                        {currentSetupStep === 3 && <TreasuryGovernanceAndVaultForm />}
                     </div>

                     <div className="flex justify-end">
                        {currentSetupStep !== 3 ? (
                           <WalkthroughStep
                              guideId="ADMIN_BUILDING_GUIDE"
                              stepIndex={stepGt6 ? 9 : 6}
                              title={
                                 stepGt6
                                    ? "Proceed to Treasury Settings"
                                    : "Proceed to Token Settings"
                              }
                              description={
                                 stepGt6
                                    ? "Click Next to configure treasury settings."
                                    : "Click Next to configure token name, symbol, and decimals."
                              }
                              side="top"
                           >
                              {({ confirmUserPassedStep }) => (
                                 <Button
                                    size="lg"
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                       confirmUserPassedStep();
                                       setCurrentSetupStep((step) => step + 1);
                                    }}
                                 >
                                    Next
                                 </Button>
                              )}
                           </WalkthroughStep>
                        ) : (
                           <WalkthroughStep
                              guideId="ADMIN_BUILDING_GUIDE"
                              stepIndex={15}
                              title="It's time to deploy!"
                              description="When you're ready, click Deploy. We'll handle uploading metadata to IPFS, deploying contracts, and finish setting up the building."
                              side="top"
                           >
                              {({ confirmUserPassedStep }) => (
                                 <Button
                                    type="submit"
                                    onClick={() => {
                                       confirmUserPassedStep();
                                       submitForm();
                                    }}
                                 >
                                    Deploy Building
                                 </Button>
                              )}
                           </WalkthroughStep>
                        )}
                     </div>

                     <Dialog open={isModalOpened} onOpenChange={(state) => setIsModalOpened(state)}>
                        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                           <DialogHeader>
                              <DialogTitle>
                                 {error
                                    ? "Error occurred"
                                    : `${MAJOR_STEP_TO_FRIENDLY_NAME[majorDeploymentStep!]} Deployment`}
                              </DialogTitle>

                              <DialogDescription className="flex flex-col justify-center text-xl items-center gap-4 p-10">
                                 {newBuildingAddress ? (
                                    <Check size={64} className="text-violet-500" />
                                 ) : error ? (
                                    <TriangleAlert size={64} className="text-red-500" />
                                 ) : (
                                    <Loader size={64} className="animate-spin" />
                                 )}
                                 {newBuildingAddress ? (
                                    <>
                                       <span>
                                          Deployment of the building and its parts was successful!
                                          <br />
                                          One step remains to be done - you need to add&nbsp;
                                          <WalkthroughStep
                                             guideId="ADMIN_BUILDING_GUIDE"
                                             stepIndex={16}
                                             title="All is good"
                                             description="Now we will add liquidity to the building. That will allow actually invest in it."
                                             side="bottom"
                                          >
                                             {({ confirmUserPassedStep }) => (
                                                <Link
                                                   className="underline font-semibold"
                                                   href={`/building/${newBuildingAddress}/liquidity`}
                                                   onClick={confirmUserPassedStep}
                                                >
                                                   liquidity
                                                </Link>
                                             )}
                                          </WalkthroughStep>
                                       </span>
                                    </>
                                 ) : error ? (
                                    ERROR_TO_DESCRIPTION[error]
                                 ) : (
                                    MINOR_STEP_TO_FRIENDLY_NAME[(majorDeploymentStep as 100)!][
                                       (minorDeploymentStep as 1 | 2 | 3)!
                                    ]
                                 )}
                              </DialogDescription>
                           </DialogHeader>
                        </DialogContent>
                     </Dialog>
                  </>
               );
            }}
         </Formik>
      </div>
   );
};

export default BuildingManagement;
