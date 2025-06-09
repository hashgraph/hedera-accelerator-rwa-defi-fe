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
import { Building2, FileStack, Slice } from "lucide-react";
import Link from "next/link";

const ADMIN_LINKS = [
   { title: "Building Management", href: "/admin/buildingmanagement", icon: Building2 },
   { title: "Slice Management", href: "/admin/slicemanagement", icon: Slice },
   { title: "Audit Management", href: "/admin/auditmanagement", icon: FileStack },
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
