"use client";
import { isEmpty, orderBy, reject } from "lodash";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface StoreValue {
   registeredGuidesOnThePage: { guideId: string; priority: number }[];
   finishedGuides: string[];
   hideAllGuides: boolean;
   currentGuide: string | null;
   currentStep: number | null;
}
interface StoreAction {
   setCurrentGuide: (guideId: string | null) => void;
   setCurrentStep: (step: number | null) => void;
   finishGuide: (guideId: string) => void;
   setHideAllGuides: (hideAllGuides: boolean) => void;
   registerGuides: (guides: { guideId: string; priority: number }[]) => void;
   unregisterGuide: (guideId: string) => void;
   unregisterGuides: (guides?: { guideId: string; priority: number }[]) => void;
   initializeWalkthrough: () => void | null;
}

export const useWalkthroughStore = create<StoreValue & StoreAction>()(
   persist(
      (set, get) => ({
         registeredGuidesOnThePage: [],
         finishedGuides: [],
         hideAllGuides: false,
         currentGuide: null,
         currentStep: null,

         setCurrentGuide: (guideId) => set({ currentGuide: guideId }),
         setCurrentStep: (step) => set({ currentStep: step }),
         finishGuide: (guideId) =>
            set((state) => ({ finishedGuides: [...state.finishedGuides, guideId] })),
         setHideAllGuides: (hideAllGuides) => set({ hideAllGuides }),

         registerGuides: (guides) =>
            set((state) => ({
               registeredGuidesOnThePage: [...state.registeredGuidesOnThePage, ...guides],
            })),
         unregisterGuide: (guideId) =>
            set((state) => ({
               registeredGuidesOnThePage: state.registeredGuidesOnThePage.filter(
                  (guide) => guide.guideId !== guideId,
               ),
            })),
         unregisterGuides: (guides) =>
            set((state) => ({
               registeredGuidesOnThePage: state.registeredGuidesOnThePage.filter(
                  (guide) => !guides?.some((g) => g.guideId === guide.guideId),
               ),
            })),

         initializeWalkthrough: () => {
            const state = get();
            if (state.hideAllGuides) return null;
            if (isEmpty(state.registeredGuidesOnThePage)) return null;
            if (state.currentGuide !== null) return null;

            const notFinishedGuides = reject(state.registeredGuidesOnThePage, ({ guideId }) =>
               state.finishedGuides.includes(guideId),
            );
            const sortedByPriority = orderBy(notFinishedGuides, "priority", ["asc"]);
            if (!isEmpty(sortedByPriority)) {
               state.setCurrentGuide(sortedByPriority[0].guideId);
            }
         },
      }),
      {
         name: "walkthrough-storage",
         storage: createJSONStorage(() => localStorage),
      },
   ),
);
