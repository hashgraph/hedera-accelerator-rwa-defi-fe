"use client";
import { isEmpty, reject, orderBy, some } from "lodash";
import { useEffect, memo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useWalkthroughStore } from "./WalkthroughStore";
import { Button } from "../ui/button";
import { walkthroughBarrier } from "./WalktroughSyncBarrier";

type IProps = { guideId: string; priority: number }[];

export const useWalkthrough = (guides?: IProps) => {
   const currentGuide = useWalkthroughStore((state) => state.currentGuide);
   const currentStep = useWalkthroughStore((state) => state.currentStep);
   const setCurrentGuide = useWalkthroughStore((state) => state.setCurrentGuide);
   const finishGuide = useWalkthroughStore((state) => state.finishGuide);
   const setCurrentStep = useWalkthroughStore((state) => state.setCurrentStep);
   const setHideAllGuides = useWalkthroughStore((state) => state.setHideAllGuides);
   const registerGuides = useWalkthroughStore((state) => state.registerGuides);
   const unregisterGuides = useWalkthroughStore((state) => state.unregisterGuides);

   const componentIdRef = useRef(Symbol("walkthrough-component"));
   const readyCallbackRef = useRef<(() => void) | null>(null);

   useEffect(() => {
      if (!isEmpty(guides) && guides) {
         readyCallbackRef.current = walkthroughBarrier.register(componentIdRef.current);

         registerGuides(guides);

         requestAnimationFrame(() => {
            if (readyCallbackRef.current) {
               readyCallbackRef.current();
            }
         });
      }

      return () => {
         if (guides) {
            unregisterGuides(guides);
         }
         walkthroughBarrier.unregister(componentIdRef.current);
      };
   }, [guides, registerGuides, unregisterGuides]);

   const getRegistrationFunction = () => {
      return () => {
         if (readyCallbackRef.current) {
            readyCallbackRef.current();
         }
      };
   };

   const confirmUserPassedStep = (step: number, guideId?: string) => {
      if (currentGuide === guideId && currentStep === step) {
         setCurrentStep(step + 1);
      }
   };

   const confirmUserFinishedGuide = (guideId: string) => {
      if (currentGuide === guideId) {
         finishGuide(guideId);
         setCurrentGuide(null);
         setCurrentStep(null);
      }
   };

   return {
      PromptCardProps: {
         guides,
         currentGuide,
         currentStep,
         setCurrentStep,
         confirmUserFinishedGuide,
         setHideAllGuides,
      },
      currentGuide,
      currentStep,
      confirmUserPassedStep,
      confirmUserFinishedGuide,
      registerComponent: getRegistrationFunction(),
   };
};
