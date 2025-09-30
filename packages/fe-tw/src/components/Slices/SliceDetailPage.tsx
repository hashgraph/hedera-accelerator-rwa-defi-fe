"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Formik } from "formik";
import { toast } from "sonner";
import { Loader, CheckCircle, Loader2 } from "lucide-react";
import {
   useChain,
   useEvmAddress,
   useReadContract,
   useWallet,
} from "@buidlerlabs/hashgraph-react-wallets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBuildings } from "@/hooks/useBuildings";
import { useSliceData } from "@/hooks/useSliceData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import type {
   AddSliceAllocationRequestBody,
   DepositToSliceRequestData,
   SliceData,
} from "@/types/erc3643/types";
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AddSliceAllocationForm } from "@/components/Admin/sliceManagement/AddSliceAllocationForm";
import { TxResultToastView } from "@/components/CommonViews/TxResultView";
import { useCreateSlice } from "@/hooks/useCreateSlice";
import {
   getTokenBalanceOf,
   getTokenDecimals,
   getTokenName,
   getTokenSymbol,
} from "@/services/erc20Service";
import { tryCatch } from "@/services/tryCatch";
import { sliceRebalanceSchema } from "./helpers";
import { DepositToSliceForm } from "../Admin/sliceManagement/DepositToSliceForm";
import SliceDepositChart from "./SliceDepositChart";
import {
   SLICE_FACTORY_ADDRESS,
   UNISWAP_FACTORY_ADDRESS,
   USDC_ADDRESS,
} from "@/services/contracts/addresses";
import { readBuildingDetails } from "@/services/buildingService";
import { basicVaultAbi } from "@/services/contracts/abi/basicVaultAbi";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { PieChart, TrendingUp, Wallet, Settings, Plus, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AllocationBuildingCard } from "./AllocationBuildingCard";
import { useQueryClient } from "@tanstack/react-query";
import { useUSDCForSlice } from "@/hooks/useUSDCForSlice";
import Image from "next/image";
import { watchContractEvent } from "@/services/contracts/watchContractEvent";
import { sliceAbi } from "@/services/contracts/abi/sliceAbi";
import { ethers } from "ethers";
import { map } from "lodash";
import { Separator } from "../ui/separator";
import { sliceFactoryAbi } from "@/services/contracts/abi/sliceFactoryAbi";

type Props = {
   slice: SliceData;
   isInBuildingContext?: boolean;
   buildingId?: string;
};

