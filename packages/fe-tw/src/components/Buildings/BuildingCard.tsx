"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "wagmi";

interface BuildingCardProps {
   building: {
      id: string | number;
      title?: string;
      description?: string;
      imageUrl?: string;
      owner?: string;
   };
   onClick?: () => void;
}

export function BuildingCard({ building, onClick }: BuildingCardProps) {
   const { address: evmAddress } = useAccount();

   return (
      <Card
         key={building.id}
         className="transition-transform duration-200 hover:scale-[1.02] cursor-pointer p-0 pb-6 gap-2"
         onClick={onClick}
      >
         <Link prefetch={true} href={`/building/${building.id}`}>
            <>
               <Image
                  src={building.imageUrl ?? "assets/dome.jpeg"}
                  alt={building.title ?? "Building Image"}
                  width={300}
                  height={300}
                  quality={70}
                  className="w-full h-32 object-cover rounded-t-md mb-3 top-0"
               />
               <CardContent>
                  <h3 className="text-lg font-semibold flex flex-wrap gap-2">
                     {building.title ?? "Untitled Building"}
                     {building.owner?.toLowerCase() === evmAddress?.toLowerCase() && (
                        <Badge variant="default" color="indigo">
                           Owner
                        </Badge>
                     )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                     {building.description ?? "No description available"}
                  </p>
               </CardContent>
            </>
         </Link>
      </Card>
   );
}
