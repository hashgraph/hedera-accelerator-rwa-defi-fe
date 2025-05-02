"use client";

import { SliceDetailPage } from "@/components/Slices/SliceDetailPage";
import { useSlicesData } from "@/hooks/useSlicesData";
import type { SliceData } from "@/types/erc3643/types";
import { slugify } from "@/utils/slugify";
import { notFound } from "next/navigation";
import { type Usable, use, useEffect, useState } from "react";

type Props = {
   params: Promise<{ id: string; slug: string }>;
};

export default function Page({ params }: Props) {
   const { slug, id: buildingId } = use<{ slug: string; id: string }>(
      params as unknown as Usable<{ slug: string; id: string }>,
   );
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

   if (sliceNotFound) {
      return notFound();
   }

   return !!slice && <SliceDetailPage slice={slice!} />;
}
