"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Lock, Vote, DollarSign, MessageCircleQuestion } from "lucide-react";
import { Button } from "../ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

const WhyStake = () => {
   const [selectedAccordion, setSelectedAccordion] = useLocalStorage<string | undefined>(
      "isStakingInfoClosed",
      undefined,
   );

   const benefits = [
      {
         icon: <Lock className="h-5 w-5 text-blue-600" />,
         title: "Lock & Stabilize",
         description:
            "By staking, you commit to not selling your tokens for a period. This helps stabilize the token price and shows long-term confidence in the building's success.",
      },
      {
         icon: <Vote className="h-5 w-5 text-green-600" />,
         title: "Have Your Say",
         description:
            "Get voting power in building decisions - from renovations to profit distribution. Your stake gives you a voice in how the property is managed.",
      },
      {
         icon: <DollarSign className="h-5 w-5 text-purple-600" />,
         title: "Earn Passive Income",
         description:
            "Think of it like a bank deposit, but better! Earn rewards from the building's income while your tokens potentially grow in value too.",
      },
   ];

   return (
      <Card className="mt-6 border-l-4 border-l-blue-500">
         <CardContent className="pt-2 pb-2">
            <Accordion
               type="single"
               collapsible
               value={selectedAccordion}
               onValueChange={(value) => setSelectedAccordion(value)}
            >
               <AccordionItem value="staking-info">
                  <AccordionTrigger>
                     <div className="flex items-center gap-2">Why Should You Stake?</div>
                  </AccordionTrigger>
                  <AccordionContent>
                     {benefits.map((benefit, index) => (
                        <div
                           key={index}
                           className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
                        >
                           <div className="flex-shrink-0 mt-0.5">{benefit.icon}</div>
                           <div>
                              <h4 className="font-medium text-sm text-slate-900 mb-1">
                                 {benefit.title}
                              </h4>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                 {benefit.description}
                              </p>
                           </div>
                        </div>
                     ))}
                     <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800">
                           <strong>New to staking?</strong> Don't worry! You can start small and
                           unstake anytime. Your tokens remain yours - you're just putting them to
                           work to earn more.
                        </p>
                     </div>
                  </AccordionContent>
               </AccordionItem>
            </Accordion>
         </CardContent>
      </Card>
   );
};

export default WhyStake;
