"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { tryCatch } from "@/services/tryCatch";
import { Switch } from "../ui/switch";
import { FormInput } from "../ui/formInput";
import { Info, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { Transaction } from "./types";
import { TxResultToastView } from "../CommonViews/TxResultView";
import { TooltipInfoButton } from "../ui/tooltipInfoButton";

type ManageStakeProps = {
   disabled: boolean;
   isDepositing: boolean;
   isWithdrawing: boolean;
   autoCompounderAddress?: string;
   aTokenExchangeRate?: number;
   onStake: ({ amount }: { amount: number; isAutoCompounder: boolean }) => Promise<{
      approveTx: Transaction;
      depositTx: Transaction;
   }>;
   onUnstake: ({ amount }: { amount: number; isAutoCompounder: boolean }) => Promise<Transaction>;
};

type StakeMode = "stake" | "unstake";

export default function ManageStake({
   disabled,
   isDepositing,
   isWithdrawing,
   autoCompounderAddress,
   aTokenExchangeRate,
   onStake,
   onUnstake,
}: ManageStakeProps) {
   const [amount, setAmount] = useState("");
   const [isAutoCompounder, setIsAutoCompounder] = useState(false);
   const [mode, setMode] = useState<StakeMode>("stake");

   const handleStake = async () => {
      const { data, error } = await tryCatch(onStake({ amount: Number(amount), isAutoCompounder }));

      if (data) {
         toast.success(
            <TxResultToastView
               title={`Successfully approved ${amount} token spending amount`}
               txSuccess={data.approveTx}
            />,
         );

         toast.success(
            <TxResultToastView
               title={`Successfully staked ${amount} token`}
               txSuccess={data.depositTx}
            />,
         );
      }

      if (error) {
         toast.error(<TxResultToastView title="Failed to stake tokens" txError={error.tx} />);
      }
   };

   const handleUnstake = async () => {
      const { data: withdrawTx, error } = await tryCatch(
         onUnstake({ amount: Number(amount), isAutoCompounder }),
      );

      if (withdrawTx) {
         toast.success(
            <TxResultToastView
               title={`Successfully unstaked ${amount} tokens!`}
               txSuccess={withdrawTx}
            />,
         );
      }

      if (error) {
         toast.error(<TxResultToastView title={`Failed to unstake tokens`} txError={error.tx} />);
      }
   };

   const getTokenType = () => {
      if (!isAutoCompounder) return "Building Tokens";
      return mode === "stake" ? "Building Tokens" : "aTokens";
   };

   const getTokenFlow = () => {
      if (!isAutoCompounder) {
         return mode === "stake" ? "Building Tokens → Staked" : "Staked → Building Tokens";
      }

      return mode === "stake" ? "Building Tokens → aTokens" : "aTokens → Building Tokens";
   };

   const getDescription = () => {
      if (!isAutoCompounder) {
         return mode === "stake"
            ? "Earn rewards on your building tokens"
            : "Withdraw your staked building tokens";
      }

      return mode === "stake"
         ? "Auto-compound rewards for maximum yield"
         : "Redeem your aTokens back to building tokens";
   };

   const handleExecute = async () => {
      if (mode === "stake") {
         await handleStake();
      } else {
         await handleUnstake();
      }
   };

   return (
      <Card>
         <CardHeader>
            <CardTitle>Manage Your Stake</CardTitle>
            <CardDescription>Choose your staking strategy and manage your position</CardDescription>
         </CardHeader>
         <CardContent className="space-y-6">
            <Tabs
               value={mode}
               onValueChange={(value) => setMode(value as StakeMode)}
               className="w-full"
            >
               <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="stake" className="flex items-center gap-2">
                     <TrendingUp className="w-4 h-4" />
                     Stake
                  </TabsTrigger>
                  <TabsTrigger value="unstake" className="flex items-center gap-2">
                     <TrendingDown className="w-4 h-4" />
                     Unstake
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="stake" className="mt-6 space-y-4">
                  {autoCompounderAddress && (
                     <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex flex-1 items-center gap-1">
                           <Label htmlFor="autocompound-stake" className="font-medium text-sm">
                              Auto Compounder
                           </Label>
                           <TooltipInfoButton label="Auto Compounder">
                              Turn on to enable Auto Compounder, which will automatically reinvest
                              your rewards back into your stake, maximizing your yield. Turn off to
                              manually claim your rewards to your wallet.
                           </TooltipInfoButton>
                        </div>
                        <Switch
                           id="autocompound-stake"
                           checked={isAutoCompounder}
                           onCheckedChange={(checked) => setIsAutoCompounder(checked)}
                        />
                     </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                           <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                           <p className="text-sm font-medium text-blue-900">{getTokenFlow()}</p>
                           <p className="text-xs text-blue-700">{getDescription()}</p>
                        </div>
                     </div>
                     {isAutoCompounder && aTokenExchangeRate && (
                        <div className="text-right">
                           <p className="text-xs text-blue-600 font-medium">
                              Rate: {aTokenExchangeRate.toFixed(4)}
                           </p>
                        </div>
                     )}
                  </div>
                  <FormInput
                     label={`Amount (${getTokenType()})`}
                     id="stake-amount"
                     name="stake-amount"
                     type="number"
                     placeholder={`0.00`}
                     className="w-full"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     disabled={disabled || isDepositing || isWithdrawing}
                     tooltipContent="Enter the amount you want to stake. This amount will be used to calculate your rewards and determine your staking power."
                  />
                  <Button
                     isLoading={isDepositing}
                     disabled={disabled || isDepositing || isWithdrawing || !amount}
                     type="button"
                     onClick={handleExecute}
                     className="w-full"
                     size="lg"
                  >
                     {isAutoCompounder ? "Stake & Auto-Compound" : "Stake Tokens"}
                  </Button>
               </TabsContent>

               <TabsContent value="unstake" className="mt-6 space-y-4">
                  {autoCompounderAddress && (
                     <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-1">
                           <Label htmlFor="autocompound-unstake" className="font-medium text-sm">
                              From Auto Compounder
                           </Label>
                           <TooltipInfoButton label="Auto Compounder">
                              Turn on to unstake your tokens from the Auto Compounder. Turn off to
                              unstake your tokens from the basic stake.
                           </TooltipInfoButton>
                        </div>
                        <Switch
                           id="autocompound-unstake"
                           checked={isAutoCompounder}
                           onCheckedChange={(checked) => setIsAutoCompounder(checked)}
                        />
                     </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                           <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                           <p className="text-sm font-medium text-blue-900">{getTokenFlow()}</p>
                           <p className="text-xs text-blue-700">{getDescription()}</p>
                        </div>
                     </div>
                     {isAutoCompounder && aTokenExchangeRate && (
                        <div className="text-right">
                           <p className="text-xs text-blue-600 font-medium">
                              Rate: {aTokenExchangeRate.toFixed(4)}
                           </p>
                        </div>
                     )}
                  </div>

                  <FormInput
                     label={`Amount (${getTokenType()})`}
                     id="unstake-amount"
                     name="unstake-amount"
                     type="number"
                     placeholder={`0.00`}
                     className="w-full"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     disabled={disabled || isDepositing || isWithdrawing}
                     tooltipContent="Enter the amount you want to unstake. This will reduce your stake by the specified amount. This will also reduce your rewards and voting power."
                  />

                  <Button
                     isLoading={isWithdrawing}
                     disabled={disabled || isDepositing || isWithdrawing || !amount}
                     type="button"
                     onClick={handleExecute}
                     className="w-full"
                     size="lg"
                     variant="outline"
                  >
                     {isAutoCompounder ? "Redeem aTokens" : "Unstake Tokens"}
                  </Button>
               </TabsContent>
            </Tabs>
         </CardContent>
      </Card>
   );
}
