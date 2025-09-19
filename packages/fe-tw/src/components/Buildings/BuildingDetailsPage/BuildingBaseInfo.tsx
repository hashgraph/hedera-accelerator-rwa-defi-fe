"use client";

import { toast } from "sonner";
import { ReusableAvatar } from "@/components/Avatars/ReusableAvatar";
import type { BuildingData } from "@/types/erc3643/types";
import moment from "moment";
import { CheckCheck, TriangleAlert, Fingerprint } from "lucide-react";
import { getBuildingStateSummary, useBuildingInfo } from "@/hooks/useBuildingInfo";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { every, map, startCase } from "lodash";
import { Button } from "@/components/ui/button";
import { addTokenToMM } from "@/services/erc20Service";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { useAccount } from "wagmi";

export const BuildingBaseInfo = ({
   id,
   imageUrl,
   title,
   purchasedAt,
   description,
}: BuildingData) => {
   const buildingInfo = useBuildingInfo(id as string);
   const {
      name: buildingTokenName,
      symbol: buildingTokenSymbol,
      decimals: buildingTokenDecimals,
   } = useTokenInfo(buildingInfo.tokenAddress);
   const buildingState = getBuildingStateSummary(buildingInfo);
   const buildingComplete = every(buildingState, (value) => value);
   const { isConnected: isMetamaskConnected } = useAccount();

   const handleAddTokensToMM = async () => {
      if (isMetamaskConnected) {
         try {
            await addTokenToMM({
               tokenDecimals: buildingTokenDecimals?.toString(),
               tokenAddress: buildingInfo.tokenAddress!,
               tokenSymbol: buildingTokenSymbol,
               tokenType: "ERC20",
               tokenAvatar: imageUrl,
            });

            toast.success("Token added successfully");
         } catch (err) {
            toast.error(`Error during adding tokens ${(err as Error)?.message ?? ""}`);
         }
      }
   };

   return (
      <div className="flex flex-col md:flex-row bg-purple-50 px-6 sm:px-8 md:px-10 py-6 rounded-lg">
         <ReusableAvatar size="extra-lg" imageSource={imageUrl} imageAlt={title} isRounded />

         <div className="flex flex-col mt-6 md:mt-0 md:ml-10">
            <article className="prose">
               <div className="flex flex-row items-baseline gap-2">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{title}</h1>

                  {!buildingInfo.isLoading && (
                     <HoverCard>
                        <HoverCardTrigger>
                           {buildingComplete ? (
                              <CheckCheck className="text-violet-700 cursor-pointer" />
                           ) : (
                              <TriangleAlert className="text-orange-700 cursor-pointer" />
                           )}
                        </HoverCardTrigger>
                        <HoverCardContent>
                           <h3>Building setup is {buildingComplete ? "" : "not"} completed.</h3>
                           <ul className="mt-4">
                              {map(buildingState, (value, key) => (
                                 <li
                                    className="grid grid-cols-[1fr_auto] gap-2 items-center text-sm"
                                    key={key}
                                 >
                                    <span>{startCase(key)}</span>
                                    {value ? (
                                       <CheckCheck size={16} className="text-violet-500" />
                                    ) : (
                                       <TriangleAlert size={16} className="text-orange-500" />
                                    )}
                                 </li>
                              ))}
                           </ul>
                        </HoverCardContent>
                     </HoverCard>
                  )}
               </div>
            </article>
            {description && (
               <article className="mt-4">
                  {description.split("\\").map((line) => (
                     <p className="mt-2 text-sm sm:text-base" key={line}>
                        {line}
                     </p>
                  ))}
               </article>
            )}
            <Button
               className="mt-4"
               variant="default"
               onClick={handleAddTokensToMM}
               disabled={!isMetamaskConnected || !buildingInfo.tokenAddress}
            >
               Add <span className="font-bold">{buildingTokenName}</span> to MM
               <Fingerprint className="cursor-pointer" />
            </Button>
         </div>
      </div>
   );
};
