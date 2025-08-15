"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { tryCatch } from "@/services/tryCatch";
import { Separator } from "../ui/separator";
import { cx } from "class-variance-authority";
import { isEmpty } from "lodash";
import { ClockIcon } from "lucide-react";
import { TooltipInfoButton } from "../ui/tooltipInfoButton";

interface InfoCardProps {
   claimableRewards: number;
   autoCompounderRewards: number;
   tvl: string;
   autoCompounderAddress?: string;
   onClaimVaultRewards: () => Promise<any>;
   onClaimAutoCompounderRewards: () => Promise<any>;
   onClaimAutoCompounderUserRewards: () => Promise<any>;
   isClaimingVault: boolean;
   isClaimingAutoCompounder: boolean;
   isClaimingAutoCompounderUserRewards: boolean;
}

export default function InfoCard({
   claimableRewards,
   autoCompounderRewards,
   tvl,
   autoCompounderAddress,
   onClaimVaultRewards,
   onClaimAutoCompounderRewards,
   onClaimAutoCompounderUserRewards,
   isClaimingVault,
   isClaimingAutoCompounder,
   isClaimingAutoCompounderUserRewards,
}: InfoCardProps) {
   const handleClaimVaultRewards = async () => {
      const { data, error } = await tryCatch<any, any>(onClaimVaultRewards());

      if (data) {
         toast.success(
            <div className="flex flex-col">
               <p>Successfully claimed vault rewards!</p>
               <a
                  className="text-blue-500"
                  href={`https://hashscan.io/testnet/transaction/${data.consensus_timestamp}`}
                  target="_blank"
                  rel="noopener noreferrer"
               >
                  View transaction
               </a>
            </div>,
            {
               duration: 10000,
               closeButton: true,
            },
         );
      }

      if (error) {
         toast.error(`Failed to claim vault rewards. ${error.details}`, {
            duration: Infinity,
            closeButton: true,
         });
      }
   };

   const handleClaimAutoCompounderRewards = async () => {
      const { data, error } = await tryCatch<any, any>(onClaimAutoCompounderRewards());

      if (data) {
         toast.success(
            <div className="flex flex-col">
               <p>Successfully reinvested AutoCompounder rewards!</p>
               <a
                  className="text-blue-500"
                  href={`https://hashscan.io/testnet/transaction/${data.consensus_timestamp}`}
                  target="_blank"
                  rel="noopener noreferrer"
               >
                  View transaction
               </a>
            </div>,
            {
               duration: 10000,
               closeButton: true,
            },
         );
      }

      if (error) {
         toast.error(`Failed to claim autoCompounder rewards. ${error.details}`, {
            duration: Infinity,
            closeButton: true,
         });
      }
   };

   const handleClaimAutoCompounderUserRewards = async () => {
      const { data, error } = await tryCatch<any, any>(onClaimAutoCompounderUserRewards());

      if (data) {
         toast.success(
            <div className="flex flex-col">
               <p>Successfully claimed AutoCompounder user rewards!</p>
               <a
                  className="text-blue-500"
                  href={`https://hashscan.io/testnet/transaction/${data.consensus_timestamp}`}
                  target="_blank"
                  rel="noopener noreferrer"
               >
                  View transaction
               </a>
            </div>,
            {
               duration: 10000,
               closeButton: true,
            },
         );
      }

      if (error) {
         toast.error(`Failed to claim autoCompounder user rewards. ${error.details}`, {
            duration: Infinity,
            closeButton: true,
         });
      }
   };

   return (
      <Card className="h-full flex flex-col">
         <CardHeader>
            <CardTitle>Staking Info</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4 flex-1">
            <div className="space-y-3">
               <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg gap-1">
                  <div>
                     <div className="flex items-center gap-1">
                        <p className="font-semibold text-base text-gray-900">Vault Rewards</p>
                        <TooltipInfoButton label="Vault Rewards">
                           Current pending rewards that are ready to be claimed from the vault.
                        </TooltipInfoButton>
                     </div>
                     <p className="text-sm text-gray-600">
                        ${claimableRewards ? Number(claimableRewards).toFixed(2) : "0.00"}
                     </p>
                  </div>
                  {!isEmpty(claimableRewards) && (
                     <Button
                        size="sm"
                        variant="outline"
                        className="bg-indigo-50 border-indigo-200 text-indigo-700"
                        onClick={handleClaimVaultRewards}
                        isLoading={isClaimingVault}
                        disabled={isClaimingVault}
                     >
                        Claim
                     </Button>
                  )}
               </div>

               {autoCompounderAddress && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg gap-1">
                     <div>
                        <p className="font-semibold text-wrap text-gray-900">
                           AutoCompounder Rewards
                        </p>
                        <p className="text-sm text-gray-600">
                           $
                           {autoCompounderRewards
                              ? Number(autoCompounderRewards).toFixed(2)
                              : "0.00"}
                        </p>
                     </div>
                     {!isEmpty(autoCompounderRewards) && (
                        <div className={cx("flex flex-wrap justify-end gap-1")}>
                           <Button
                              size="xs"
                              variant="outline"
                              className="bg-indigo-50 border-indigo-200 text-indigo-700"
                              onClick={handleClaimAutoCompounderRewards}
                              isLoading={isClaimingAutoCompounder}
                              disabled={
                                 isClaimingAutoCompounder || isClaimingAutoCompounderUserRewards
                              }
                           >
                              Reinvest
                           </Button>
                           <Button
                              size="xs"
                              variant="outline"
                              className="bg-indigo-50 border-indigo-200 text-indigo-700 "
                              onClick={handleClaimAutoCompounderUserRewards}
                              isLoading={isClaimingAutoCompounderUserRewards}
                              disabled={
                                 isClaimingAutoCompounderUserRewards || isClaimingAutoCompounder
                              }
                           >
                              Claim
                           </Button>
                        </div>
                     )}
                  </div>
               )}
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
               <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-900">TVL</span>
                  <TooltipInfoButton label={"TVL"}>
                     TVL shows the total amount of money (in USDC) that users have deposited and
                     locked into this building. A higher TVL usually means more people trust the
                     platform and it's considered more reliable.
                  </TooltipInfoButton>
               </div>
               <span className="text-lg font-bold text-gray-900">
                  ${tvl ? Number(tvl).toFixed(2) : "0.00"}
               </span>
            </div>
         </CardContent>
      </Card>
   );
}
