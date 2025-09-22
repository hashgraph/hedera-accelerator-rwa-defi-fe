"use client";
import { useAccountEffect, useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useWalkthrough, WalkthroughPromptCard, WalkthroughStep } from "../Walkthrough";
import { Button } from "../ui/button";
import { CircleUser, Wallet } from "lucide-react";
import { AppKitModal } from "@/config/WagmiContextProvider";

const ReownConnectButton = ({ balance = "false", ...rest }) => {
   const { isConnected } = useAccount();
   const { PromptCardProps, confirmUserPassedStep } = useWalkthrough([
      {
         guideId: "USER_LOGIN_FLOW",
         priority: 1,
      },
   ]);

   useAccountEffect({
      onConnect: () => {
         confirmUserPassedStep(1, "USER_LOGIN_FLOW");
      },
   });

   return (
      <>
         <WalkthroughStep
            guideId={"USER_LOGIN_FLOW"}
            stepIndex={1}
            title={"Click here to open login dialog"}
            description={"This will open Reown connect modal with lots of options to authenticate"}
         >
            {({ confirmUserPassedStep }) =>
               isConnected ? (
                  <Button
                     variant="secondary"
                     onClick={() => {
                        AppKitModal.open({ view: "Account" });
                     }}
                  >
                     <CircleUser />
                  </Button>
               ) : (
                  <Button
                     variant={"default"}
                     onClick={() => {
                        AppKitModal.open({ view: "Connect" });
                        confirmUserPassedStep();
                     }}
                  >
                     <Wallet />
                     Connect Wallet
                  </Button>
               )
            }
         </WalkthroughStep>

         <WalkthroughPromptCard
            {...PromptCardProps}
            title="Beginning of a Journey"
            description="To start investing, you need to login, want us to guide you through the process?"
         />
      </>
   );
};
export default ReownConnectButton;
