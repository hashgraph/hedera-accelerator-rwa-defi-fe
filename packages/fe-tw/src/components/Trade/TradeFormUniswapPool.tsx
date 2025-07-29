"use client";

import { ethers } from "ethers";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { ChartCandlestick, TrendingUp, ArrowUpDown } from "lucide-react";
import { useUniswapTradeSwaps } from "@/hooks/useUniswapTradeSwaps";
import { oneHourTimePeriod } from "@/consts/trade";
import { USDC_ADDRESS } from "@/services/contracts/addresses";
import { getTokenDecimals } from "@/services/erc20Service";
import { tryCatch } from "@/services/tryCatch";
import type { TradeFormPayload } from "@/types/erc3643/types";
import { TxResultToastView } from "../CommonViews/TxResultView";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
   buildingTokenOptions: { tokenAddress: `0x${string}`; tokenName: string }[];
   displayOnBuildingPage?: boolean;
   onTokensPairSelected: (tokenA?: `0x${string}`, tokenB?: `0x${string}`) => void;
};

const initialValues = {
   amount: "",
   tokenA: undefined,
   tokenB: undefined,
   autoRevertsAfter: oneHourTimePeriod,
};

export default function TradeFormUniswapPool({
   buildingTokenOptions,
   displayOnBuildingPage,
   onTokensPairSelected,
}: Props) {
   const queryClient = useQueryClient();
   const { handleSwap, getAmountsOut, giveAllowance } = useUniswapTradeSwaps();
   const [isLoading, setIsLoading] = useState(false);
   const [swapTokensAmountOutput, setSwapTokensAmountOutput] = useState<{
      amountA: bigint;
      amountB: bigint;
   }>();
   const [swapTokensDecimals, setSwapTokensDecimals] = useState<{
      tokenA: number;
      tokenB: number;
   }>();

   const buildingTokensOptions = useMemo(
      () =>
         buildingTokenOptions.map((tok) => ({
            label: tok.tokenName,
            value: tok.tokenAddress,
         })),
      [buildingTokenOptions],
   );

   const handleSwapSubmit = async (values: TradeFormPayload, resetForm: () => void) => {
      setSwapTokensAmountOutput(undefined);
      setIsLoading(true);

      const amountA = values.amount;
      const tokenB = values.tokenB;
      const tokenA = values.tokenA;

      if (!tokenA || !tokenB || !amountA) {
         toast.error("All fields in trade form are required");
         setIsLoading(false);
      } else {
         const { data: tokenADecimals, error: tokenADecimalsError } = await tryCatch(
            getTokenDecimals(tokenA!),
         );
         const { data: tokenBDecimals, error: tokenBDecimalsError } = await tryCatch(
            getTokenDecimals(tokenB!),
         );

         if (tokenADecimalsError || tokenBDecimalsError) {
            toast.error("Failed to swap tokens - falied calculate decimals");
            return;
         }

         setSwapTokensDecimals({
            tokenA: Number(tokenADecimals[0]),
            tokenB: Number(tokenBDecimals[0]),
         });

         const { data: outputAmounts, error: outputAmountsError } = await tryCatch(
            getAmountsOut(ethers.parseUnits(amountA, tokenADecimals[0]), [tokenA!, tokenB!]),
         );

         if (outputAmountsError) {
            toast.error("Failed to swap tokens - falied calculate output amounts");
            return;
         } else if (outputAmounts) {
            if (!outputAmounts[1]) {
               toast.error("Failed to swap tokens - tokens input amount must be adjusted");
               return;
            }

            setSwapTokensAmountOutput({
               amountA: outputAmounts[0],
               amountB: outputAmounts[1],
            });
         }

         try {
            await giveAllowance(tokenA, outputAmounts[0]);
            await giveAllowance(tokenB, outputAmounts[1]);

            const transaction = await handleSwap({
               amountIn: outputAmounts[0],
               amountOut: outputAmounts[1],
               path: [tokenA, tokenB],
               deadline:
                  Date.now() +
                  (values.autoRevertsAfter ? Number(values.autoRevertsAfter) : oneHourTimePeriod),
            });

            const formattedAmountB = ethers.formatUnits(
               outputAmounts[1],
               Number(tokenBDecimals![0]),
            );

            queryClient.invalidateQueries({ queryKey: ["TOKEN_INFO"] });

            toast.success(
               <TxResultToastView
                  title={`Successfully traded ${amountA} tokens of token ${tokenA} for ${formattedAmountB} of ${tokenB}!`}
                  txSuccess={transaction}
               />,
               {
                  duration: 10000,
                  closeButton: true,
               },
            );
         } catch (error) {
            toast.error(
               <TxResultToastView
                  title={`Error swapping tokens ${error?.toString()}`}
                  txError={(error as Error & { tx: { transaction_id: string } }).tx}
               />,
               { duration: Infinity, closeButton: true },
            );
         } finally {
            resetForm();
            setIsLoading(false);
         }
      }
   };

   const revertsInOptions = new Array(24).fill(null).map((_, index) => ({
      label: `In ${index + 1} hour`,
      value: (index + 1) * oneHourTimePeriod,
   }));

   return (
      <Card variant="indigo">
         <CardHeader
            icon={<ChartCandlestick />}
            title={displayOnBuildingPage ? "Swap Building Token" : "Token Swap"}
            description="Trade your tokens instantly via Uniswap"
         />

         <CardContent>
            <Formik
               onSubmit={(values, { setSubmitting, resetForm }) => {
                  setSubmitting(false);
                  handleSwapSubmit(values, resetForm);
               }}
               initialValues={initialValues}
               validationSchema={Yup.object({
                  amount: Yup.string().required(),
                  tokenA: Yup.string().required(),
                  tokenB: Yup.string().required(),
                  autoRevertsAfter: Yup.string(),
               })}
            >
               {({ values, handleSubmit, setFieldValue, getFieldProps, setValues }) => (
                  <Form onSubmit={handleSubmit} className="space-y-4">
                     <h1 className="text-2xl font-bold mb-4">
                        {displayOnBuildingPage
                           ? "Trade Building Token via Uniswap Gateway to USDC"
                           : "Trade any Token via Uniswap Gateway"}
                     </h1>
                     <p className="text-sm text-gray-900 mb-4">
                        Select a building token you hold and swap it to another building token or
                        USDC
                     </p>
                     <div>
                        <Label htmlFor="tokenASelect">Select token A</Label>
                        <Select
                           name="tokenA"
                           onValueChange={(value) => {
                              setFieldValue("tokenA", value);
                              onTokensPairSelected(value as `0x${string}`);
                           }}
                           value={values.tokenA}
                        >
                           <SelectTrigger className="w-full mt-1">
                              <SelectValue placeholder="Choose a Token A" />
                           </SelectTrigger>
                           <SelectContent>
                              {[
                                 ...buildingTokensOptions,
                                 {
                                    value: USDC_ADDRESS,
                                    label: "USDC",
                                 },
                              ].map((building) => (
                                 <SelectItem
                                    key={building.value}
                                    value={building.value as `0x${string}`}
                                 >
                                    {building.label} ({building.value})
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="flex justify-center -my-2">
                        <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           className="rounded-full p-2 h-10 w-10 border-2 hover:bg-indigo-50 transition-colors"
                           onClick={() => {
                              setValues({
                                 ...values,
                                 tokenA: values.tokenB,
                                 tokenB: values.tokenA,
                              });

                              onTokensPairSelected(
                                 values.tokenB! as `0x${string}`,
                                 values.tokenA! as `0x${string}`,
                              );
                           }}
                           disabled={!values.tokenA && !values.tokenB}
                        >
                           <ArrowUpDown className="h-4 w-4" />
                        </Button>
                     </div>
                     <div>
                        <Label htmlFor="tokenBSelect">Select token B</Label>
                        <Select
                           name="tokenB"
                           onValueChange={(value) => {
                              setFieldValue("tokenB", value);
                              onTokensPairSelected(undefined, value as `0x${string}`);
                           }}
                           value={values.tokenB}
                        >
                           <SelectTrigger className="w-full mt-1">
                              <SelectValue placeholder="Choose a Token B" />
                           </SelectTrigger>
                           <SelectContent>
                              {[
                                 ...buildingTokensOptions,
                                 {
                                    value: USDC_ADDRESS,
                                    label: "USDC",
                                 },
                              ].map((token) => (
                                 <SelectItem key={token.value} value={token.value as `0x${string}`}>
                                    {token.label} ({token.value})
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                     <div>
                        <Label htmlFor="amount">Amount of tokens to swap</Label>
                        <Input
                           style={{
                              fontSize: 15,
                           }}
                           className="mt-1"
                           placeholder="e.g. 100"
                           {...getFieldProps("amount")}
                        />
                     </div>
                     <div>
                        <Label htmlFor="autoRevertsAfter">Auto reverts period in hours</Label>
                        <Select
                           name="autoRevertsAfter"
                           onValueChange={(value) => {
                              setFieldValue("autoRevertsAfter", Number(value));
                           }}
                           value={values.autoRevertsAfter as unknown as string}
                        >
                           <SelectTrigger className="w-full mt-1">
                              <SelectValue placeholder="Period in hours" />
                           </SelectTrigger>
                           <SelectContent>
                              {revertsInOptions.map((token) => (
                                 <SelectItem
                                    key={token.value}
                                    value={token.value as unknown as string}
                                 >
                                    {token.label}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                     {!!values.tokenA && !!values.tokenB && values.tokenA === values.tokenB && (
                        <p className="text-sm text-red-600 font-bold">
                           Tokens A and B should be different
                        </p>
                     )}
                     <Button
                        className="mt-4 self-end"
                        type="submit"
                        isLoading={isLoading}
                        disabled={
                           !values.tokenA ||
                           !values.tokenB ||
                           values.tokenA === values.tokenB ||
                           isLoading
                        }
                     >
                        Swap tokens
                     </Button>
                  </Form>
               )}
            </Formik>
            {!!swapTokensAmountOutput && (
               <div className="flex flex-col gap-1 mt-5">
                  <span className="text-sm text-purple-600">
                     Tokens A amount in:{" "}
                     {ethers.formatUnits(
                        swapTokensAmountOutput.amountA,
                        swapTokensDecimals?.tokenA,
                     )}
                  </span>
                  <span className="text-sm text-purple-600">
                     Tokens B amount out:{" "}
                     {ethers.formatUnits(
                        swapTokensAmountOutput.amountB,
                        swapTokensDecimals?.tokenB,
                     )}
                  </span>
               </div>
            )}
         </CardContent>
      </Card>
   );
}
