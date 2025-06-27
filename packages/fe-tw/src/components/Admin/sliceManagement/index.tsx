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
import { AddSliceForm } from "@/components/Admin/sliceManagement/AddSliceForm";
import { AddSliceAllocationForm } from "@/components/Admin/sliceManagement/AddSliceAllocationForm";
import { INITIAL_VALUES, STEPS, FRIENDLY_STEP_NAME, FRIENDLY_STEP_STATUS, validationSchema } from "@/components/Admin/sliceManagement/constants";
import { TxResultToastView } from "@/components/CommonViews/TxResultView";
import { useEvmAddress } from "@buidlerlabs/hashgraph-react-wallets";
import { useBuildings } from "@/hooks/useBuildings";
import { getTokenBalanceOf } from "@/services/erc20Service";
import { StepsStatus } from "../buildingManagement/types";

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
    const [lastSliceDeployed, setLastSliceDeployed] = useState<`0x${string}`>();
    const { buildingsInfo } = useBuildings();
    const { createSlice, waitForLastSliceDeployed, ipfsHashUploadingInProgress, addAllocationsToSliceMutation } = useCreateSlice();
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
            setAssetsOptions(buildingsInfo?.filter((b) => balancesToTokens.find((b2) => b2.building === b.buildingAddress)?.balance > 0));
        }
    };

    const handleSubmit = async (values: CreateSliceRequestData, e: { resetForm: () => void }) => {
        setIsTransactionInProgress(true);
        e.resetForm();
        setCurrentSetupStep(1);

        try {
            const deployResult = await tryCatch(createSlice(values));
            const lastDeployedSliceResult = await tryCatch(waitForLastSliceDeployed());

            if (deployResult.data) {
                toast.success(
                    <TxResultToastView
                       title={`Slice ${values.slice.name} deployed`}
                       txSuccess={deployResult.data}
                    />,
                    { duration: Infinity, closeButton: true },
                );
                
                if (lastDeployedSliceResult.data) {
                    setLastSliceDeployed(lastDeployedSliceResult.data);
                }

                if (lastDeployedSliceResult.data && values.sliceAllocation?.tokenAssets?.length > 0) {
                    const { data } = await tryCatch(addAllocationsToSliceMutation.mutateAsync({
                        deployedSliceAddress: lastDeployedSliceResult.data,
                        ...values,
                    }));
                    
                    if (data?.every((tx) => !!tx)) {
                        toast.success(
                            <TxResultToastView
                                title={`Allocation added to ${values.slice?.name} slice`}
                                txSuccess={{
                                    transaction_id: (data as unknown as string[])[0],
                                }}
                            />,
                            { duration: Infinity, closeButton: true },
                        );
                    } else {
                        toast.error(
                            <TxResultToastView
                                title="Error during adding allocation"
                                txError
                            />,
                            { duration: Infinity, closeButton: true },
                        );
                    }
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
        } catch (err) {
            toast.error(
                <TxResultToastView
                    title={`Error during slice deployment ${(err as { message: string }).message}`}
                    txError
                />,
                { duration: Infinity, closeButton: true },
            );
        } finally {
            setIsTransactionInProgress(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Slice Management</h1>
            <p className="mb-4">
                Create and manage slice, include deployment of new slice.
            </p>

            <Dialog open={!!lastSliceDeployed} onOpenChange={() => {
                setLastSliceDeployed(undefined);
            }}>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>
                            Slice Successfully Deployed
                        </DialogTitle>
                    </DialogHeader>
            
                    <DialogDescription className="flex flex-col text-xl items-center gap-4 p-10">
                        <a
                            className="text-blue-500"
                            href={`/slices/${lastSliceDeployed}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >View recently created slice</a>
                    </DialogDescription>
                </DialogContent>
            </Dialog>

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
                                <AddSliceAllocationForm assetOptions={assetsOptions} formik={{
                                    values: values.sliceAllocation,
                                    errors,
                                    setFieldValue,
                                } as any} useOnCreateSlice />
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
                                <Button type="submit" onClick={submitForm} disabled={!isValid}>
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
                            {ipfsHashUploadingInProgress ? 'Hash deployment in progress...' : 'Slice deployment in progress...'}
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