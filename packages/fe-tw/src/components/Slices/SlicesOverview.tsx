"use client";

import { useSlicesData } from "@/hooks/useSlicesData";
import { slugify } from "@/utils/slugify";
import Link from "next/link";
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export function SlicesOverview() {
   const { slices } = useSlicesData();

   return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
         <Breadcrumb>
            <BreadcrumbList>
               <BreadcrumbItem>
                  <BreadcrumbLink href="/explorer">Explorer</BreadcrumbLink>
               </BreadcrumbItem>
               <BreadcrumbSeparator />
               <BreadcrumbItem>
                  <BreadcrumbPage>Slices</BreadcrumbPage>
               </BreadcrumbItem>
            </BreadcrumbList>
         </Breadcrumb>

         <div className="bg-purple-50 px-6 sm:px-8 md:px-10 py-6 rounded-lg">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Slices Catalogue</h1>
            <p className="text-sm sm:text-base text-gray-700 mb-4">
               Slices are smart contracts that help manage diversified allocations across assets.
               They rebalance portfolios periodically to match predefined allocations, making it
               easy for users to participate in DeFi strategies.
            </p>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {slices.map((slice) => (
               <Card
                  key={slice.id}
                  className="transition-transform duration-200 hover:scale-[1.02] cursor-pointer p-0  gap-2"
               >
                  <Link key={slice.id} href={`/slices/${slugify(slice.id)}`}>
                     <Image
                        src={slice.imageIpfsUrl}
                        alt={slice.name}
                        quality={80}
                        width={400}
                        height={400}
                        className="w-full h-40 object-cover rounded-t-md mb-3"
                     />
                     <CardContent>
                        <h3 className="text-lg font-semibold">{slice.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-3">{slice.description}</p>
                     </CardContent>
                  </Link>
               </Card>
            ))}
         </div>
      </div>
   );
}
