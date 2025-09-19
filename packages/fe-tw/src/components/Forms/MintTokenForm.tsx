"use client";

import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { CoinsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { tokenAbi } from "@/services/contracts/abi/tokenAbi";
import { useBuildingInfo } from "@/hooks/useBuildingInfo";
import { getTokenDecimals } from "@/services/erc20Service";
import { executeTransaction } from "@/hooks/useExecuteTransaction";
import { tryCatch } from "@/services/tryCatch";
import { TxResultToastView } from "../CommonViews/TxResultView";
import { toast } from "sonner";
import { FormInput } from "../ui/formInput";
import { USDC_ADDRESS } from "@/services/contracts/addresses";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import useWriteContract from "@/hooks/useWriteContract";

type Props = { buildingId: string };

export const MintTokenForm = ({ buildingId }: Props) => {
   const { writeContract } = useWriteContract();
   const { address: evmAddress } = useAccount();
   const { tokenAddress } = useBuildingInfo(buildingId);
   const [isLoading, setIsLoading] = useState(false);

   const handleDoMint = async (values: { tokensAmount?: string }) => {
      const { data: decimals, error } = await tryCatch(getTokenDecimals(tokenAddress));
      if (decimals) {
         const amountAsBigInt = ethers.parseUnits(values.tokensAmount!, Number(decimals));
         const tx = await executeTransaction(() =>
            writeContract({
               address: USDC_ADDRESS,
               functionName: "mint",
               abi: tokenAbi,
               args: [evmAddress as `0x${string}`, amountAsBigInt],
            }),
         );

         toast.success(<TxResultToastView title="Tokens minted successfully!" txSuccess={tx} />);
      }
      if (error) {
         toast.error(<TxResultToastView title="Error minting tokens" txError={error.tx} />, {
            duration: Infinity,
         });
      }
   };

   return (
      <Card variant="indigo" className="max-w-md">
         <CardHeader
            icon={<CoinsIcon />}
            title="Mint Building Tokens"
            description="Mint new tokens for your building"
         />

         <CardContent>
            {!tokenAddress && (
               <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="font-medium text-amber-800">
                     Token for building needs to be deployed first
                  </p>
               </div>
            )}
            {!evmAddress && (
               <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="font-medium text-red-800">Connect wallet first</p>
               </div>
            )}
            {evmAddress && tokenAddress && (
               <Formik
                  initialValues={{
                     tokensAmount: undefined,
                  }}
                  validationSchema={Yup.object({
                     tokensAmount: Yup.string().required("Mint amount is required"),
                  })}
                  onSubmit={async (values, { setSubmitting, resetForm }) => {
                     setIsLoading(true);

                     await handleDoMint(values);

                     setSubmitting(false);
                     setIsLoading(false);
                     resetForm();
                  }}
               >
                  {({ getFieldProps, touched, errors }) => (
                     <Form className="space-y-6">
                        <div className="space-y-2">
                           <FormInput
                              type="number"
                              label="Tokens Amount"
                              placeholder="Enter amount of tokens to mint"
                              {...getFieldProps("tokensAmount")}
                              error={touched.tokensAmount ? errors.tokensAmount : undefined}
                           />
                        </div>

                        <Button
                           className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                           disabled={isLoading}
                           isLoading={isLoading}
                           type="submit"
                        >
                           {isLoading ? "Minting Tokens..." : "Mint Tokens"}
                        </Button>
                     </Form>
                  )}
               </Formik>
            )}
         </CardContent>
      </Card>
   );
};
