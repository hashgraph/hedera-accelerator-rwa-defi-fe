"use client";

import { useBuildingLiquidity } from "@/hooks/useBuildingLiquidity";
import { useBuildings } from "@/hooks/useBuildings";
import { Form, Formik } from "formik";
import React, { useEffect, useMemo } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/ui/formInput";
import { Button } from "@/components/ui/button";
import { Droplets, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { USDC_ADDRESS } from "@/services/contracts/addresses";
import { useBuildingInfo } from "@/hooks/useBuildingInfo";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { TxResultToastView } from "../CommonViews/TxResultView";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader } from "../ui/card";

type Props = {
   buildingAddress?: `0x${string}`;
};

const validationSchema = Yup.object({
   buildingAddress: Yup.string().when([], {
      is: () => !window.location.pathname.includes("/building/"),
      then: (schema) => schema.required("Building selection is required"),
      otherwise: (schema) => schema,
   }),
   tokenAAddress: Yup.string().required("Token A selection is required"),
   tokenBAddress: Yup.string().required("Token B selection is required"),
   tokenAAmount: Yup.string()
      .required("Token A amount is required")
      .test("is-positive", "Amount must be greater than 0", (value) =>
         value ? parseFloat(value) > 0 : false,
      ),
   tokenBAmount: Yup.string()
      .required("Token B amount is required")
      .test("is-positive", "Amount must be greater than 0", (value) =>
         value ? parseFloat(value) > 0 : false,
      ),
});

