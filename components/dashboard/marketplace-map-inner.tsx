"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { MapListing } from "./marketplace-map";

const ESRI_TILE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const GHANA_CENTER: [number, number] = [7.9465, -1.0232];

const CROP_GRADS: Record<string, string> = {
  maize:   "linear-gradient(135deg, oklch(0.82 0.14 73), oklch(0.70 0.18 78))",
  cocoa:   "linear-gradient(135deg, oklch(0.55 0.12 46), oklch(0.42 0.10 40))",
  rice:    "linear-gradient(135deg, oklch(0.82 0.09 155), oklch(0.68 0.13 155))",
  soybean: "linear-gradient(135deg, oklch(0.60 0.14 163), oklch(0.48 0.13 160))",
};

function getGrad(crop: string) {
  return CROP_GRADS[crop.toLowerCase()] ?? "linear-gradient(135deg, oklch(0.70 0.10 155), oklch(0.55 0.12 160))";
}

function makeDotIcon(crop: string) {
  const grad = getGrad(crop);
  const letter = crop.slice(0, 1).toUpperCase();
  return L.divIcon({
    className: "",
    html: `<div style="
      width:30px;height:30px;
      border-radius:8px 8px 8px 1px;
      transform:rotate(-2deg);
      display:flex;align-items:center;justify-content:center;
      background:${grad};
      color:#fff;font-weight:700;font-size:11px;font-family:inherit;
      box-shadow:0 2px 4px hsl(155 30% 30%/.05),0 6px 16px -4px hsl(155 30% 30%/.09);
      cursor:pointer;
    ">${letter}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32],
  });
}

interface Props {
  listings: MapListing[];
}

export default function MarketplaceMapInner({ listings }: Props) {
  const router = useRouter();

  const center: [number, number] =
    listings.length > 0 ? [listings[0].lat, listings[0].lon] : GHANA_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={listings.length > 0 ? 8 : 7}
      style={{ height: "100%", width: "100%", borderRadius: "inherit" }}
      scrollWheelZoom={false}
    >
      <TileLayer url={ESRI_TILE} attribution="Esri" />
      {listings.map((l) => (
        <Marker
          key={l.id}
          position={[l.lat, l.lon]}
          icon={makeDotIcon(l.crop)}
          eventHandlers={{ click: () => router.push(`/marketplace/${l.id}`) }}
        >
          <Popup>{l.crop} Farm</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
