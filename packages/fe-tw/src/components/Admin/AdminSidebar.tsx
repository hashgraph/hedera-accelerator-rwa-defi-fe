import {
   Sidebar,
   SidebarContent,
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   useSidebar,
} from "@/components/ui/sidebar";
import { Building2, Slice, Coins } from "lucide-react";
import Link from "next/link";

const ADMIN_LINKS = [
   { title: "Building Management", href: "/admin/buildingmanagement", icon: Building2 },
   { title: "Slice Management", href: "/admin/slicemanagement", icon: Slice },
   { title: "Add Demo USDC", href: "/admin/demo-usdc", icon: Coins },
];

export function AdminSidebar() {
   return (
      <Sidebar>
         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {ADMIN_LINKS.map((item) => (
                        <SidebarMenuItem key={item.title}>
                           <SidebarMenuButton asChild>
                              <Link href={item.href}>
                                 <item.icon />
                                 <span>{item.title}</span>
                              </Link>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                     ))}
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
         </SidebarContent>
      </Sidebar>
   );
}
