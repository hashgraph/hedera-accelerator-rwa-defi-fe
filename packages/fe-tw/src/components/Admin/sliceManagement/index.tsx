"use client";

import { Formik } from "formik";
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
import { StepsStatus } from "../buildingManagement/types";
import { AddSliceForm } from "@/components/Admin/sliceManagement/AddSliceForm";
import { AddSliceAllocationForm } from "@/components/Admin/sliceManagement/AddSliceAllocationForm";
import { INITIAL_VALUES, STEPS, FRIENDLY_STEP_NAME, FRIENDLY_STEP_STATUS, VALIDATION_SCHEMA } from "@/components/Admin/sliceManagement/constants";
import { TxResultToastView } from "@/components/CommonViews/TxResultView";
import { useEvmAddress } from "@buidlerlabs/hashgraph-react-wallets";
import { useBuildings } from "@/hooks/useBuildings";
import { getTokenBalanceOf } from "@/services/erc20Service";

const getCurrentStepState = (
    isSelected: boolean,
    errors: any,
    touched: any,
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
    const [assetsOptions, setAssetsOptions] = useState<any>();
    const { buildingsInfo } = useBuildings();
    const { createSlice, waitForLastSliceDeployed, addTokenAssetsToSliceMutation } = useCreateSlice();
    const { data: evmAddress } = useEvmAddress();

    useEffect(() => {
        setAssetOptionsAsync();
    }, [buildingsInfo, evmAddress]);
    
    const setAssetOptionsAsync = async () => {
        const tokens = buildingsInfo?.map((building) => building.tokenAddress);
       
        if (tokens && evmAddress) {
            const balances = await Promise.all(tokens.map((tok) => getTokenBalanceOf(tok, evmAddress)));
            const balancesToTokens = balances.map((balance, index) => ({
                balance,
                building: buildingsInfo?.[index].buildingAddress,
            }));
          
            if (buildingsInfo) {
                setAssetsOptions(buildingsInfo?.filter((b) => balancesToTokens.find((b2) => b2.building === b.buildingAddress)?.balance > 0));
            }
        }
    };

    const handleSubmit = async (values: CreateSliceRequestData, e: { resetForm: () => void }) => {
        setIsTransactionInProgress(true);
        e.resetForm();
        setCurrentSetupStep(1);

        try {
            const results = await Promise.all([
                tryCatch(createSlice(values)),
                tryCatch(waitForLastSliceDeployed())
            ]);

            if (results[0].data) {
                toast.success(
                    <TxResultToastView
                       title={`Slice ${values.slice.name} deployed`}
                       txSuccess={results[0].data}
                    />,
                    {
                       duration: 5000,
                    },
                );
    
                if (results[1].data && values.sliceAllocation?.tokenAssets?.length > 0) {
                    const { data, error } = await tryCatch(addTokenAssetsToSliceMutation.mutateAsync({
                        deployedSliceAddress: results[1].data,
                        ...values,
                    }));
                    
                    if (data) {
                        toast.success(
                            <TxResultToastView
                                title={`Slice ${values.slice.name} successfully rebalanced`}
                                txSuccess={{
                                    transaction_id: (data as unknown as string[])[0],
                                }}
                            />,
                            {
                               duration: 5000,
                            },
                        );
                    } else {
                        toast.error(
                            <TxResultToastView
                                title={`Error during slice rebalance ${(error as { message: string }).message}`}
                                txError={(error as { message: string }).message}
                            />,
                            { duration: Infinity, closeButton: true },
                        );
                    }
                }
            } else {
                toast.error(
                    <TxResultToastView
                        title={`Error during slice deployment ${results[0].error?.message}`}
                        txError={results[0].error?.message}
                    />,
                    { duration: Infinity, closeButton: true },
                );
            }
        } catch (err) {
            toast.error(
                <TxResultToastView
                    title={`Error during slice deployment ${(err as { message: string }).message}`}
                    txError={(err as { message: string }).message}
                />,
                { duration: Infinity, closeButton: true },
            );
        } finally {
            setIsTransactionInProgress(false);
        }
    };

    const handleValidation = (values: any) => {
        let errors: any = {};

        if (values.sliceAllocation?.tokenAssets?.length === 5) {
            errors.sliceAllocation = {
                tokenAssets: 'Max amount of assets is 5',
            };
        }

        return errors;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Slice Management</h1>
            <p className="mb-4">
                Create and manage slice, include deployment of new slice.
            </p>

            {isTransactionInProgress ? (
                <LoadingView isLoading />
            ) : (
                <Formik
                    initialValues={INITIAL_VALUES}
                    validationSchema={VALIDATION_SCHEMA}
                    onSubmit={handleSubmit}
                    validate={handleValidation}
                    validateOnChange
                >
                {({ errors, touched, isSubmitting, submitForm }) => (
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
                                                {FRIENDLY_STEP_NAME[step as 'slice']}
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
                            {currentSetupStep === 1 && (
                                <AddSliceForm />
                            )}
                            {currentSetupStep === 2 && (
                                <AddSliceAllocationForm assetOptions={assetsOptions} />
                            )}
                        </div>

                        <div className="flex justify-end mt-10">
                            {currentSetupStep === 1 ? (
                                <Button
                                    size="lg"
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCurrentSetupStep((step) => step + 1)}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button type="submit" onClick={submitForm}>
                                    Deploy Slice
                                </Button>
                            )}
                        </div>
                    </>
                )}
                </Formik>
            )}

            <Dialog open={isTransactionInProgress} onOpenChange={(state) => setIsTransactionInProgress(state)}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>
                            Deployment in progress...
                        </DialogTitle>
                        <DialogDescription className="flex flex-col justify-center text-xl items-center gap-4 p-10">
                            <Loader size={64} className="animate-spin" />
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}