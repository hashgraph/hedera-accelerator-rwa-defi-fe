"use client";
import { memo } from "react";
import { WalkthroughStep, WalkthroughStepProps } from "./WalkthroughStep";
import { find, isEmpty } from "lodash";
import { ClassNames } from "@emotion/react";

interface ConditionalWalkthroughStepProps extends Omit<WalkthroughStepProps, "steps"> {
   children: (props: {
      confirmUserPassedStep: () => void;
      confirmUserFinishedGuide: () => void;
   }) => React.ReactNode;
   steps: (WalkthroughStep & { enabled: boolean })[];
   className?: string;
}

export const ConditionalWalkthroughStep = memo(
   ({ steps, children, className, ...walkthroughProps }: ConditionalWalkthroughStepProps) => {
      const enabledStep = find(steps, "enabled");

      if (!enabledStep) {
         return (
            <div className={className}>
               {children({
                  confirmUserPassedStep: () => {},
                  confirmUserFinishedGuide: () => {},
               })}
            </div>
         );
      }

      return (
         <WalkthroughStep {...walkthroughProps} steps={[enabledStep]} className={className}>
            {children}
         </WalkthroughStep>
      );
   },
);

ConditionalWalkthroughStep.displayName = "ConditionalWalkthroughStep";
