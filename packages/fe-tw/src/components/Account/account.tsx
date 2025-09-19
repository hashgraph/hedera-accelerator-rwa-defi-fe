"use client";

import { useState } from "react";
import { Shield, CheckCheck, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { tryCatch } from "@/services/tryCatch";
import { TxResultToastView } from "../CommonViews/TxResultView";
import { useIdentity } from "./useIdentity";
import { TransactionExtended } from "@/types/common";
import { WalkthroughStep } from "../Walkthrough";
import { useRouter } from "next/navigation";

const Account = () => {
   const router = useRouter();
   const { address: evmAddress } = useAccount();
   const { identityData, deployIdentity } = useIdentity();
   const [isDeploying, setIsDeploying] = useState(false);

   const handleDeployIdentity = async ({ onSuccess }: { onSuccess?: () => void }) => {
      if (!evmAddress) {
         toast.error("No wallet address available");
         return;
      }

      setIsDeploying(true);

      const { data: result, error } = await tryCatch<TransactionExtended, { message: string }>(
         deployIdentity(evmAddress),
      );

      if (result?.success) {
         onSuccess?.();
         toast.success(
            <TxResultToastView title="Identity deployed successfully!" txSuccess={result} />,
         );
         router.back();
      } else if (result?.error) {
         toast.error(
            <TxResultToastView title="Error deploying identity" txError={result.error} />,
            { duration: Infinity },
         );
      } else if (error) {
         toast.error(
            <TxResultToastView title="Error deploying identity" txError={error.message} />,
            {
               duration: Infinity,
            },
         );
      }

      setIsDeploying(false);
   };

   return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
         <h1 className="text-2xl font-bold">Account Page</h1>
         <p className="text-gray-700">Manage your account settings and wallet identity.</p>

         <Card variant="indigo" className="w-full max-w-md">
            <CardHeader
               title="Wallet Identity"
               description="Deploy ERC3643 compliant identity for your wallet"
               icon={<Shield />}
            />

            <CardContent>
               {!evmAddress && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                     <p className="font-medium text-red-800">Connect wallet first</p>
                  </div>
               )}

               {identityData.isDeployed && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                     <div className="flex items-center gap-2">
                        <CheckCheck className="w-5 h-5 text-green-600" />
                        <p className="font-medium text-green-800">Identity deployed</p>
                     </div>
                  </div>
               )}

               {!identityData.isDeployed && evmAddress && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                     <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <p className="font-medium text-amber-800">
                           No identity deployed for this wallet
                        </p>
                     </div>
                  </div>
               )}

               <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                     <h4 className="font-medium text-blue-900 mb-2">About ERC3643 Identity</h4>
                     <p className="text-sm text-blue-800">
                        ERC3643 is a standard for compliant tokenization that enables regulatory
                        compliance through on-chain identity verification. Deploying your wallet as
                        an identity allows you to interact with compliant tokenized real-world
                        assets.
                     </p>
                  </div>
                  {evmAddress && !identityData.isDeployed && (
                     <div className="flex justify-end">
                        <WalkthroughStep
                           guideId="USER_INVESTING_GUIDE"
                           stepIndex={7}
                           title="Great!"
                           description="Read the information above and click 'Deploy Identity' below to deploy your identity."
                           side="right"
                        >
                           {({ confirmUserPassedStep }) => (
                              <Button
                                 className=" h-11 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                                 disabled={isDeploying || identityData.isDeployed}
                                 isLoading={isDeploying}
                                 onClick={() => {
                                    handleDeployIdentity({
                                       onSuccess: confirmUserPassedStep,
                                    });
                                 }}
                              >
                                 {isDeploying ? "Deploying Identity..." : "Deploy Identity"}
                              </Button>
                           )}
                        </WalkthroughStep>
                     </div>
                  )}
               </>
            </CardContent>
         </Card>
      </div>
   );
};

export default Account;
