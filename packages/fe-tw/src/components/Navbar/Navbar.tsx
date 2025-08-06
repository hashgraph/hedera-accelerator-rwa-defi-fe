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
import {
   Building,
   Earth,
   Radar,
   Slice,
   Menu,
   UserCircle,
   LogOut,
   ChartNoAxesColumnIncreasing,
   FileStack, // Added icon
   Coins, // Added icon
} from "lucide-react";
import { WalletConnectModalRW } from "../Wallets/WalletConnectModalRW";
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
import { useAccountId, useEvmAddress, useWallet } from "@buidlerlabs/hashgraph-react-wallets";
import {
   HashpackConnector,
   MetamaskConnector,
} from "@buidlerlabs/hashgraph-react-wallets/connectors";
import { toast } from "sonner";
import { shortEvmAddress } from "@/services/util";
import { useWalkthrough, WalkthroughPromptCard, WalkthroughStep } from "../Walkthrough";

export function Navbar() {
   const { confirmUserFinishedGuide, PromptCardProps } = useWalkthrough([
      { guideId: "USER_INVESTING_GUIDE", priority: 2 },
   ]);
   const { isSidebarTriggerVisible } = useSidebar();
   const [isOpen, setIsOpen] = React.useState(false);

   const { isConnected: isConnectedHashpack, disconnect: disconnectHashpack } =
      useWallet(HashpackConnector) || {};

   const { isConnected: isConnectedMetamask, disconnect: disconnectMetamask } =
      useWallet(MetamaskConnector) || {};

   const { data: accountId } = useAccountId();
   const { data: evmAddress } = useEvmAddress();

   const handleDisconnectHashpack = async () => {
      await disconnectHashpack();
      setTimeout(() => {
         window.localStorage.removeItem("wagmi.store");
      }, 100);
      // Remove session info from local storage, because in the attempt of reconnect WalletConnect will throw an error
      // Related issue: https://github.com/WalletConnect/walletconnect-monorepo/issues/315
   };

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
                        <WalletConnectModalRW />
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
                           guideId="USER_INVESTING_GUIDE"
                           stepIndex={11}
                           title="Let's get USDC"
                           description="Hover on this panel and select 'Get Demo USDC' to mint test USDC tokens for development and testing."
                           side="bottom"
                        >
                           {({ confirmUserPassedStep }) => (
                              <NavigationMenuTrigger
                                 className={navigationMenuTriggerStyle()}
                                 onMouseEnter={confirmUserPassedStep}
                              >
                                 Create
                              </NavigationMenuTrigger>
                           )}
                        </WalkthroughStep>
                        <NavigationMenuContent asChild data-state="open">
                           <ul className="grid w-[400px] gap-2 p-1 md:w-[300px] md:grid-cols-1 lg:w-[400px]">
                              <ListItem
                                 icon={<Building />}
                                 title="Building"
                                 href="/admin/buildingmanagement"
                              >
                                 Create and manage buildings
                              </ListItem>
                              <ListItem
                                 icon={<Slice />}
                                 title="Slice"
                                 href="/admin/slicemanagement"
                              >
                                 Create and manage slices
                              </ListItem>
                              <ListItem
                                 icon={<FileStack />}
                                 title="Audit"
                                 href="/admin/auditmanagement"
                              >
                                 Create and Manage Audit
                              </ListItem>
                              <WalkthroughStep
                                 guideId="USER_INVESTING_GUIDE"
                                 stepIndex={12}
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

                     {isConnectedHashpack || isConnectedMetamask ? (
                        <NavigationMenuItem>
                           <WalkthroughStep
                              guideId={"USER_LOGIN_FLOW"}
                              stepIndex={3}
                              title={"Now you can see your account info"}
                              description={"Hover over here to see your account info"}
                           >
                              {({ confirmUserFinishedGuide }) => (
                                 <NavigationMenuTrigger
                                    className={navigationMenuTriggerStyle()}
                                    onMouseEnter={() => {
                                       confirmUserFinishedGuide();
                                    }}
                                 >
                                    <UserCircle />
                                 </NavigationMenuTrigger>
                              )}
                           </WalkthroughStep>

                           <NavigationMenuContent asChild data-state="open">
                              <div>
                                 <div className="flex justify-center items-center text-center gap-2 p-2 text-sm text-muted-foreground">
                                    AccountID: {accountId}
                                    <span title={evmAddress}>
                                       EVM Address: {shortEvmAddress(evmAddress)}
                                    </span>
                                 </div>

                                 <ul className="grid w-[400px] gap-2 p-1 md:w-[300px] md:grid-cols-1 lg:w-[400px]">
                                    <ListItem icon={<UserCircle />} title="Account" href="/account">
                                       Review and manage your account settings
                                    </ListItem>
                                    <ListItem
                                       icon={<ChartNoAxesColumnIncreasing />}
                                       title="Portfolio"
                                       href="/portfolio"
                                    >
                                       Review portfolio, explore your assets and track performance
                                    </ListItem>
                                    <ListItem
                                       icon={<LogOut />}
                                       title="Disconnect"
                                       onClick={async () => {
                                          if (isConnectedHashpack) {
                                             await handleDisconnectHashpack();
                                             toast.success("Disconnected from Hashpack");
                                          }

                                          if (isConnectedMetamask) {
                                             disconnectMetamask();
                                             toast.success("Disconnected from Metamask");
                                          }
                                       }}
                                    />
                                 </ul>
                              </div>
                           </NavigationMenuContent>
                        </NavigationMenuItem>
                     ) : (
                        <WalletConnectModalRW />
                     )}
                  </NavigationMenuList>
               </NavigationMenu>
            </div>
         </div>
         <WalkthroughPromptCard
            {...PromptCardProps}
            title="Do you want us to help you invest into buildings?"
            description="We will guide you through the process step by step."
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
