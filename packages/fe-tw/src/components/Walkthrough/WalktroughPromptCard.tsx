import { some } from "lodash";
import { memo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";

interface IProps {
   title?: string;
   description?: string;
   currentGuide: string | null;
   guides?: { guideId: string; priority: number }[];
   currentStep: number | null;
   setCurrentStep: (step: number) => void;
   confirmUserFinishedGuide: (guideId: string) => void;
   setHideAllGuides: (hideAllGuides: boolean) => void;
}

export const WalkthroughPromptCard = memo(
   ({
      title,
      description,
      currentGuide,
      guides,
      currentStep,
      setCurrentStep,
      confirmUserFinishedGuide,
      setHideAllGuides,
   }: IProps) => {
      if (
         currentStep !== null ||
         currentGuide === null ||
         !some(guides, { guideId: currentGuide })
      ) {
         return null;
      }

      return (
         <Card className="z-100 fixed right-2 bottom-2 max-w-xs">
            <CardHeader>
               <CardTitle>{title}</CardTitle>
               <CardDescription className="mt-2">{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 p-6 pt-0">
               <Button onClick={() => setCurrentStep(1)}>Yes</Button>
               <Button onClick={() => confirmUserFinishedGuide(currentGuide)}>No</Button>
               <Button variant="destructive" onClick={() => setHideAllGuides(true)}>
                  No, for all
               </Button>
            </CardContent>
         </Card>
      );
   },
);
