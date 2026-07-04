"use client";

import { useState } from "react";
import Link from "next/link";
import { useListings } from "@/common/hooks/queries/use-listings";
import { useCrops } from "@/common/hooks/queries/use-crops";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ErrorState } from "@/components/dashboard/error-state";
import { MarketplaceMap } from "@/components/dashboard/marketplace-map";
import { toGHS } from "@/lib/format";

function healthBadge(score: number) {
  if (score >= 85) return { cls: "badge badge-low",  label: "Healthy" };
  if (score >= 65) return { cls: "badge badge-mod",  label: "Moderate" };
  return             { cls: "badge badge-high", label: "Needs attention" };
}

const PRICE_CHIPS = ["Under GHS 250k", "Healthy 80+", "Available"];

export default function MarketplacePage() {
  const [cropFilter, setCropFilter] = useState("");
  const [priceChip, setPriceChip] = useState(-1);
  const [mapMode, setMapMode] = useState(true);

  const maxPrice      = priceChip === 0 ? 25_000_000 : undefined;
  const minHealthScore = priceChip === 1 ? 80 : undefined;
  const statusFilter  = priceChip === 2 ? ("OPEN" as const) : undefined;

  const { data, loading, error, refetch } = useListings(
    cropFilter || undefined,
    undefined,
    statusFilter,
    maxPrice,
    minHealthScore,
  );
  const { data: cropsData } = useCrops();

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const listings = data?.listings ?? [];

  const mappable = listings.filter(
    (l): l is typeof l & { lat: number; lon: number } =>
      l.lat != null && l.lon != null
  );

  return (
    <div className="anim-up">
      <div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <div className="eyebrow">Marketplace</div>
          <h1 className="h1" style={{ margin: "6px 0 0" }}>Farms for sale</h1>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            {listings.length} listings sourced from Bloomverd farms across Ghana. Browse, then make an offer.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, paddingTop: 4 }}>
          <Link href="/my-offers" className="btn btn-outline btn-sm">My offers</Link>
          <Link href="/my-deals" className="btn btn-outline btn-sm">My deals</Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: "14px 16px", marginBottom: 18, display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
        <span className="eyebrow" style={{ marginRight: 4 }}>Filter</span>
        <button className={`chip${!cropFilter ? " chip-active" : ""}`} onClick={() => setCropFilter("")}>All crops</button>
        {cropsData?.crops.map((c) => (
          <button key={c.id} className={`chip${cropFilter === c.slug ? " chip-active" : ""}`} onClick={() => setCropFilter(c.slug)}>
            {c.name}
          </button>
        ))}
        <span style={{ width: 1, height: 24, background: "var(--line)", display: "inline-block", margin: "0 2px" }} />
        {PRICE_CHIPS.map((label, i) => (
          <button key={label} className={`chip${priceChip === i ? " chip-active" : ""}`} onClick={() => setPriceChip(priceChip === i ? -1 : i)}>
            {label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div className="segmented">
          <button className="seg-btn" data-active={mapMode} onClick={() => setMapMode(true)}>Map + list</button>
          <button className="seg-btn" data-active={!mapMode} onClick={() => setMapMode(false)}>List</button>
        </div>
      </div>

      <div className="marketplace-grid">
        {/* Map */}
        {mapMode && (
          <div style={{ height: 560, position: "sticky", top: 0, borderRadius: "var(--r-card)", overflow: "hidden", border: "1px solid var(--line)" }}>
            <div style={{ position: "absolute", top: 12, left: 12, zIndex: 1000 }} className="badge card">Ghana · {listings.length} farms</div>
            <MarketplaceMap listings={mappable.map((l) => ({ id: l.id, lat: l.lat, lon: l.lon, crop: l.crop }))} />
          </div>
        )}

        {/* Listing cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {loading
            ? [1,2,3].map((i) => <div key={i} className="card skel" style={{ height: 120 }} />)
            : listings.map((l) => {
                const score = l.farmHealth?.overall_score ?? 0;
                const hb = healthBadge(score);
                return (
                  <Link
                    key={l.id}
                    href={`/marketplace/${l.id}`}
                    className="card card-hover"
                    style={{ display: "flex", gap: 0, overflow: "hidden", textAlign: "left", padding: 0 }}
                  >
                    <div style={{ width: 150, flexShrink: 0, position: "relative", minHeight: 120, overflow: "hidden" }}>
                      {l.farmImages?.[0]?.url
                        ? <img src={l.farmImages[0].url} alt={`${l.crop} farm`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, oklch(0.70 0.10 155), oklch(0.55 0.12 160))" }} />
                      }
                      <span className="badge card-glass" style={{ position: "absolute", top: 10, left: 10, fontSize: 10 }}>◎ Drone</span>
                    </div>
                    <div style={{ flex: 1, padding: "16px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div>
                          <div className="h3">{l.crop} Farm</div>
                          <div className="faint" style={{ fontSize: 12, marginTop: 3 }}>
                            {l.crop} · {l.acreage} acres · {l.region.replace(/_/g, " ")}
                          </div>
                        </div>
                        <StatusBadge status={l.status} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                        <div>
                          <div className="faint" style={{ fontSize: 11 }}>Asking price</div>
                          <div className="metric" style={{ fontSize: 21, marginTop: 3 }}>{toGHS(l.askingPrice)}</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                          {score > 0 && <span className={hb.cls}>{hb.label}</span>}
                          <span className="btn btn-outline btn-sm">View / Make offer →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </div>
  );
}
