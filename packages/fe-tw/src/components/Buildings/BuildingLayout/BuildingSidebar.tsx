"use client";

import IdentityNotDeployedModal from "@/components/Account/IdentityNotDeployedModal";
import RegisterIdentityModal from "@/components/Account/registerIdentityModal";
import { useIdentity } from "@/components/Account/useIdentity";
import {
   Sidebar,
   SidebarContent,
   SidebarGroup,
   SidebarGroupAction,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuAction,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarMenuSub,
   SidebarMenuSubItem,
   useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { WalkthroughStep } from "@/components/Walkthrough";
import { useWalkthroughStore } from "@/components/Walkthrough/WalkthroughStore";
import { useBuildingInfo } from "@/hooks/useBuildingInfo";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import {
   Blocks,
   BookOpenCheck,
   Building2,
   ChartCandlestick,
   HandCoins,
   ReceiptText,
   Slice,
   Vote,
   Asterisk,
   CoinsIcon,
   Droplet,
   ShieldAlert,
   ShieldCheck,
   FileCheck2,
   ClipboardCheck,
   Loader,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { MouseEvent, useEffect, useState } from "react";
import { useAccount } from "wagmi";

const UNPROTECTED_BUILDING_NAV_ITEMS = [
   { title: "Overview", href: "", icon: Building2 },
   { title: "COPE", href: "cope", icon: BookOpenCheck },
   { title: "Audit", href: "audit", icon: ClipboardCheck },
];

export const PROTECTED_BUILDING_NAV_ITEMS = [
   { title: "Trade", href: "trade", icon: ChartCandlestick },
];

const ADVANCED_NAV_ITEMS = [
   { title: "Staking", href: "staking", icon: Blocks },
   { title: "Proposals", href: "proposals", icon: Vote },
   { title: "Slices", href: "slices", icon: Slice },
];

export const OWNER_NAV_ITEMS = [
   { title: "Payments", href: "payments", icon: HandCoins },
   { title: "Expenses", href: "expenses", icon: ReceiptText },
   { title: "Mint", href: "mint", icon: CoinsIcon },
   { title: "Liquidity", href: "liquidity", icon: Droplet },
   { title: "Compliances", href: "compliances", icon: FileCheck2 },
];

export function BuildingSidebar() {
   const currentStep = useWalkthroughStore((state) => state.currentStep);
   const setCurrentStep = useWalkthroughStore((state) => state.setCurrentStep);

   const { id } = useParams();
   const pathname = usePathname();
   const { identityData, isLoading: isIdentityLoading } = useIdentity(id as string);
   const { address: evmAddress } = useAccount();
   const {
      tokenAddress,
      buildingOwnerAddress,
      isLoading: isBuildingInfoLoading,
   } = useBuildingInfo(id as `0x${string}`);
   const { balanceOf, isLoading: isTokenInfoLoading } = useTokenInfo(tokenAddress);

   const [isModalOpened, setIsModalOpened] = useState(false);
   const [isIdentityNotDeployedModalOpened, setIsIdentityNotDeployedModalOpened] = useState(false);

   const isOwner = buildingOwnerAddress === evmAddress;
   const hasTokens = balanceOf !== BigInt(0);

   const handleItemClick = (e: MouseEvent<HTMLAnchorElement>) => {
      if (!identityData.isDeployed) {
         e.preventDefault();
         setIsIdentityNotDeployedModalOpened(true);
         return;
      }
      if (!identityData.isIdentityRegistered) {
         e.preventDefault();
         setIsModalOpened(true);
      }
   };

   useEffect(() => {
      if (currentStep === 5) {
         if (identityData.isDeployed && identityData.isIdentityRegistered) {
            setCurrentStep(10);
         } else if (identityData.isDeployed) {
            setCurrentStep(8);
         }
      } else if (currentStep === 8 && identityData.isIdentityRegistered) {
         setCurrentStep(10);
      }
   }, [currentStep, setCurrentStep]);

   return (
      <Sidebar>
         <SidebarContent>
            <SidebarGroup>
               <SidebarMenu>
                  {UNPROTECTED_BUILDING_NAV_ITEMS.map((item) => (
                     <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                           className="text-sm"
                           asChild
                           isActive={
                              item.href === ""
                                 ? !pathname.includes(`${id}/`)
                                 : pathname.includes(item.href)
                           }
                        >
                           <Link href={`/building/${id}/${item.href}`}>
                              <item.icon />
                              <span>{item.title}</span>
                           </Link>
                        </SidebarMenuButton>
                     </SidebarMenuItem>
                  ))}
               </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
               <SidebarGroupLabel>Invest</SidebarGroupLabel>
               <SidebarGroupAction>
                  {!isIdentityLoading && !identityData.isIdentityRegistered && (
                     <ShieldAlert className="text-orange-600" />
                  )}
               </SidebarGroupAction>
               <SidebarGroupContent>
                  <SidebarMenuSub>
                     {PROTECTED_BUILDING_NAV_ITEMS.map((item) => {
                        if (!identityData.isDeployed && item.title === "Trade") {
                           return (
                              <WalkthroughStep
                                 guideId="USER_INVESTING_GUIDE"
                                 stepIndex={5}
                                 title="We are getting closer!"
                                 description="Now let's try to invest in the building. You can do it by clicking on the 'Trade' button."
                                 side="right"
                              >
                                 {({ confirmUserPassedStep }) => (
                                    <SidebarMenuSubItem key={item.title}>
                                       <SidebarMenuButton
                                          className="text-md"
                                          asChild
                                          isActive={pathname.includes(item.href)}
                                       >
                                          <Link
                                             href={`/building/${id}/${item.href}`}
                                             onClick={(e) => {
                                                handleItemClick(e);
                                                confirmUserPassedStep();
                                             }}
                                          >
                                             <item.icon />
                                             <span>{item.title}</span>
                                          </Link>
                                       </SidebarMenuButton>
                                    </SidebarMenuSubItem>
                                 )}
                              </WalkthroughStep>
                           );
                        }

                        if (!identityData.isIdentityRegistered && item.title === "Trade") {
                           return (
                              <WalkthroughStep
                                 guideId="USER_INVESTING_GUIDE"
                                 stepIndex={8}
                                 title="We are getting closer!"
                                 description="Now we need to register your identity at the building. Click the button to proceed."
                                 side="right"
                              >
                                 {({ confirmUserPassedStep }) => (
                                    <SidebarMenuButton
                                       className="text-md"
                                       asChild
                                       isActive={pathname.includes(item.href)}
                                    >
                                       <Link
                                          href={`/building/${id}/${item.href}`}
                                          onClick={(e) => {
                                             handleItemClick(e);
                                             confirmUserPassedStep();
                                          }}
                                       >
                                          <item.icon />
                                          <span>{item.title}</span>
                                       </Link>
                                    </SidebarMenuButton>
                                 )}
                              </WalkthroughStep>
                           );
                        }

                        if (
                           identityData.isIdentityRegistered &&
                           identityData.isDeployed &&
                           item.title === "Trade"
                        ) {
                           return (
                              <WalkthroughStep
                                 guideId="USER_INVESTING_GUIDE"
                                 stepIndex={10}
                                 title="Now we can properly invest!"
                                 description="Hit 'Trade' to start investing in this building."
                                 side="right"
                              >
                                 {({ confirmUserPassedStep }) => (
                                    <SidebarMenuButton
                                       className="text-md"
                                       asChild
                                       isActive={pathname.includes(item.href)}
                                    >
                                       <Link
                                          href={`/building/${id}/${item.href}`}
                                          onClick={(e) => {
                                             handleItemClick(e);
                                             confirmUserPassedStep();
                                          }}
                                       >
                                          <item.icon />
                                          <span>{item.title}</span>
                                       </Link>
                                    </SidebarMenuButton>
                                 )}
                              </WalkthroughStep>
                           );
                        }

                        return (
                           <SidebarMenuSubItem key={item.title}>
                              <SidebarMenuButton
                                 className="text-md"
                                 asChild
                                 isActive={pathname.includes(item.href)}
                              >
                                 <Link
                                    href={`/building/${id}/${item.href}`}
                                    onClick={(e) => {
                                       handleItemClick(e);
                                    }}
                                 >
                                    <item.icon />
                                    <span>{item.title}</span>
                                 </Link>
                              </SidebarMenuButton>
                           </SidebarMenuSubItem>
                        );
                     })}
                  </SidebarMenuSub>
               </SidebarGroupContent>
            </SidebarGroup>
            {isTokenInfoLoading || isBuildingInfoLoading ? (
               <div className="space-y-2 ml-5">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[50px] ml-5" />
               </div>
            ) : (
               <>
                  {hasTokens && (
                     <SidebarGroup>
                        <SidebarGroupLabel>Advanced</SidebarGroupLabel>
                        <SidebarGroupAction>
                           {!identityData.isIdentityRegistered && (
                              <ShieldAlert className="text-orange-600" />
                           )}
                        </SidebarGroupAction>
                        <SidebarGroupContent>
                           <SidebarMenuSub>
                              {ADVANCED_NAV_ITEMS.map((item) => (
                                 <SidebarMenuSubItem key={item.title}>
                                    <SidebarMenuButton
                                       className="text-md"
                                       asChild
                                       isActive={pathname.includes(item.href)}
                                    >
                                       <Link
                                          href={`/building/${id}/${item.href}`}
                                          onClick={(e) => handleItemClick(e)}
                                       >
                                          <item.icon />
                                          <span>{item.title}</span>
                                       </Link>
                                    </SidebarMenuButton>
                                 </SidebarMenuSubItem>
                              ))}
                           </SidebarMenuSub>
                        </SidebarGroupContent>
                     </SidebarGroup>
                  )}
                  {isOwner && (
                     <SidebarGroup>
                        <SidebarGroupLabel>Owner</SidebarGroupLabel>
                        <SidebarGroupContent>
                           <SidebarMenuSub>
                              <SidebarMenu>
                                 {OWNER_NAV_ITEMS.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                       <SidebarMenuButton
                                          className="text-sm"
                                          asChild
                                          isActive={pathname.includes(item.href)}
                                       >
                                          <Link href={`/building/${id}/${item.href}`}>
                                             <item.icon />
                                             <span>{item.title}</span>
                                          </Link>
                                       </SidebarMenuButton>
                                    </SidebarMenuItem>
                                 ))}
                              </SidebarMenu>
                           </SidebarMenuSub>
                        </SidebarGroupContent>
                     </SidebarGroup>
                  )}
               </>
            )}
         </SidebarContent>

         <RegisterIdentityModal
            buildingAddress={id as string}
            isModalOpened={isModalOpened}
            onOpenChange={setIsModalOpened}
         />

         <IdentityNotDeployedModal
            isModalOpened={isIdentityNotDeployedModalOpened}
            onOpenChange={setIsIdentityNotDeployedModalOpened}
         />
      </Sidebar>
   );
}
