"use client";

import Link from "next/link";
import { slugify } from "@/utils/slugify";
import { useExplorerData } from "@/hooks/useExplorerData";
import { FeaturedDevelopments } from "./FeaturedDevelopments";
import { SlicesCarousel } from "./SlicesCarousel";
import { BuildingsCarousel } from "./BuildingsCarousel";

export function ExplorerView() {
  const {
    slices,
    featuredDevelopments,
    buildings,
    multiSliceBuildings,
    singleSliceBuildings,
    selectedSlice,
    setSelectedSlice
  } = useExplorerData();

  return (
    <div className="max-w-screen-xl mx-auto px-8 md:px-12 lg:px-20">
      <Link href={`/slices`}>
        <h2 className="text-xl font-bold mt-8">
          Featured Slices →
        </h2>
      </Link>
      <br />
      <SlicesCarousel
        slices={slices}
        selectedSlice={selectedSlice}
        onSelectSlice={setSelectedSlice}
      />

      {selectedSlice && (
        <div className="mt-8">
          <FeaturedDevelopments
            selectedSliceName={selectedSlice.name}
            developments={featuredDevelopments}
          />

          {(singleSliceBuildings?.length ?? 0) > 0 && (
            <>
              <Link href={`/slices/${slugify(selectedSlice.name)}`}>
                <h2 className="text-xl font-bold mt-8 cursor-pointer">
                  {selectedSlice.name} Slice →
                </h2>
              </Link>
              <br />
              <BuildingsCarousel buildings={singleSliceBuildings} />
            </>
          )}

          {(multiSliceBuildings?.buildings?.length ?? 0) > 0 && (
            <>
              <Link href={`/slices/${slugify(selectedSlice.name)}`}>
                <h2 className="text-xl font-semibold mt-8">
                  {selectedSlice.name} + {multiSliceBuildings?.sliceName} Slice →
                </h2>
              </Link>
              <br />
              <BuildingsCarousel buildings={multiSliceBuildings?.buildings ?? []} />
            </>
          )}

          {(buildings?.length ?? 0) > 0 && (
            <>
              <Link href="/building">
                <h2 className="text-xl font-bold mt-8 cursor-pointer">All Buildings</h2>
              </Link>
              <br />
              <BuildingsCarousel buildings={buildings} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
