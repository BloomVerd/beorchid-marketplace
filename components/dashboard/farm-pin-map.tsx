"use client";

import dynamic from "next/dynamic";

interface Props {
  lat: number;
  lon: number;
  label: string;
}

const FarmPinMapInner = dynamic(() => import("./farm-pin-map-inner"), { ssr: false });

export function FarmPinMap({ lat, lon, label }: Props) {
  return <FarmPinMapInner lat={lat} lon={lon} label={label} />;
}
