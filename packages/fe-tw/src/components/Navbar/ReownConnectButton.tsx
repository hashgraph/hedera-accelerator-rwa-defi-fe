import { useAccountEffect } from "wagmi";
import { useWalkthrough, WalkthroughPromptCard, WalkthroughStep } from "../Walkthrough";

const ReownConnectButton = ({ balance = "false", ...rest }) => {
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
            {({ confirmUserPassedStep }) => (
               <div onClick={confirmUserPassedStep}>
                  {/* @ts-ignore */}
                  <appkit-button balance={balance} {...rest} />
               </div>
            )}
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
