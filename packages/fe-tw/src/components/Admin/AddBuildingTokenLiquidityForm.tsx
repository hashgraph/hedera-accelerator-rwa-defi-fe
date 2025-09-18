"use client";

import { useBuildingLiquidity } from "@/hooks/useBuildingLiquidity";
import { useBuildings } from "@/hooks/useBuildings";
import { Form, Formik } from "formik";
import React, { useEffect, useMemo } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import { SelectItem } from "@/components/ui/select";
import { FormSelect } from "@/components/ui/formSelect";
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
import { useWalkthrough, WalkthroughStep } from "../Walkthrough";

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
   const { confirmUserFinishedGuide } = useWalkthrough();
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
   const { name: tokenName, ...rest } = useTokenInfo(tokenAddress);

   console.log("rest :>> ", rest);

   useEffect(() => {
      if (txHash) {
         toast.success(
            <TxResultToastView title="Liquidity added successfully!" txSuccess={txHash} />,
         );
         confirmUserFinishedGuide("ADMIN_BUILDING_GUIDE");
      }
      if (txError) {
         toast.error(<TxResultToastView title="Error adding liquidity" txError={txError} />, {
            duration: Infinity,
         });
      }
   }, [txHash, txError]);

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
      tokenAAddress: `0x${string}`;
      buildingAddress?: `0x${string}`;
      tokenBAddress: `0x${string}`;
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
      <WalkthroughStep
         guideId="ADMIN_BUILDING_GUIDE"
         stepIndex={16}
         title="This is add liquidity panel"
         description="We are going to basically provide supply to the trade platform, so investors can buy building tokens with their USDC, according to the initial amount we are going to release to the 'market'."
         side="right"
         showConfirmButton
      >
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
                     tokenAAddress: tokenAddress,
                     tokenBAddress: USDC_ADDRESS,
                     tokenAAmount: "",
                     tokenBAmount: "",
                  }}
                  enableReinitialize
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
               >
                  {({ setFieldValue, getFieldProps, values, errors, touched }) => (
                     <Form className="space-y-4">
                        {!buildingAddress && (
                           <FormSelect
                              name="buildingAddress"
                              label="Choose a Building"
                              placeholder="Choose a Building"
                              onValueChange={(value) => setFieldValue("buildingAddress", value)}
                              value={values.buildingAddress}
                              error={
                                 touched.buildingAddress && errors.buildingAddress
                                    ? errors.buildingAddress
                                    : undefined
                              }
                           >
                              {buildings?.map((building) => (
                                 <SelectItem
                                    key={building.address}
                                    value={building.address as `0x${string}`}
                                 >
                                    {building.title} ({building.address})
                                 </SelectItem>
                              ))}
                           </FormSelect>
                        )}

                        <FormSelect
                           name="tokenAAddress"
                           label="Select Token A"
                           placeholder="Choose a Token"
                           onValueChange={(value) => {
                              setFieldValue("tokenAAddress", value);
                              autoCheckPair({
                                 ...values,
                                 tokenAAddress: value as `0x${string}`,
                              } as any);
                           }}
                           value={values.tokenAAddress}
                           error={
                              touched.tokenAAddress && errors.tokenAAddress
                                 ? (errors.tokenAAddress as string)
                                 : undefined
                           }
                        >
                           {tokenSelectOptions.map((token) => (
                              <SelectItem key={token.value} value={token.value}>
                                 {token.label}
                              </SelectItem>
                           ))}
                        </FormSelect>

                        <WalkthroughStep
                           guideId="ADMIN_BUILDING_GUIDE"
                           stepIndex={17}
                           title="Write amount for Token A"
                           description="Set the amount of your building token you want to release, remember this will establish initial exchange rates. (for example, 100 building tokens and 100 USDC will create a 1:1 initial exchange rate)"
                           side="right"
                        >
                           {({ confirmUserPassedStep }) => (
                              <FormInput
                                 required
                                 label={
                                    pairInfo?.exists ? "Desired Token A Amount" : "Token A Amount"
                                 }
                                 placeholder="e.g. 100"
                                 error={
                                    touched.tokenAAmount && errors.tokenAAmount
                                       ? errors.tokenAAmount
                                       : undefined
                                 }
                                 {...getFieldProps("tokenAAmount")}
                                 onChange={(e) => {
                                    setFieldValue("tokenAAmount", e.target.value);
                                    autoCheckPair({
                                       ...values,
                                       tokenAAmount: e.target.value,
                                    } as any);

                                    if (!errors.tokenAAmount) {
                                       confirmUserPassedStep();
                                    }
                                 }}
                              />
                           )}
                        </WalkthroughStep>

                        <FormSelect
                           name="tokenBAddress"
                           label="Select Token B"
                           placeholder="USDC (Pre-selected)"
                           value={values.tokenBAddress}
                           disabled
                        >
                           <SelectItem value={USDC_ADDRESS}>USDC ({USDC_ADDRESS})</SelectItem>
                        </FormSelect>

                        <WalkthroughStep
                           guideId="ADMIN_BUILDING_GUIDE"
                           stepIndex={18}
                           title="Same for USDC"
                           description="Set the amount of USDC you want to release, remember this will establish initial exchange rates."
                           side="right"
                        >
                           {({ confirmUserPassedStep }) => (
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
                                    autoCheckPair({
                                       ...values,
                                       tokenBAmount: e.target.value,
                                    } as any);

                                    if (!errors.tokenBAmount) {
                                       confirmUserPassedStep();
                                    }
                                 }}
                              />
                           )}
                        </WalkthroughStep>

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
                                             <strong>Pair exists!</strong> Liquidity will be added
                                             to existing pool.
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
                                                   {formatAmount(calculatedAmounts.tokenBMin, 6)}{" "}
                                                   USDC
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
                           <WalkthroughStep
                              guideId="ADMIN_BUILDING_GUIDE"
                              stepIndex={19}
                              title="Great job!"
                              description="This will add liquidity and users will be able to invest buying your building tokens!"
                              side="right"
                           >
                              <Button
                                 type="submit"
                                 disabled={isAddingLiquidity || isCheckingPair}
                                 isLoading={isAddingLiquidity}
                                 className="disabled:opacity-50"
                              >
                                 {getButtonText()}
                              </Button>
                           </WalkthroughStep>
                        </div>
                     </Form>
                  )}
               </Formik>
            </CardContent>
         </Card>
      </WalkthroughStep>
   );
}
