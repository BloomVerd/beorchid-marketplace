"use client";

import dynamic from "next/dynamic";

export interface MapListing {
  id: string;
  lat: number;
  lon: number;
  crop: string;
}

interface Props {
  listings: MapListing[];
}

const MarketplaceMapInner = dynamic(() => import("./marketplace-map-inner"), { ssr: false });

export function MarketplaceMap({ listings }: Props) {
  return <MarketplaceMapInner listings={listings} />;
}
