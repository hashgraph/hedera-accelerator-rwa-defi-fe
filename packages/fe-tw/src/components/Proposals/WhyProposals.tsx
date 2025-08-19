"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Users, Vote, Gavel, MessageCircleQuestion, Shield, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

const WhyProposals = () => {
   const [selectedAccordion, setSelectedAccordion] = useLocalStorage<string | undefined>(
      "isProposalInfoClosed",
      "proposal-info",
   );

   const benefits = [
      {
         icon: <Users className="h-5 w-5 text-blue-600" />,
         title: "Decentralized Governance",
         description:
            "DAO (Decentralized Autonomous Organization) means no single person controls decisions. Every staked token gets a voice in how the property is managed and profits are distributed.",
      },
      {
         icon: <TrendingUp className="h-5 w-5 text-orange-600" />,
         title: "Direct Impact on Returns",
         description:
            "Your votes directly affect property value and rental income. Smart decisions on renovations, tenant management, and expenses can increase your investment returns over time.",
      },
      {
         icon: <Shield className="h-5 w-5 text-purple-600" />,
         title: "Transparent & Secure",
         description:
            "All proposals and votes are recorded on the blockchain, creating an immutable and transparent record. Smart contracts automatically execute approved decisions.",
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
               <AccordionItem value="proposal-info">
                  <AccordionTrigger>
                     <div className="flex items-center gap-2">What is DAO Governance?</div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-2">
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
                           <strong>Ready to participate?</strong> Every vote matters! Start by
                           reviewing active proposals and cast your vote to help shape the future of
                           this property. Your voice drives the decisions.
                        </p>
                     </div>
                  </AccordionContent>
               </AccordionItem>
            </Accordion>
         </CardContent>
      </Card>
   );
};

export default WhyProposals;
