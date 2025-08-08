"use client";
import { memo, ReactNode, useCallback, useEffect } from "react";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import { PopoverContent, PopoverPortal } from "@radix-ui/react-popover";
import { cx } from "class-variance-authority";
import { useWalkthroughStore } from "./WalkthroughStore";
import { isFunction } from "lodash";
import { createPortal } from "react-dom";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface WalkthroughStepProps {
   children:
      | ReactNode
      | ((props: {
           confirmUserPassedStep: () => void;
           confirmUserFinishedGuide: () => void;
        }) => ReactNode);
   className?: string;
   guideId: string;
   stepIndex: number;
   title: string;
   description: string | ReactNode;
   side?: "top" | "right" | "bottom" | "left";
   showConfirmButton?: boolean;
}

export const WalkthroughStep = memo(
   ({
      children,
      className,
      guideId,
      stepIndex,
      title,
      description,
      side,
      showConfirmButton,
   }: WalkthroughStepProps) => {
      const currentStep = useWalkthroughStore((state) => state.currentStep);
      const currentGuide = useWalkthroughStore((state) => state.currentGuide);
      const setCurrentStep = useWalkthroughStore((state) => state.setCurrentStep);
      const setCurrentGuide = useWalkthroughStore((state) => state.setCurrentGuide);
      const finishGuide = useWalkthroughStore((state) => state.finishGuide);

      const isHighlighted = currentStep === stepIndex && currentGuide === guideId;

      const handleStepPassed = useCallback(() => {
         if (currentStep === stepIndex) {
            setCurrentStep(stepIndex + 1);
         }
      }, [currentStep, stepIndex, setCurrentStep]);

      const handleConfirmFinishedGuide = useCallback(() => {
         if (currentGuide === guideId && currentStep === stepIndex) {
            finishGuide(guideId);
            setCurrentGuide(null);
            setCurrentStep(null);
         }
      }, [currentGuide, currentStep, guideId, setCurrentGuide, setCurrentStep]);

      const handleStepBack = useCallback(() => {
         if (currentStep === stepIndex && stepIndex > 0) {
            setCurrentStep(stepIndex - 1);
         }
      }, [currentStep, stepIndex, setCurrentStep]);

      const handleStepForward = useCallback(() => {
         if (currentStep === stepIndex) {
            setCurrentStep(stepIndex + 1);
         }
      }, [currentStep, stepIndex, setCurrentStep]);

      const handleFinishGuide = useCallback(() => {
         finishGuide(guideId);
         setCurrentGuide(null);
         setCurrentStep(null);
      }, [finishGuide, guideId, setCurrentGuide, setCurrentStep]);

      return (
         <div className={cx("relative", className)}>
            {isHighlighted && (
               <div
                  className={cx(
                     "pointer-events-none outline-2 outline-indigo-500 absolute w-full h-full animate-ping rounded-md z-50",
                  )}
               />
            )}
            <Popover open={isHighlighted}>
               <PopoverAnchor className={cx(isHighlighted ? "relative z-190" : "", className)}>
                  {isFunction(children)
                     ? children({
                          confirmUserPassedStep: handleStepPassed,
                          confirmUserFinishedGuide: handleConfirmFinishedGuide,
                       })
                     : children}
               </PopoverAnchor>
               <PopoverPortal>
                  <PopoverContent className="z-[200]" sideOffset={5} side={side}>
                     <div className="animate-fade-in-bottom bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-xl border border-slate-200 max-w-sm relative">
                        <Button
                           onClick={handleFinishGuide}
                           className="absolute top-3 right-3"
                           variant="ghost"
                           aria-label="Close guide"
                        >
                           <X size={16} className="text-slate-500" />
                        </Button>

                        <div className="pr-6">
                           <h3 className="font-bold text-lg text-slate-800 mb-2">{title}</h3>
                           <div className="text-sm text-slate-600 mb-6 leading-relaxed">
                              {description}
                           </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                           <div className="flex gap-2">
                              {showConfirmButton && (
                                 <Button
                                    onClick={handleStepPassed}
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                 >
                                    Got it!
                                 </Button>
                              )}
                           </div>
                        </div>
                     </div>
                  </PopoverContent>
               </PopoverPortal>
            </Popover>
         </div>
      );
   },
);
