"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Formik } from "formik";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import {
   useChain,
   useEvmAddress,
   useReadContract,
   useWallet,
} from "@buidlerlabs/hashgraph-react-wallets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SliceAllocations from "@/components/Slices/SliceAllocations";
import { useBuildings } from "@/hooks/useBuildings";
import { useSliceData } from "@/hooks/useSliceData";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
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
import { getTokenBalanceOf, getTokenDecimals, getTokenName } from "@/services/erc20Service";
import { tryCatch } from "@/services/tryCatch";
import { SliceBuildings } from "./SliceBuildings";
import { sliceRebalanceSchema } from "./helpers";
import { DepositToSliceForm } from "../Admin/sliceManagement/DepositToSliceForm";
import SliceDepositChart from "./SliceDepositChart";
import { cx } from "class-variance-authority";
import { USDC_ADDRESS } from "@/services/contracts/addresses";
import { readBuildingDetails } from "@/services/buildingService";
import { basicVaultAbi } from "@/services/contracts/abi/basicVaultAbi";
import { useTokenInfo } from "@/hooks/useTokenInfo";

type Props = {
   slice: SliceData;
   isInBuildingContext?: boolean;
   buildingId?: string;
};

export function SliceDetailPage({ slice, buildingId, isInBuildingContext = false }: Props) {
   const wallet = useWallet();
   const { readContract } = useReadContract();
   const { buildingsInfo } = useBuildings();
   const { sliceAllocations, sliceBuildings, sliceBuildingsDetails, totalDeposits } = useSliceData(
      slice.address,
      buildingsInfo,
   );

   const data = useTokenInfo(slice.address);

   const { data: evmAddress } = useEvmAddress();
   const { rebalanceSliceMutation, addAllocationsToSliceMutation, depositWithPermits } =
      useCreateSlice(slice.address);
   const [isAllocationOpen, setIsAllocationOpen] = useState(false);
   const [assetsOptions, setAssetsOptions] = useState<any[]>();
   const [sliceDepositValue, setSliceDepositValue] = useState<string>();
   const [depositValueInvalid, setDepositValueInvalid] = useState(false);

   const { data: rewardsAvailableData, isLoading: rewardsAvailableIsLoading } = useQuery({
      queryKey: ["vaultRewardsAvailable"],
      queryFn: async () => {
         const sliceAllocationBuildings = await Promise.all(
            sliceAllocations.map((alloc) =>
               readBuildingDetails(
                  buildingsInfo?.find((b) => b.tokenAddress === alloc.buildingToken)
                     ?.buildingAddress,
               ),
            ),
         );
         const sliceAllocationVaults = sliceAllocationBuildings.map((detailLog) => ({
            address: detailLog[0][0],
            token: detailLog[0][4],
            vault: detailLog[0][7],
            ac: detailLog[0][8],
         }));
         const userVaultRewards = await Promise.all(
            sliceAllocationVaults.map((vault, id) =>
               readContract({
                  address: vault.vault,
                  abi: basicVaultAbi,
                  functionName: "getUserReward",
                  args: [evmAddress, USDC_ADDRESS],
               }),
            ),
         );

         return userVaultRewards;
      },
      enabled: sliceAllocations?.length > 0 && (buildingsInfo?.length || 0) > 0,
   });

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

   const rebalanceDisabled = !!rewardsAvailableData?.length
      ? !rewardsAvailableData.some((reward) => (reward as number) > 0)
      : false;

   return (
      <div className="p-6 max-w-7xl mx-auto space-y-8">
         <Breadcrumb>
            <BreadcrumbList>
               <BreadcrumbItem>
                  <BreadcrumbLink href="/explorer">Explorer</BreadcrumbLink>
               </BreadcrumbItem>
               <BreadcrumbSeparator />
               {isInBuildingContext && buildingId ? (
                  <>
                     <BreadcrumbItem>
                        <BreadcrumbLink href={`/building/${buildingId}`}>Building</BreadcrumbLink>
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

         <Card className="flex flex-col p-0">
            <CardHeader className="w-full p-5 bg-indigo-100">
               <h1 className="text-3xl font-bold">{slice.name}</h1>
               <p className="text-base">{slice.description}</p>
            </CardHeader>

            <CardContent>
               <img
                  src={slice.imageIpfsUrl ?? "/assets/dome.jpeg"}
                  alt={slice.name}
                  style={{ maxHeight: 300 }}
                  className="object-cover rounded-lg w-150"
               />

               <div className="flex flex-row flex-wrap justify-start gap-8 w-full mt-10">
                  {(sliceAllocations?.length > 0 || !!evmAddress) && (
                     <div style={{ width: "33%" }}>
                        <SliceAllocations
                           allocations={sliceAllocations}
                           sliceBuildings={sliceBuildings}
                           onOpenAddAllocation={() => {
                              setIsAllocationOpen(true);
                           }}
                        />
                     </div>
                  )}

                  {sliceBuildings?.length > 0 && (
                     <div>
                        <SliceBuildings buildingsData={sliceBuildingsDetails} />
                     </div>
                  )}

                  {!!evmAddress && (
                     <div>
                        <Card className="min-h-100">
                           <CardHeader>
                              <CardTitle>Deposit to Slice</CardTitle>
                              <CardDescription>
                                 Deposit amount per Building Token in selected Slice
                              </CardDescription>
                           </CardHeader>
                           <CardContent className={cx("flex flex-col flex-auto", { "h-64": true })}>
                              <DepositToSliceForm
                                 onChangeValue={(value: string) => {
                                    if (Number(value) < 100) {
                                       setDepositValueInvalid(true);
                                    } else {
                                       setDepositValueInvalid(false);
                                       setSliceDepositValue(value);
                                    }
                                 }}
                                 onSubmitDepositValue={() => {
                                    handleDepositToSliceWithPermit(Number(sliceDepositValue));
                                 }}
                              />
                              {depositValueInvalid && (
                                 <p className="text-sm text-red-600">
                                    Minimum amount to deposit is 100 tokens
                                 </p>
                              )}
                           </CardContent>
                        </Card>
                     </div>
                  )}

                  <div className="min-w-80">
                     {totalDeposits.total || totalDeposits.user ? (
                        <SliceDepositChart
                           totalStaked={totalDeposits.total}
                           totalUserStaked={totalDeposits.user}
                        />
                     ) : (
                        <></>
                     )}
                  </div>
               </div>
            </CardContent>
         </Card>

         <Dialog
            open={isAllocationOpen}
            onOpenChange={(isOpened) => {
               setIsAllocationOpen(isOpened);
            }}
         >
            <DialogContent
               onInteractOutside={(e) => e.preventDefault()}
               className="max-w-md border-indigo-100"
            >
               <DialogHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg border-b border-indigo-100 p-6 -m-6 mb-6">
                  Update Allocations and Rebalance
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
                     <div>
                        <div className="mt-6">
                           <AddSliceAllocationForm
                              assetOptions={assetsOptions!}
                              existsAllocations={mappedSliceAllocations}
                              formik={{
                                 values: props.values,
                                 errors: props.errors,
                              }}
                              setFieldValue={(name, value) => props.setFieldValue(name, value)}
                              addMoreAllocationsDisabled={addMoreAllocationsDisabled}
                           />
                        </div>
                        <div className="mt-6 justify-start flex flex-row gap-4">
                           <Button
                              type="button"
                              variant="default"
                              disabled={
                                 props.isSubmitting ||
                                 !props.isValid ||
                                 !allocationsExists ||
                                 rebalanceDisabled
                              }
                              onClick={onHandleRebalance}
                           >
                              Rebalance
                           </Button>
                           <Button
                              type="submit"
                              variant="default"
                              disabled={
                                 props.isSubmitting || !props.isValid || addMoreAllocationsDisabled
                              }
                              onClick={props.submitForm}
                           >
                              Update Allocation
                           </Button>
                        </div>
                        <div className="mt-6">
                           {props.isSubmitting && <Loader size={64} className="animate-spin" />}
                        </div>
                     </div>
                  )}
               </Formik>
            </DialogContent>
         </Dialog>
      </div>
   );
}