export function AddBuildingTokenLiquidityForm({ buildingAddress }: Props) {
   const { buildings } = useBuildings();
   const {
      isAddingLiquidity,
      txHash,
      txError,
      pairInfo,
      calculatedAmounts,
      isCheckingPair,
      pairCheckError,
      addLiquidity,
      checkPairAndCalculateAmounts,
   } = useBuildingLiquidity();

   const { tokenAddress } = useBuildingInfo(buildingAddress);
   const { name: tokenName } = useTokenInfo(tokenAddress);

   useEffect(() => {
      if (txHash) {
         toast.success(
            <TxResultToastView title="Liquidity added successfully!" txSuccess={txHash} />,
         );
      }
      if (txError) {
         toast.error(<TxResultToastView title="Error adding liquidity" txError={txError} />, {
            duration: Infinity,
         });
      }
   }, [txHash, txError]);

   // Handle pair check error with transaction display
   useEffect(() => {
      if (pairCheckError) {
         toast.error(
            <TxResultToastView
               title="Failed to check pair information"
               txError={
                  pairCheckError instanceof Error ? pairCheckError.message : String(pairCheckError)
               }
            />,
            { duration: Infinity },
         );
      }
   }, [pairCheckError]);

   const autoCheckPair = (values: {
      tokenAAddress: string;
      buildingAddress?: string;
      tokenBAddress: string;
      tokenAAmount: string;
      tokenBAmount: string;
   }) => {
      if (
         values.tokenAAddress &&
         values.tokenBAddress &&
         values.tokenAAmount &&
         values.tokenBAmount
      ) {
         checkPairAndCalculateAmounts(
            values.tokenAAddress,
            values.tokenBAddress,
            values.tokenAAmount,
            values.tokenBAmount,
         );
      }
   };

   async function handleSubmit(
      values: {
         buildingAddress: string;
         tokenBAddress: string;
         tokenAAddress: string;
         tokenAAmount: string;
         tokenBAmount: string;
      },
      actions: { resetForm: () => void },
   ) {
      const {
         buildingAddress: buildingAddressValue,
         tokenAAddress,
         tokenBAddress,
         tokenAAmount,
         tokenBAmount,
      } = values;
      const buildingAddressOneOf = buildingAddress || buildingAddressValue;

      await addLiquidity({
         buildingAddress: buildingAddressOneOf,
         tokenAAddress,
         tokenBAddress,
         tokenAAmount,
         tokenBAmount,
      });

      actions.resetForm();
   }

   const tokenSelectOptions = useMemo(
      () => [
         {
            value: tokenAddress,
            label: `${tokenName} (${tokenAddress})`,
         },
         {
            value: USDC_ADDRESS,
            label: `USDC (${USDC_ADDRESS})`,
         },
      ],
      [tokenAddress, tokenName],
   );

   const formatAmount = (amount: bigint, decimals: number) => {
      return ethers.formatUnits(amount, decimals);
   };

   const getButtonText = () => {
      if (isAddingLiquidity) return "Adding Liquidity...";
      if (isCheckingPair) return "Calculating Amounts...";
      if (!calculatedAmounts) return "Add Liquidity";

      const tokenAFormatted = formatAmount(calculatedAmounts.tokenARequired, 18);
      const tokenBFormatted = formatAmount(calculatedAmounts.tokenBRequired, 6);

      return `Add Liquidity (${parseFloat(tokenAFormatted).toFixed(2)} Token A + ${parseFloat(tokenBFormatted).toFixed(2)} USDC)`;
   };

   return (
      <Card variant="indigo">
         <CardHeader
            icon={<Droplets />}
            title="Add Liquidity for Building Tokens"
            description="Provide liquidity to enable token trading"
         />
         <CardContent>
            <Formik
               initialValues={{
                  buildingAddress: "",
                  tokenAAddress: "",
                  tokenBAddress: USDC_ADDRESS,
                  tokenAAmount: "",
                  tokenBAmount: "",
               }}
               validationSchema={validationSchema}
               onSubmit={handleSubmit}
            >
               {({ setFieldValue, getFieldProps, values, errors, touched }) => (
                  <Form className="space-y-4">
                     {!buildingAddress && (
                        <div>
                           <Label htmlFor="buildingAddress">Choose a Building</Label>
                           <Select
                              name="buildingAddress"
                              onValueChange={(value) => setFieldValue("buildingAddress", value)}
                              value={values.buildingAddress}
                           >
                              <SelectTrigger className="w-full mt-1">
                                 <SelectValue placeholder="Choose a Building" />
                              </SelectTrigger>
                              <SelectContent>
                                 {buildings?.map((building) => (
                                    <SelectItem
                                       key={building.address}
                                       value={building.address as `0x${string}`}
                                    >
                                       {building.title} ({building.address})
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           {touched.buildingAddress && errors.buildingAddress && (
                              <div className="text-red-600 text-sm mt-1">
                                 {errors.buildingAddress}
                              </div>
                           )}
                        </div>
                     )}

                     <div>
                        <Label htmlFor="tokenAAddress">Select Token A</Label>
                        <Select
                           name="tokenAAddress"
                           onValueChange={(value) => {
                              setFieldValue("tokenAAddress", value);
                              autoCheckPair({ ...values, tokenAAddress: value });
                           }}
                           value={values.tokenAAddress}
                        >
                           <SelectTrigger className="w-full mt-1">
                              <SelectValue placeholder="Choose a Token" />
                           </SelectTrigger>
                           <SelectContent>
                              {tokenSelectOptions.map((token) => (
                                 <SelectItem key={token.value} value={token.value}>
                                    {token.label}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                        {touched.tokenAAddress && errors.tokenAAddress && (
                           <div className="text-red-600 text-sm mt-1">{errors.tokenAAddress}</div>
                        )}
                     </div>

                     <FormInput
                        required
                        label={pairInfo?.exists ? "Desired Token A Amount" : "Token A Amount"}
                        placeholder="e.g. 100"
                        error={
                           touched.tokenAAmount && errors.tokenAAmount
                              ? errors.tokenAAmount
                              : undefined
                        }
                        {...getFieldProps("tokenAAmount")}
                        onChange={(e) => {
                           setFieldValue("tokenAAmount", e.target.value);
                           autoCheckPair({ ...values, tokenAAmount: e.target.value });
                        }}
                     />

                     <div>
                        <Label htmlFor="tokenBAddress">Select Token B</Label>
                        <Select name="tokenBAddress" value={values.tokenBAddress} disabled>
                           <SelectTrigger className="w-full mt-1">
                              <SelectValue placeholder="USDC (Pre-selected)" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value={USDC_ADDRESS}>USDC ({USDC_ADDRESS})</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>

                     <FormInput
                        required
                        label={
                           pairInfo?.exists
                              ? "Desired Token B Amount (USDC)"
                              : "Token B Amount (USDC)"
                        }
                        placeholder="e.g. 100"
                        error={
                           touched.tokenBAmount && errors.tokenBAmount
                              ? errors.tokenBAmount
                              : undefined
                        }
                        {...getFieldProps("tokenBAmount")}
                        onChange={(e) => {
                           setFieldValue("tokenBAmount", e.target.value);
                           autoCheckPair({ ...values, tokenBAmount: e.target.value });
                        }}
                     />

                     {isCheckingPair && (
                        <Alert className="border-blue-200 bg-blue-50">
                           <Info className="w-4 h-4 text-blue-600 animate-spin" />
                           <AlertDescription className="text-blue-800">
                              Checking pair information and calculating required amounts...
                           </AlertDescription>
                        </Alert>
                     )}

                     {/* Pair Information */}
                     {!isCheckingPair && pairInfo && (
                        <div className="space-y-3">
                           {pairInfo.exists && (
                              <>
                                 <Alert className="border-green-200 bg-green-50">
                                    <div className="flex items-center gap-2">
                                       <CheckCircle2 className="w-4 h-4 text-green-600" />
                                       <AlertDescription className="text-green-800">
                                          <strong>Pair exists!</strong> Liquidity will be added to
                                          existing pool.
                                          <br />
                                          <span className="text-sm">
                                             Pair Address: {pairInfo.pairAddress}
                                          </span>
                                       </AlertDescription>
                                    </div>
                                 </Alert>

                                 {calculatedAmounts && (
                                    <Alert className="border-blue-200 bg-blue-50">
                                       <Info className="w-4 h-4 text-blue-600" />
                                       <AlertDescription className="text-blue-800">
                                          <strong>Required amounts for liquidity:</strong>
                                          <div className="mt-2 space-y-1 text-sm">
                                             <div>
                                                • Token A Required:{" "}
                                                <span className="font-semibold">
                                                   {formatAmount(
                                                      calculatedAmounts.tokenARequired,
                                                      18,
                                                   )}
                                                </span>
                                             </div>
                                             <div>
                                                • USDC Required:{" "}
                                                <span className="font-semibold">
                                                   {formatAmount(
                                                      calculatedAmounts.tokenBRequired,
                                                      6,
                                                   )}
                                                </span>
                                             </div>
                                             <div className="text-xs text-blue-600 mt-2">
                                                Minimum amounts (5% slippage):{" "}
                                                {formatAmount(calculatedAmounts.tokenAMin, 18)}{" "}
                                                Token A,{" "}
                                                {formatAmount(calculatedAmounts.tokenBMin, 6)} USDC
                                             </div>
                                          </div>
                                       </AlertDescription>
                                    </Alert>
                                 )}
                              </>
                           )}
                        </div>
                     )}

                     <div className="flex justify-end gap-5 mt-5">
                        <Button
                           type="submit"
                           disabled={isAddingLiquidity || isCheckingPair}
                           isLoading={isAddingLiquidity}
                           className="disabled:opacity-50"
                        >
                           {getButtonText()}
                        </Button>
                     </div>
                  </Form>
               )}
            </Formik>
         </CardContent>
      </Card>
   );
}