export function SliceDetailPage({ slice, buildingId, isInBuildingContext = false }: Props) {
   const queryClient = useQueryClient();
   const wallet = useWallet();
   const { readContract } = useReadContract();
   const { buildingsInfo } = useBuildings();
   const {
      sliceAllocations,
      sliceBuildings,
      sliceBuildingsDetails,
      totalDeposits,
      sliceTokenDeposits,
   } = useSliceData(slice.address, buildingsInfo);

   const { data: evmAddress } = useEvmAddress();
   const { rebalanceSliceMutation, addAllocationsToSliceMutation, depositWithPermits, deposit } =
      useCreateSlice(slice.address);
   const { investUSDCToSlice, currentStep, stepResults, steps, exchangeRates } = useUSDCForSlice(
      slice.address,
      sliceAllocations,
   );
   const [isAllocationOpen, setIsAllocationOpen] = useState(false);
   const [assetsOptions, setAssetsOptions] = useState<any[]>();
   const [sliceDepositValue, setSliceDepositValue] = useState<string>();
   const [depositValueInvalid, setDepositValueInvalid] = useState(false);
   const [useUSDCInvestment, setUseUSDCInvestment] = useState(false);
   const [usdcAmount, setUsdcAmount] = useState<string>("");
   const [showUSDCDialog, setShowUSDCDialog] = useState(false);
   const [isUSDCLoading, setIsUSDCLoading] = useState(false);

   useEffect(() => {
      setAssetOptionsAsync();
   }, [buildingsInfo?.length, evmAddress]);

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

         if (buildingsInfo) {
            setAssetsOptions(
               buildingsInfo?.filter(
                  (b) =>
                     Number(
                        balancesToTokens.find((b2) => b2.building === b.buildingAddress)?.balance,
                     ) > 0,
               ),
            );
         }
      }
   };

   const mappedSliceAllocations = sliceAllocations.map(
      (asset) =>
         assetsOptions?.find((opt) => opt.tokenAddress === asset.buildingToken)?.buildingAddress,
   );

   const allocationsExists = sliceAllocations?.length > 0;

   const onHandleRebalance = async () => {
      const { data } = await tryCatch(
         rebalanceSliceMutation.mutateAsync({
            sliceAllocation: {
               tokenAssets: sliceAllocations.map((alloc) => alloc.buildingToken),
               tokenAssetAmounts: {},
               rewardAmount: "0",
            },
         }),
      );

      if (data) {
         toast.success(
            <TxResultToastView
               title={`Slice ${slice.name} successfully rebalanced`}
               txSuccess={data}
            />,
            { duration: Infinity, closeButton: true },
         );
         setIsAllocationOpen(false);
      } else {
         toast.error(<TxResultToastView title="Error during slice rebalance" txError />, {
            duration: Infinity,
            closeButton: true,
         });
      }
   };

   const onSubmitAllocationsForm = async (values: AddSliceAllocationRequestBody) => {
      const { data } = await tryCatch(
         addAllocationsToSliceMutation.mutateAsync({
            sliceAllocation: values,
         }),
      );

      if (data?.every((tx) => !!tx)) {
         toast.success(
            <TxResultToastView
               title={`Allocation added to ${slice.name} slice`}
               txSuccess={{
                  transaction_id: (data as unknown as string[])[0],
               }}
            />,
            { duration: Infinity, closeButton: true },
         );
      } else {
         toast.error(<TxResultToastView title="Error adding allocations" txError />, {
            duration: Infinity,
            closeButton: true,
         });
      }
   };

   const addMoreAllocationsDisabled = allocationsExists
      ? sliceAllocations.reduce((acc, alloc) => {
           return (acc += alloc.actualAllocation);
        }, 0) === 100
      : false;

   const handleDepositToSliceWithPermit = async (amount: number) => {
      const tokensData = sliceAllocations.map(({ buildingToken, aToken }) => ({
         tokenAddress: buildingToken,
         aToken,
         amount,
      }));

      const { data, error } = await tryCatch(depositWithPermits(tokensData));

      if (data) {
         toast.success(
            <TxResultToastView
               title="Successfully deposited to Slice!"
               txSuccess={data as { transaction_id: string }}
            />,
         );
      } else {
         toast.error(<TxResultToastView title="Deposited to Slice failed!" txError={error?.tx} />);
      }
   };

   const handleUSDCInvestment = async () => {
      if (!usdcAmount || Number(usdcAmount) <= 0) {
         toast.error("Please enter a valid USDC amount");
         return;
      }

      setIsUSDCLoading(true);
      setShowUSDCDialog(true);

      try {
         await investUSDCToSlice(usdcAmount);

         queryClient.invalidateQueries({ queryKey: ["TOKEN_INFO"] });
         toast.success("Successfully invested USDC into slice!", {
            duration: 10000,
            closeButton: true,
         });
         setUsdcAmount("");
      } catch (error) {
         toast.error(`Error investing USDC: ${error?.toString()}`, {
            duration: Infinity,
            closeButton: true,
         });
      } finally {
         setShowUSDCDialog(false);
         setIsUSDCLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
         <div className="max-w-7xl mx-auto p-6 space-y-8">
            <Breadcrumb>
               <BreadcrumbList>
                  <BreadcrumbItem>
                     <BreadcrumbLink href="/explorer">Explorer</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  {isInBuildingContext && buildingId ? (
                     <>
                        <BreadcrumbItem>
                           <BreadcrumbLink href={`/building/${buildingId}`}>
                              Building
                           </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                           <BreadcrumbLink href={`/building/${buildingId}/slices`}>
                              Slices
                           </BreadcrumbLink>
                        </BreadcrumbItem>
                     </>
                  ) : (
                     <BreadcrumbItem>
                        <BreadcrumbLink href="/slices">Slices</BreadcrumbLink>
                     </BreadcrumbItem>
                  )}
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                     <BreadcrumbPage>{slice.name}</BreadcrumbPage>
                  </BreadcrumbItem>
               </BreadcrumbList>
            </Breadcrumb>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
               <div className="absolute inset-0 bg-black/20"></div>
               <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
                  <div className="flex-1 space-y-4">
                     <div className="flex items-center gap-3">
                        <Badge variant="default" color="default">
                           Slice Portfolio
                        </Badge>
                        {allocationsExists && <Badge color="emerald">Active Allocations</Badge>}
                     </div>
                     <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                        {slice.name}
                     </h1>
                     <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
                        {slice.description}
                     </p>

                     {evmAddress && (
                        <div className="flex flex-wrap gap-3 pt-4">
                           {/* <Button onClick={() => setIsAllocationOpen(true)} variant="outline">
                              <Settings className="w-4 h-4 mr-2" />
                              Manage Allocations
                           </Button> */}
                           {allocationsExists && (
                              <Button onClick={onHandleRebalance}>
                                 <TrendingUp className="w-4 h-4 mr-2" />
                                 Rebalance
                              </Button>
                           )}
                        </div>
                     )}
                  </div>

                  <div className="lg:w-80 h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                     <Image
                        src={slice.imageIpfsUrl}
                        alt={slice.name}
                        width={300}
                        height={300}
                        quality={80}
                        className="w-full h-full object-cover"
                     />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 grid-rows-2 lg:grid-cols-2 gap-8">
               {(sliceAllocations?.length > 0 || !!evmAddress) && (
                  <Card className="lg:col-span-1">
                     <CardHeader
                        icon={<PieChart />}
                        title="Portfolio Allocations"
                        description="This is a breakdown of your slice allocations with connected buildings"
                     />
                     <CardContent>
                        <div className="space-y-4">
                           {sliceAllocations?.length === 0 ? (
                              <div className="text-center py-8">
                                 <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                 <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    No allocations yet
                                 </h3>
                                 <p className="text-gray-500 mb-4">
                                    Start by adding your first allocation to this slice
                                 </p>
                                 {!!evmAddress && (
                                    <Button
                                       onClick={() => setIsAllocationOpen(true)}
                                       variant="outline"
                                    >
                                       <Settings className="w-4 h-4 mr-2" />
                                       Add Allocation
                                    </Button>
                                 )}
                              </div>
                           ) : (
                              <div className="flex flex-col gap-1">
                                 {sliceAllocations.map((item, index) => {
                                    const buildingData = sliceBuildingsDetails[index];
                                    return (
                                       <AllocationBuildingCard
                                          key={item.aToken}
                                          allocation={item}
                                          buildingData={buildingData}
                                       />
                                    );
                                 })}
                              </div>
                           )}
                        </div>
                     </CardContent>
                  </Card>
               )}

               {!!evmAddress && (
                  <Card>
                     <CardHeader
                        icon={<Plus />}
                        title="Deposit to Slice"
                        description="Add funds to your slice portfolio"
                     />
                     <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                           <Checkbox
                              id="usdcTrade"
                              checked={useUSDCInvestment}
                              onCheckedChange={(checked) => setUseUSDCInvestment(!!checked)}
                           />
                           <Label htmlFor="usdcTrade">Invest using USDC</Label>
                        </div>

                        {useUSDCInvestment ? (
                           <div className="space-y-4">
                              <div>
                                 <Label htmlFor="usdcAmount">USDC Amount to invest</Label>
                                 <Input
                                    id="usdcAmount"
                                    type="number"
                                    placeholder="e.g. 100"
                                    value={usdcAmount}
                                    onChange={(e) => setUsdcAmount(e.target.value)}
                                    className="mt-1"
                                 />
                              </div>
                              <Button
                                 onClick={handleUSDCInvestment}
                                 disabled={!usdcAmount || Number(usdcAmount) <= 0 || isUSDCLoading}
                                 className="w-full"
                              >
                                 {isUSDCLoading ? (
                                    <>
                                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                       Processing...
                                    </>
                                 ) : (
                                    "Invest USDC to Slice"
                                 )}
                              </Button>
                           </div>
                        ) : (
                           <>
                              <DepositToSliceForm
                                 onChangeValue={(value: string) => {
                                    if (Number(value) < 100) {
                                       setDepositValueInvalid(true);
                                    } else {
                                       setDepositValueInvalid(false);
                                       setSliceDepositValue(value);
                                    }
                                 }}
                                 depositEnabled={
                                    sliceDepositValue !== undefined &&
                                    Number(sliceDepositValue) !== 0 &&
                                    !depositValueInvalid
                                 }
                                 onSubmitDepositValue={() => {
                                    handleDepositToSliceWithPermit(Number(sliceDepositValue));
                                 }}
                              />
                              {depositValueInvalid && (
                                 <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-600 font-medium">
                                       Minimum amount to invest is 100 tokens
                                    </p>
                                 </div>
                              )}
                           </>
                        )}
                     </CardContent>
                  </Card>
               )}

               {(Number(totalDeposits.total) !== 0 || Number(totalDeposits.user) !== 0) && (
                  <Card>
                     <CardHeader icon={<BarChart3 />} title="Portfolio actual allocation" />

                     <CardContent>
                        {map(sliceAllocations, (allocation) => (
                           <div key={allocation.buildingToken} className="mb-2 last:mb-0">
                              <div className="flex justify-between mb-1">
                                 <span className="text-sm font-medium text-gray-700">
                                    {allocation.buildingTokenName}
                                 </span>
                                 <span className="text-sm font-medium text-gray-700">
                                    {Number(allocation.balance).toFixed(2)} tokens
                                 </span>
                              </div>

                              <Separator className="mb-1" />
                           </div>
                        ))}
                     </CardContent>

                     <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                        {(Number(totalDeposits.total) !== 0 ||
                           Number(totalDeposits.user) !== 0) && (
                           <div className="lg:col-span-1">
                              <SliceDepositChart sliceAllocations={sliceAllocations} />
                           </div>
                        )}
                     </div>
                  </Card>
               )}
            </div>

            <Dialog
               open={isAllocationOpen}
               onOpenChange={(isOpened) => {
                  setIsAllocationOpen(isOpened);
               }}
            >
               <DialogContent onInteractOutside={(e) => e.preventDefault()} className="min-w-3xl">
                  <DialogHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg border-b border-indigo-100 p-6 -m-6 mb-6">
                     <h2 className="text-2xl font-bold text-gray-900">Manage Slice Allocations</h2>
                     <p className="text-gray-600 mt-2">
                        Update your portfolio allocations and rebalance
                     </p>
                  </DialogHeader>
                  <Formik
                     initialValues={{
                        tokenAssets: allocationsExists ? mappedSliceAllocations : [undefined],
                        tokenAssetAmounts: allocationsExists
                           ? sliceAllocations.reduce((acc, alloc) => {
                                return {
                                   ...acc,
                                   [assetsOptions?.find(
                                      (opt) => opt.tokenAddress === alloc.buildingToken,
                                   )?.buildingAddress]: alloc.actualAllocation.toString(),
                                };
                             }, {})
                           : {},
                        rewardAmount: "100",
                     }}
                     validationSchema={sliceRebalanceSchema}
                     onSubmit={onSubmitAllocationsForm}
                     validateOnChange={false}
                  >
                     {(props) => (
                        <div className="space-y-6">
                           <AddSliceAllocationForm
                              className="grid-cols-1"
                              assetOptions={assetsOptions!}
                              existsAllocations={mappedSliceAllocations}
                              formik={{
                                 values: props.values,
                                 errors: props.errors,
                              }}
                              setFieldValue={(name, value) => props.setFieldValue(name, value)}
                              addMoreAllocationsDisabled={addMoreAllocationsDisabled}
                           />

                           <Button
                              type="submit"
                              disabled={
                                 props.isSubmitting || !props.isValid || addMoreAllocationsDisabled
                              }
                              onClick={props.submitForm}
                              className="flex-1"
                              isLoading={props.isSubmitting}
                           >
                              <Settings className="w-4 h-4 mr-2" />
                              Update Allocations
                           </Button>
                        </div>
                     )}
                  </Formik>
               </DialogContent>
            </Dialog>

            <Dialog open={showUSDCDialog} onOpenChange={setShowUSDCDialog}>
               <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                     <DialogTitle>Investing USDC to Slice</DialogTitle>
                     <DialogDescription>
                        Please wait while we process your investment...
                     </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                     {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isCurrentStep = currentStep === stepNumber;
                        const isCompleted = stepResults[stepNumber] === true;
                        const isFailed = stepResults[stepNumber] === false;

                        return (
                           <div key={stepNumber} className="flex items-center gap-3">
                              {isCompleted ? (
                                 <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : isFailed ? (
                                 <div className="h-5 w-5 rounded-full bg-red-500" />
                              ) : isCurrentStep ? (
                                 <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                              ) : (
                                 <div className="h-5 w-5 rounded-full bg-gray-300" />
                              )}
                              <span
                                 className={`text-sm ${
                                    isCompleted
                                       ? "text-green-700"
                                       : isFailed
                                         ? "text-red-700"
                                         : isCurrentStep
                                           ? "text-blue-700 font-medium"
                                           : "text-gray-500"
                                 }`}
                              >
                                 {step}
                              </span>
                           </div>
                        );
                     })}
                  </div>
                  {Object.keys(exchangeRates).length > 0 && (
                     <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Token Exchange Information</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                           {Object.entries(exchangeRates).map(([tokenAddress, rate]) => (
                              <div
                                 key={tokenAddress}
                                 className="flex flex-col gap-1 p-2 bg-white rounded border"
                              >
                                 <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-gray-700">
                                       {rate.tokenName} ({rate.tokenSymbol})
                                    </span>
                                    <span className="text-xs text-gray-500">
                                       {rate.tokenDecimals} decimals
                                    </span>
                                 </div>
                                 <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">
                                       USDC: ${rate.usdcAmount.toFixed(2)}
                                    </span>
                                    <span className="text-green-600 font-medium">
                                       → {Number(rate.tokenAmount).toFixed(4)} {rate.tokenSymbol}
                                    </span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </DialogContent>
            </Dialog>
         </div>
      </div>
   );
}
