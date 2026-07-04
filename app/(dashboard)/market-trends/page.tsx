"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { useCrops } from "@/common/hooks/queries/use-crops";
import { ErrorState } from "@/components/dashboard/error-state";
import { toGHS } from "@/lib/format";

const COLORS = [
  "var(--primary)", "var(--sun)", "var(--water)", "var(--money)",
  "var(--earth)", "var(--primary-soft)",
];

const CHIPS = ["All crops", "Cereals", "Legumes", "Cash crops", "Ashanti", "Northern", "Top gainers"];
const CATEGORY_CHIPS = ["Cereals", "Legumes", "Cash crops"];
const REGION_CHIPS   = ["Ashanti", "Northern"];

function Spark({ pts, color = "var(--primary)", w = 220, h = 50 }: { pts: number[]; color?: string; w?: number; h?: number }) {
  const gid = useId();
  if (pts.length < 2) return <div style={{ width: w, height: h }} />;
  const mn = Math.min(...pts), mx = Math.max(...pts), rng = mx - mn || 1;
  const X = (i: number) => (i / (pts.length - 1)) * w;
  const Y = (v: number) => h - ((v - mn) / rng) * (h - 6) - 3;
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={d + ` L${X(pts.length - 1).toFixed(1)},${h} L0,${h} Z`} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function PcEl({ chg }: { chg: number }) {
  const up = chg >= 0;
  return <span className={`pc ${up ? "pc-up" : "pc-down"}`}>{up ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%</span>;
}

export default function MarketTrendsPage() {
  const [activeChip, setActiveChip] = useState(0);

  const chipLabel   = CHIPS[activeChip];
  const categoryArg = CATEGORY_CHIPS.includes(chipLabel) ? chipLabel : undefined;
  const regionArg   = REGION_CHIPS.includes(chipLabel)   ? chipLabel : undefined;

  const { data, loading, error, refetch } = useCrops(categoryArg, regionArg);

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const allCrops = data?.crops ?? [];

  const filtered = chipLabel === "Top gainers"
    ? allCrops.filter(c => {
        const pts = c.recentPrices?.map(p => p.price) ?? [];
        return pts.length >= 2 && pts.at(-1)! > pts[0];
      })
    : allCrops;

  const movers = allCrops.slice(0, 4).map((c, i) => {
    const pts  = c.recentPrices?.map(p => p.price) ?? [];
    const last = pts.at(-1) ?? 0;
    const first = pts[0] ?? last;
    const chg  = first ? +((last - first) / first * 100).toFixed(2) : 0;
    return { id: c.id, name: c.name, price: last, chg, color: COLORS[i % COLORS.length] };
  });

  return (
    <div className="anim-up">
      <div style={{ marginBottom: 20 }}>
        <div className="eyebrow">Markets</div>
        <h1 className="h1" style={{ margin: "6px 0 0" }}>Market Trends</h1>
        <p className="muted" style={{ margin: "6px 0 0" }}>Crop prices across Ghana — per standard bag, updated daily.</p>
      </div>

      {/* Biggest movers ticker */}
      <div className="card" style={{ padding: "18px 22px", marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Biggest movers · recent trend</div>
        <div className="ticker">
          {loading
            ? [1,2,3,4].map((i) => <div key={i} className="tk-cell skel" style={{ height: 70 }} />)
            : movers.map((m) => (
                <Link key={m.id} href={`/market-trends/${m.id}`} className="tk-cell card-hover" style={{ textAlign: "left", display: "block" }}>
                  <div className="semibold" style={{ fontWeight: 700, marginBottom: 6 }}>{m.name}</div>
                  <div className="mono" style={{ fontSize: 15, marginBottom: 6 }}>{m.price ? toGHS(m.price) : "—"}</div>
                  <PcEl chg={m.chg} />
                </Link>
              ))}
        </div>
      </div>

      {/* Chip filters */}
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 18 }}>
        {CHIPS.map((label, i) => (
          <button key={label} className={`chip${i === activeChip ? " chip-active" : ""}`} onClick={() => setActiveChip(i)}>
            {label}
          </button>
        ))}
      </div>

      {/* Crop cards grid */}
      <div className="grid-3">
        {loading
          ? [1,2,3,4,5,6].map((i) => <div key={i} className="card skel" style={{ height: 180 }} />)
          : filtered.map((crop, i) => {
              const pts   = crop.recentPrices?.map(p => p.price) ?? [];
              const price = pts.at(-1) ?? 0;
              const first = pts[0] ?? price;
              const chg   = first ? +((price - first) / first * 100).toFixed(2) : 0;
              const color = COLORS[i % COLORS.length];
              return (
                <Link
                  key={crop.id}
                  href={`/market-trends/${crop.id}`}
                  className="card card-hover"
                  style={{ padding: 18, textAlign: "left", display: "block" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div>
                      <div className="h3">{crop.name}</div>
                      <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>
                        {[crop.region, crop.unit].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    <PcEl chg={chg} />
                  </div>
                  <div className="metric" style={{ fontSize: 23, margin: "12px 0 12px" }}>
                    {price ? toGHS(price) : "—"}
                  </div>
                  <Spark pts={pts} color={color} w={220} h={50} />
                  <div className="faint mono" style={{ fontSize: 10.5, marginTop: 8, letterSpacing: ".04em" }}>RECENT TREND</div>
                </Link>
              );
            })}
      </div>


    </div>
  );
}
