"use client";
import { memo, ReactNode, useCallback, useEffect, useState } from "react";
import { Popover, PopoverAnchor } from "@/components/ui/popover";
import { PopoverContent, PopoverPortal } from "@radix-ui/react-popover";
import { cx } from "class-variance-authority";
import { useWalkthroughStore } from "./WalkthroughStore";
import { find, isEmpty, isFunction, matches } from "lodash";
import { createPortal } from "react-dom";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface WalkthroughStepProps {
   children:
      | ReactNode
      | ((props: {
           confirmUserPassedStep: () => void;
           confirmUserFinishedGuide: () => void;
        }) => ReactNode);
   className?: string;
   steps?: WalkthroughStep[];
   guideId?: string;
   stepIndex?: number;
   title?: string;
   description?: string | ReactNode;
   side?: "top" | "right" | "bottom" | "left";
   showConfirmButton?: boolean;
}

export interface WalkthroughStep {
   guideId: string;
   stepIndex: number;
   title: string;
   description: string;
}

export const WalkthroughStep = memo(
   ({
      children,
      className,
      steps,
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

      const isHighlighted = isEmpty(steps)
         ? currentStep === stepIndex && currentGuide === guideId
         : find(steps, matches({ guideId: currentGuide, stepIndex: currentStep }));

      const [showPing, setShowPing] = useState(false);

      useEffect(() => {
         if (isHighlighted) {
            setShowPing(true);
            const t = setTimeout(() => setShowPing(false), 3000);
            return () => clearTimeout(t);
         }
         setShowPing(false);
      }, [isHighlighted]);

      const handleStepPassed = useCallback(() => {
         if (!isEmpty(steps)) {
            const currentStepInfo = find(
               steps,
               matches({ guideId: currentGuide, stepIndex: currentStep }),
            );
            if (currentStepInfo) {
               setCurrentStep(currentStepInfo.stepIndex + 1);
            }
         } else if (guideId === currentGuide && currentStep === stepIndex) {
            setCurrentStep(stepIndex + 1);
         }
      }, [steps, currentGuide, currentStep, stepIndex, setCurrentStep]);

      const handleConfirmFinishedGuide = useCallback(() => {
         if (!isEmpty(steps)) {
            const currentStepInfo = find(
               steps,
               matches({ guideId: currentGuide, stepIndex: currentStep }),
            );
            if (currentStepInfo) {
               finishGuide(currentStepInfo.guideId);
               setCurrentGuide(null);
               setCurrentStep(null);
            }
         } else if (currentGuide === guideId && currentStep === stepIndex) {
            finishGuide(guideId);
            setCurrentGuide(null);
            setCurrentStep(null);
         }
      }, [currentGuide, currentStep, guideId, setCurrentGuide, setCurrentStep]);

      const currentGuideInfo = find(
         steps,
         matches({
            guideId: currentGuide,
            stepIndex: currentStep,
         }),
      );

      return (
         <div className={cx("relative", className)}>
            {Boolean(isHighlighted) && (
               <div
                  className={cx(
                     "pointer-events-none absolute inset-0 rounded-md z-50 ",
                     showPing &&
                        "animate-ping outline-2 outline-indigo-500 [animation-iteration-count:3]",
                  )}
               />
            )}
            <Popover open={Boolean(isHighlighted)}>
               <PopoverAnchor className={cx(isHighlighted ? "relative z-190" : "", className)}>
                  {isFunction(children)
                     ? children({
                          confirmUserPassedStep: handleStepPassed,
                          confirmUserFinishedGuide: handleConfirmFinishedGuide,
                       })
                     : children}
               </PopoverAnchor>
               <PopoverPortal>
                  <PopoverContent
                     onOpenAutoFocus={(e) => e.preventDefault()}
                     className="z-[200]"
                     sideOffset={5}
                     side={side}
                  >
                     <div className="animate-fade-in-bottom bg-gradient-to-br from-white to-slate-50 p-6 rounded-xl shadow-xl border border-slate-200 max-w-sm relative">
                        <Button
                           onClick={handleConfirmFinishedGuide}
                           className="absolute top-3 right-3"
                           variant="ghost"
                           aria-label="Close guide"
                        >
                           <X size={16} className="text-slate-500" />
                        </Button>

                        <div className="pr-6">
                           <h3 className="font-bold text-lg text-slate-800 mb-2">
                              {currentGuideInfo ? currentGuideInfo.title : title}
                           </h3>
                           <div className="text-sm text-slate-600 mb-6 leading-relaxed">
                              {currentGuideInfo ? currentGuideInfo.description : description}
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
