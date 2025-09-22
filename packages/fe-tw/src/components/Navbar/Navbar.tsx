"use client";

import Link from "next/link";
import React, { type ReactNode } from "react";
import {
   NavigationMenu,
   NavigationMenuContent,
   NavigationMenuItem,
   NavigationMenuLink,
   NavigationMenuList,
   NavigationMenuTrigger,
   navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Building, Earth, Radar, Slice, Menu, Coins } from "lucide-react";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import {
   Drawer,
   DrawerTrigger,
   DrawerContent,
   DrawerHeader,
   DrawerClose,
   DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useWalkthrough, WalkthroughPromptCard, WalkthroughStep } from "../Walkthrough";
import { useAccount } from "wagmi";
import ReownConnectButton from "./ReownConnectButton";

export function Navbar() {
   const { currentGuide, PromptCardProps } = useWalkthrough([
      { guideId: "ADMIN_BUILDING_GUIDE", priority: 2 },
      { guideId: "USER_INVESTING_GUIDE", priority: 3 },
      { guideId: "USER_SLICE_GUIDE", priority: 4 },
   ]);
   const { isSidebarTriggerVisible } = useSidebar();
   const [isOpen, setIsOpen] = React.useState(false);
   const { address, isConnected } = useAccount();

   return (
      <>
         <div className="min-w-[100vw] flex justify-end p-4 border-b border-base-200 items-center sticky top-0 z-50 bg-white">
            {isSidebarTriggerVisible && <SidebarTrigger className="md:hidden" />}
            <Link href="/" className="mr-auto flex gap-1 items-center">
               {!isSidebarTriggerVisible && <Earth />}
               <p className="italic font-bold text-xl text-violet-700">RWA</p>
            </Link>

            <div className="md:hidden">
               <Drawer open={isOpen} onOpenChange={setIsOpen}>
                  <DrawerTrigger asChild>
                     <Menu className="cursor-pointer" size={24} />
                  </DrawerTrigger>
                  <DrawerContent>
                     <DrawerHeader>
                        <DrawerTitle>Menu</DrawerTitle>
                     </DrawerHeader>
                     <div className="flex flex-col gap-4 p-4">
                        <Link
                           href="/explorer"
                           className="flex items-center gap-2"
                           onClick={() => setIsOpen(false)}
                        >
                           <Radar /> Featured
                        </Link>
                        <Link
                           href="/building"
                           className="flex items-center gap-2"
                           onClick={() => setIsOpen(false)}
                        >
                           <Building /> Buildings
                        </Link>
                        <Link
                           href="/slices"
                           className="flex items-center gap-2"
                           onClick={() => setIsOpen(false)}
                        >
                           <Slice /> Slices
                        </Link>
                        <Separator />
                        <Link href="/faq" onClick={() => setIsOpen(false)}>
                           FAQ
                        </Link>
                        <Link href="/admin" onClick={() => setIsOpen(false)}>
                           Admin
                        </Link>
                     </div>
                  </DrawerContent>
               </Drawer>
            </div>

            <div className="hidden md:flex">
               <SidebarTrigger />
               <NavigationMenu>
                  <NavigationMenuList className="gap-3">
                     <NavigationMenuItem>
                        <WalkthroughStep
                           guideId={"USER_INVESTING_GUIDE"}
                           stepIndex={1}
                           title="Hover to see available investment options"
                           description="Here you can explore our investment opportunities"
                        >
                           {({ confirmUserPassedStep }) => (
                              <NavigationMenuTrigger onMouseEnter={confirmUserPassedStep}>
                                 Invest
                              </NavigationMenuTrigger>
                           )}
                        </WalkthroughStep>
                        <NavigationMenuContent asChild data-state="open">
                           <ul className="grid w-[400px] gap-2 p-1 md:w-[300px] md:grid-cols-1 lg:w-[400px]">
                              <ListItem icon={<Radar />} title="Featured" href="/explorer">
                                 Dive into the world of our picks for You to explore
                              </ListItem>
                              <WalkthroughStep
                                 guideId={"USER_INVESTING_GUIDE"}
                                 stepIndex={2}
                                 title="These are available options"
                                 description="Let's start with simple one - invest into buildings"
                                 side="left"
                              >
                                 {({ confirmUserPassedStep }) => (
                                    <ListItem
                                       icon={<Building />}
                                       title="Buildings"
                                       href="/building"
                                       onClick={confirmUserPassedStep}
                                    >
                                       Open the door to the world of tokenized buildings
                                    </ListItem>
                                 )}
                              </WalkthroughStep>
                              <ListItem icon={<Slice />} title="Slices" href="/slices">
                                 Optimize your portfolio with our building slices
                              </ListItem>
                           </ul>
                        </NavigationMenuContent>
                     </NavigationMenuItem>
                     <NavigationMenuItem>
                        <WalkthroughStep
                           side="bottom"
                           steps={[
                              {
                                 guideId: "ADMIN_BUILDING_GUIDE",
                                 stepIndex: 1,
                                 title: "Start creating a tokenized building",
                                 description:
                                    "Hover here to open the Create menu and begin the building tokenization walkthrough.",
                              },
                              {
                                 guideId: "USER_LOGIN_FLOW",
                                 stepIndex: 2,
                                 title: "Let's get USDC",
                                 description:
                                    "Hover on this panel and select 'Get Demo USDC' to mint test USDC tokens for development and testing.",
                              },
                              {
                                 guideId: "USER_SLICE_GUIDE",
                                 stepIndex: 1,
                                 title: "Let's create a slice!",
                                 description:
                                    "Slices are like ETFs for real estate - they let you bundle multiple buildings into a single investment product. Hover here to start creating your slice.",
                              },
                           ]}
                        >
                           {({ confirmUserPassedStep }) => (
                              <NavigationMenuTrigger
                                 className={navigationMenuTriggerStyle()}
                                 onMouseEnter={() => {
                                    confirmUserPassedStep();
                                 }}
                              >
                                 Create
                              </NavigationMenuTrigger>
                           )}
                        </WalkthroughStep>
                        <NavigationMenuContent asChild data-state="open">
                           <ul className="grid w-[400px] gap-2 p-1 md:w-[300px] md:grid-cols-1 lg:w-[400px]">
                              <WalkthroughStep
                                 guideId="ADMIN_BUILDING_GUIDE"
                                 stepIndex={2}
                                 title="Go to Building Management"
                                 description="Click here to open the Building Management page where you will configure metadata, token settings, and treasury reserve."
                                 side="left"
                              >
                                 {({ confirmUserPassedStep }) => (
                                    <ListItem
                                       icon={<Building />}
                                       title="Building"
                                       href="/admin/buildingmanagement"
                                       onClick={confirmUserPassedStep}
                                    >
                                       Create and manage buildings
                                    </ListItem>
                                 )}
                              </WalkthroughStep>
                              <WalkthroughStep
                                 guideId={"USER_SLICE_GUIDE"}
                                 stepIndex={2}
                                 title="Navigate to Slice Creation"
                                 description="Click here to open the Slice Management page, where you'll configure your slice's properties and select which buildings to include."
                                 side="bottom"
                              >
                                 {({ confirmUserPassedStep: confirmSliceInvestStep }) => (
                                    <ListItem
                                       icon={<Slice />}
                                       title="Slice"
                                       href="/admin/slicemanagement"
                                       onClick={confirmSliceInvestStep}
                                    >
                                       Create and manage slices
                                    </ListItem>
                                 )}
                              </WalkthroughStep>
                              <WalkthroughStep
                                 guideId={"USER_LOGIN_FLOW"}
                                 stepIndex={3}
                                 title="Click here"
                                 description="This will lead you to the page where you can mint test USDC tokens for development and testing."
                                 side="left"
                              >
                                 {({ confirmUserPassedStep }) => (
                                    <ListItem
                                       icon={<Coins />}
                                       title="Get Demo USDC"
                                       href="/admin/demo-usdc"
                                       onClick={confirmUserPassedStep}
                                    >
                                       Mint test USDC tokens for development and testing.
                                    </ListItem>
                                 )}
                              </WalkthroughStep>
                           </ul>
                        </NavigationMenuContent>
                     </NavigationMenuItem>

                     <NavigationMenuItem>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                           <Link href="/trade">Trade</Link>
                        </NavigationMenuLink>
                     </NavigationMenuItem>

                     <NavigationMenuItem>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                           <Link href="/faq">FAQ</Link>
                        </NavigationMenuLink>
                     </NavigationMenuItem>

                     <ReownConnectButton />
                  </NavigationMenuList>
               </NavigationMenu>
            </div>
         </div>
         <WalkthroughPromptCard
            {...PromptCardProps}
            title={
               {
                  ADMIN_BUILDING_GUIDE: "Do you want help tokenizing a building?",
                  USER_INVESTING_GUIDE: "Do you want us to help you invest into buildings?",
                  USER_SLICE_GUIDE: "Do you want us to help create and invest into a slice?",
               }[PromptCardProps.currentGuide!]
            }
            description={
               {
                  ADMIN_BUILDING_GUIDE:
                     "We will guide you from the Create menu to Building Management and explain each key field (image/IPFS, total supply, token settings, USDC reserve, governance, and vault).",
                  USER_INVESTING_GUIDE:
                     "We will guide you through the investing process step by step.",
                  USER_SLICE_GUIDE:
                     "Slice is DeFi analogue of ETF, which will allow you to invest in a diversified portfolio of real estate assets.",
               }[PromptCardProps.currentGuide!]
            }
         />
      </>
   );
}

const ListItem = React.forwardRef<
   React.ElementRef<"a">,
   React.ComponentPropsWithoutRef<"a"> & { icon: ReactNode }
>(({ className, icon, title, children, ...props }, ref) => {
   return (
      <li>
         <NavigationMenuLink asChild>
            <div className="flex ">
               <a
                  ref={ref}
                  className={cn(
                     "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                     className,
                  )}
                  {...props}
               >
                  <div className="flex flex-row gap-2">
                     <div>{icon}</div>
                     <div>
                        <div className="text-sm font-medium leading-none">{title}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                           {children}
                        </p>
                     </div>
                  </div>
               </a>
            </div>
         </NavigationMenuLink>
      </li>
   );
});
ListItem.displayName = "ListItem";
