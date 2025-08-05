import { shortEvmAddress } from "@/services/util";
import { useAccountId, useEvmAddress, useWallet } from "@buidlerlabs/hashgraph-react-wallets";
import {
   HashpackConnector,
   MetamaskConnector,
} from "@buidlerlabs/hashgraph-react-wallets/connectors";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Unplug, UserCircle, Wallet } from "lucide-react";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";
import { tryCatch } from "@/services/tryCatch";
import { useWalkthrough, WalkthroughStep } from "../Walkthrough";

const GUIDES = [
   {
      guideId: "USER_LOGIN_FLOW",
      priority: 1,
   },
];

export function WalletConnectModalRW() {
   const { WalkthroughHelperCard, HelperCardProps, confirmUserPassedStep } = useWalkthrough(GUIDES);

   const [isModalOpen, setModalOpen] = useState(false);

   const { connect: connectHashpack } = useWallet(HashpackConnector) || {};

   const { connect: connectMetamask } = useWallet(MetamaskConnector) || {};

   const handleConnectHashpack = async () => {
      const { data, error } = await tryCatch(connectHashpack());
      if (error) {
         console.log("error :>> ", error);
      }
      setModalOpen(false);
      confirmUserPassedStep(2);
   };

   return (
      <>
         <Dialog open={isModalOpen} onOpenChange={(state) => setModalOpen(state)}>
            <WalkthroughStep
               guideId={"USER_LOGIN_FLOW"}
               stepIndex={1}
               title={"Click here to open login dialog"}
               description={"This will open up a choise dialog with Metamask or Hashgraph wallets"}
            >
               <Button
                  color={"primary"}
                  onClick={() => {
                     setModalOpen(true);
                     confirmUserPassedStep(1);
                  }}
               >
                  <Wallet />
                  Connect Wallet
               </Button>
            </WalkthroughStep>
            <DialogContent className="">
               <DialogHeader>
                  <DialogTitle>Connect Wallet</DialogTitle>
                  <DialogDescription className="flex flex-col gap-2 mt-4">
                     Choose a wallet to connect
                     <WalkthroughStep
                        guideId={"USER_LOGIN_FLOW"}
                        stepIndex={2}
                        title={"Select wallet of your choice"}
                        description={
                           "You can choose between Hashpack and Metamask.Both are supported."
                        }
                     >
                        <div className="flex gap-2">
                           <Button variant="outline" onClick={handleConnectHashpack}>
                              <Image
                                 alt="hashpack icon"
                                 src="/assets/hashpack-icon.png"
                                 width={24}
                                 height={24}
                              />
                              Hashpack
                           </Button>
                           <Button
                              variant="outline"
                              onClick={() => {
                                 connectMetamask();
                                 setModalOpen(false);
                                 confirmUserPassedStep(2);
                              }}
                           >
                              <Image
                                 alt="metamask icon"
                                 src="/assets/metamask-icon.png"
                                 width={32}
                                 height={32}
                              />
                              Metamask
                           </Button>
                        </div>
                     </WalkthroughStep>
                  </DialogDescription>
               </DialogHeader>
            </DialogContent>
         </Dialog>
         <WalkthroughHelperCard {...HelperCardProps} />
      </>
   );
}
