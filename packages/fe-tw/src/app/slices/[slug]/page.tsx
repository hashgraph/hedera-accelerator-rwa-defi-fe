"use client";

import { SliceDetailPage } from "@/components/Slices/SliceDetailPage";
import { useSlicesData } from "@/hooks/useSlicesData";
import type { SliceData } from "@/types/erc3643/types";
import { slugify } from "@/utils/slugify";
import { notFound } from "next/navigation";
import { type Usable, use, useEffect, useState } from "react";

type Props = {
   params: Promise<{ slug: string }>;
};

export default function Page({ params }: Props) {
   const { slug } = use<{ slug: string }>(params as unknown as Usable<{ slug: string }>);
   const { slices } = useSlicesData();
   const [slice, setSlice] = useState<SliceData>();
   const [sliceNotFound, setSliceNotFound] = useState(false);
   const [isLoaded, setIsLoaded] = useState(false);

   useEffect(() => {
      if (slices?.length > 0) {
         setTimeout(() => {
            setIsLoaded(true);
         }, 1000);
      }
   }, [slices?.length]);

   useEffect(() => {
      if (isLoaded) {
         const sliceData = slices.find((slice) => slugify(slice.id) === slugify(slug));
   
         if (!sliceData) {
            setSliceNotFound(true);
         } else {
            setSlice(sliceData);
         }
      }
   }, [isLoaded]);

   const sliceValuation = 0;
   const tokenPrice = 0;
   const userBalance = 0;

   if (sliceNotFound) {
      return notFound();
   }

   return (
      <SliceDetailPage
         sliceData={{
            ...(slice as SliceData),
            sliceValuation,
            tokenPrice,
            tokenBalance: userBalance,
         }}
      />
   );
}
