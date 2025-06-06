"use client";

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
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const UNPROTECTED_BUILDING_NAV_ITEMS = [
   { title: "Overview", href: "", icon: Building2 },
   { title: "COPE", href: "cope", icon: BookOpenCheck },
];

export const PROTECTED_BUILDING_NAV_ITEMS = [
   { title: "Staking", href: "staking", icon: Blocks },
   { title: "Proposals", href: "proposals", icon: Vote },
   { title: "Slices", href: "slices", icon: Slice },
   { title: "Payments", href: "payments", icon: HandCoins },
   { title: "Expenses", href: "expenses", icon: ReceiptText },

   { title: "Mint", href: "mint", icon: CoinsIcon },
   { title: "Trade", href: "trade", icon: ChartCandlestick },
   { title: "Liquidity", href: "liquidity", icon: Droplet },
];
export function BuildingSidebar() {
   const { id } = useParams();
   const { identityData } = useIdentity();
   const [isModalOpened, setIsModalOpened] = useState(false);

   const handleItemClick = (e, item) => {
      if (!identityData.isDeployed) {
         e.preventDefault();
         setIsModalOpened(true);
      }
   };

   return (
      <Sidebar>
         <SidebarContent>
            <SidebarGroup>
               <SidebarMenu>
                  {UNPROTECTED_BUILDING_NAV_ITEMS.map((item) => (
                     <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton className="text-sm" asChild>
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
               <SidebarGroupLabel>Identity Required</SidebarGroupLabel>
               <SidebarGroupAction>
                  {identityData.isDeployed ? (
                     <ShieldCheck className="text-indigo-400" />
                  ) : (
                     <ShieldAlert className="text-orange-600" />
                  )}
               </SidebarGroupAction>
               <SidebarGroupContent>
                  <SidebarMenuSub>
                     {PROTECTED_BUILDING_NAV_ITEMS.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                           <SidebarMenuButton className="text-md" asChild>
                              <Link
                                 href={`/building/${id}/${item.href}`}
                                 onClick={(e) => handleItemClick(e, item)}
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
         </SidebarContent>

         <RegisterIdentityModal isModalOpened={isModalOpened} onOpenChange={setIsModalOpened} />
      </Sidebar>
   );
}
