import { Shield, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import Link from "next/link";
import { WalkthroughStep } from "../Walkthrough";

interface IProps {
   isModalOpened: boolean;
   onOpenChange: (open: boolean) => void;
}

const IdentityNotDeployedModal = ({ isModalOpened, onOpenChange }: IProps) => {
   return (
      <Dialog open={isModalOpened} onOpenChange={onOpenChange}>
         <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            className="max-w-md border-indigo-100"
         >
            <DialogHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg border-b border-indigo-100 p-6 -m-6 mb-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                     <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                     <DialogTitle className="text-xl text-indigo-900">
                        Identity Required
                     </DialogTitle>
                     <DialogDescription className="text-indigo-700/70">
                        Deploy your ERC3643 identity first
                     </DialogDescription>
                  </div>
               </div>
            </DialogHeader>

            <div className="space-y-6">
               <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-2">Identity Not Deployed</h4>
                  <p className="text-sm text-amber-800">
                     Before you can access building features, you need to deploy your ERC3643
                     compliant identity. This is a one-time setup for your wallet.
                  </p>
               </div>

               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                  <ol className="text-sm text-blue-800 space-y-2">
                     <li>1. Go to the Account page to deploy your identity</li>
                     <li>2. Return here and register identity at the building</li>
                     <li>3. Start interacting with tokenized assets</li>
                  </ol>
               </div>

               <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                     Cancel
                  </Button>

                  <WalkthroughStep
                     guideId="USER_INVESTING_GUIDE"
                     stepIndex={6}
                     title="Aw!"
                     description="Before you can invest, you need to deploy your identity. Click the button below to proceed."
                     side="right"
                  >
                     {({ confirmUserPassedStep }) => (
                        <div onClick={confirmUserPassedStep}>
                           <Link href="/account" className="flex items-center">
                              <Button type="button">
                                 Deploy Identity
                                 <ExternalLink className="w-4 h-4" />
                              </Button>
                           </Link>
                        </div>
                     )}
                  </WalkthroughStep>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
};

export default IdentityNotDeployedModal;
