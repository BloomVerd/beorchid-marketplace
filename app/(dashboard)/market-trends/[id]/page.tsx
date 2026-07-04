"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useCrops } from "@/common/hooks/queries/use-crops";
import { useCropPrices } from "@/common/hooks/queries/use-crop-prices";
import { useCoins } from "@/common/hooks/queries/use-coins";
import { useAddToWatchlist } from "@/common/hooks/mutations/use-add-to-watchlist";
import { ErrorState } from "@/components/dashboard/error-state";
import { toGHS } from "@/lib/format";

const RANGES = ["1M", "6M", "1Y", "2Y", "All"];
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function PcEl({ chg }: { chg: number }) {
  const up = chg >= 0;
  return (
    <span className={`pc ${up ? "pc-up" : "pc-down"}`}>
      {up ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%
    </span>
  );
}

function AreaChart({ pts, color, w = 700, h = 220 }: { pts: number[]; color: string; w?: number; h?: number }) {
  const gid  = useId();
  const fgid = useId();
  if (pts.length < 2)
    return <div style={{ height: h, background: "var(--surface-2)", borderRadius: "var(--r-sm)" }} />;
  const pad = { t: 20, b: 30, l: 36, r: 12 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const mn = Math.min(...pts) * 0.97, mx = Math.max(...pts) * 1.03, rng = mx - mn;
  const X = (i: number) => pad.l + (i / (pts.length - 1)) * iw;
  const Y = (v: number) => pad.t + ih - ((v - mn) / rng) * ih;
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  const last  = pts[pts.length - 1];
  const slope = pts.length > 1 ? pts[pts.length - 1] - pts[pts.length - 2] : 0;
  const fpts  = Array.from({ length: 6 }, (_, j) => last + slope * (j + 1) * 0.8);
  const allF  = [last, ...fpts];
  const dF    = allF.map((v, j) =>
    `${j === 0 ? "M" : "L"}${X(pts.length - 1 + (j * (pts.length - 1)) / 5).toFixed(1)},${Y(v).toFixed(1)}`
  ).join(" ");
  const yLabels = [mn, mn + rng * 0.25, mn + rng * 0.5, mn + rng * 0.75, mx];
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid}  x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color}          stopOpacity={0.18} />
          <stop offset="100%" stopColor={color}          stopOpacity={0} />
        </linearGradient>
        <linearGradient id={fgid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--money)"   stopOpacity={0.12} />
          <stop offset="100%" stopColor="var(--money)"   stopOpacity={0} />
        </linearGradient>
      </defs>
      {yLabels.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} y1={Y(v).toFixed(1)} x2={w - pad.r} y2={Y(v).toFixed(1)} stroke="var(--line)" strokeWidth={0.8} />
          <text x={pad.l - 5} y={Y(v) + 4} fontSize={9} fill="var(--ink-3)" textAnchor="end" fontFamily="var(--font-mono)">{v.toFixed(0)}</text>
        </g>
      ))}
      <path d={d + ` L${X(pts.length - 1).toFixed(1)},${h - pad.b} L${pad.l},${h - pad.b} Z`} fill={`url(#${gid})`} />
      <path d={d}  fill="none" stroke={color}          strokeWidth={2}   strokeLinejoin="round" />
      <path d={dF} fill="none" stroke="var(--money)"   strokeWidth={1.5} strokeDasharray="5 4" strokeLinejoin="round" opacity={0.7} />
    </svg>
  );
}

function CandlestickChart({ pts, w = 700, h = 220 }: { pts: number[]; w?: number; h?: number }) {
  if (pts.length < 2)
    return <div style={{ height: h, background: "var(--surface-2)", borderRadius: "var(--r-sm)" }} />;
  const pad = { t: 20, b: 30, l: 36, r: 12 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const candles = pts.map((close, i) => {
    const open  = i === 0 ? close * 0.995 : pts[i - 1];
    const high  = Math.max(open, close) * (1 + (((i * 17) % 7) + 2) / 200);
    const low   = Math.min(open, close) * (1 - (((i * 13) % 5) + 1) / 200);
    return { open, high, low, close, isUp: close >= open };
  });
  const mn = Math.min(...candles.map(c => c.low))  * 0.97;
  const mx = Math.max(...candles.map(c => c.high)) * 1.03;
  const rng = mx - mn, n = candles.length, cw = iw / n;
  const X = (i: number) => pad.l + i * cw + cw / 2;
  const Y = (v: number) => pad.t + ih - ((v - mn) / rng) * ih;
  const yLabels = [mn, mn + rng * 0.25, mn + rng * 0.5, mn + rng * 0.75, mx];
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      {yLabels.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} y1={Y(v).toFixed(1)} x2={w - pad.r} y2={Y(v).toFixed(1)} stroke="var(--line)" strokeWidth={0.8} />
          <text x={pad.l - 5} y={Y(v) + 4} fontSize={9} fill="var(--ink-3)" textAnchor="end" fontFamily="var(--font-mono)">{v.toFixed(0)}</text>
        </g>
      ))}
      {candles.map((c, i) => {
        const color   = c.isUp ? "var(--gain)" : "var(--loss)";
        const bx      = X(i) - cw * 0.3;
        const bw2     = cw * 0.6;
        const bodyTop = Y(Math.max(c.open, c.close));
        const bodyBot = Y(Math.min(c.open, c.close));
        const bodyH   = Math.max(1, bodyBot - bodyTop);
        return (
          <g key={i}>
            <line x1={X(i).toFixed(1)} y1={Y(c.high).toFixed(1)} x2={X(i).toFixed(1)} y2={Y(c.low).toFixed(1)} stroke={color} strokeWidth={1} />
            <rect x={bx.toFixed(1)} y={bodyTop.toFixed(1)} width={bw2.toFixed(1)} height={bodyH.toFixed(1)} fill={color} rx={1} />
          </g>
        );
      })}
    </svg>
  );
}

function BarChart({ vals, color, maxH = 80 }: { vals: number[]; color: string; maxH?: number }) {
  const mx = Math.max(...vals) || 1;
  const bw = 100 / vals.length;
  return (
    <svg width="100%" viewBox={`0 0 100 ${maxH}`} preserveAspectRatio="none" style={{ display: "block", height: maxH }}>
      {vals.map((v, i) => {
        const bh = (v / mx) * (maxH - 6);
        return <rect key={i} x={i * bw + 0.5} y={maxH - bh} width={bw - 1} height={bh} rx={2} fill={color} fillOpacity={0.75} />;
      })}
    </svg>
  );
}

export default function CropDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [range, setRange] = useState("1Y");
  const [mode, setMode]   = useState("area");

  const { data, error, refetch }             = useCrops();
  const { data: pricesData, loading: pricesLoading } = useCropPrices(id);
  const { data: coinsData }                  = useCoins();
  const [addWatch, { loading: watching }]    = useAddToWatchlist();

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const crop   = data?.crops.find(c => c.id === id);
  const prices = pricesData?.cropPrices ?? [];

  // Header price & % change
  const pts        = prices.map(p => p.price);
  const lastPrice  = pts.at(-1) ?? 0;
  const firstPrice = pts[0] ?? lastPrice;
  const chg        = firstPrice ? +((lastPrice - firstPrice) / firstPrice * 100).toFixed(2) : 0;
  const color      = "var(--primary)";

  // Range-filtered chart series
  const MS: Record<string, number> = { "1M": 30, "6M": 180, "1Y": 365, "2Y": 730 };
  const cutoff       = range === "All" ? 0 : Date.now() - (MS[range] ?? 365) * 86400000;
  const displaySeries = prices
    .filter(p => new Date(p.observedAt).getTime() >= cutoff)
    .map(p => p.price);

  // Seasonality: monthly avg price
  const seasonality = MONTH_LABELS.map((m, mo) => {
    const moPts = prices.filter(p => new Date(p.observedAt).getMonth() === mo);
    const avg   = moPts.length ? moPts.reduce((s, p) => s + p.price, 0) / moPts.length : 0;
    return { m, h: avg };
  });

  // Volume: monthly observation count
  const monthlyVolume = MONTH_LABELS.map((_, mo) =>
    prices.filter(p => new Date(p.observedAt).getMonth() === mo).length
  );

  // Regional comparison
  const regionMap = prices.reduce<Record<string, { sum: number; count: number }>>((acc, p) => {
    if (!p.region) return acc;
    acc[p.region] = acc[p.region] ?? { sum: 0, count: 0 };
    acc[p.region].sum   += p.price;
    acc[p.region].count += 1;
    return acc;
  }, {});
  const regionRows = Object.entries(regionMap)
    .map(([name, { sum, count }]) => ({ name, avg: Math.round(sum / count) }))
    .sort((a, b) => b.avg - a.avg);
  const maxAvg = regionRows[0]?.avg || 1;

  // Linked coin
  const linkedCoin = coinsData?.coins.find(c => c.cropId === crop?.id);

  const handleWatch = async () => {
    if (!crop) return;
    try {
      await addWatch({ variables: { entityType: "CROP", entityId: crop.id } });
      toast.success(`${crop.name} added to watchlist`);
    } catch {
      toast.error("Failed to add to watchlist");
    }
  };

  return (
    <div className="anim-up">
      <Link href="/market-trends" className="btn btn-ghost btn-sm" style={{ marginBottom: 14, paddingLeft: 0 }}>
        ← Market Trends
      </Link>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div className="iconbox iconbox-lg" style={{ background: "var(--primary-soft)", color: "var(--primary-strong)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 22 16 8" />
              <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
              <path d="M15.66 9.66 17 8a3.5 3.5 0 0 0-4.94-4.94L10.5 4.66" />
            </svg>
          </div>
          <div>
            <h1 className="h1" style={{ margin: 0 }}>{crop?.name ?? "—"}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
              <span className="metric" style={{ fontSize: 28 }}>
                {lastPrice ? toGHS(lastPrice) : "—"}
              </span>
              <PcEl chg={chg} />
              <span className="faint" style={{ fontSize: 12.5 }}>per {crop?.unit ?? "bag"}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={handleWatch} disabled={watching}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Watch
          </button>
          <Link href="/marketplace" className="btn btn-outline">See farms</Link>
          {linkedCoin && (
            <Link href={`/coins/${linkedCoin.id}`} className="btn btn-money">Trade the coin</Link>
          )}
        </div>
      </div>

      {/* Price history chart */}
      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="eyebrow">Price history</span>
            {mode !== "candles" && <span className="badge badge-money badge-dot">Forecast band</span>}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div className="segmented">
              <button className="seg-btn" data-active={mode === "area"}    onClick={() => setMode("area")}>Area</button>
              <button className="seg-btn" data-active={mode === "candles"} onClick={() => setMode("candles")}>Candles</button>
            </div>
            <div className="segmented">
              {RANGES.map(r => (
                <button key={r} className="seg-btn" data-active={range === r} onClick={() => setRange(r)}>{r}</button>
              ))}
            </div>
          </div>
        </div>
        {pricesLoading ? (
          <div className="skel" style={{ height: 220, borderRadius: "var(--r-sm)" }} />
        ) : mode === "candles" ? (
          <CandlestickChart pts={displaySeries} />
        ) : (
          <AreaChart pts={displaySeries} color={color} />
        )}
        <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
          {mode === "candles" ? (
            <>
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }} className="muted">
                <span style={{ width: 12, height: 12, borderRadius: 2, background: "var(--gain)", display: "inline-block" }} />
                Price up
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }} className="muted">
                <span style={{ width: 12, height: 12, borderRadius: 2, background: "var(--loss)", display: "inline-block" }} />
                Price down
              </span>
            </>
          ) : (
            <>
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }} className="muted">
                <span style={{ width: 18, height: 3, borderRadius: 2, background: color, display: "inline-block" }} />
                Historical price
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }} className="muted">
                <span style={{ width: 18, height: 3, borderRadius: 2, background: "var(--money)", opacity: 0.7, display: "inline-block" }} />
                Projected (not guaranteed)
              </span>
            </>
          )}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid-3">
        {/* Seasonality */}
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Seasonality · avg by month</div>
          <BarChart vals={seasonality.map(s => s.h)} color={color} maxH={80} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {seasonality.filter((_, i) => i % 2 === 0).map(s => (
              <span key={s.m} className="faint" style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}>{s.m}</span>
            ))}
          </div>
          <div className="faint" style={{ fontSize: 11.5, marginTop: 10 }}>
            Average price per month based on recorded observations.
          </div>
        </div>

        {/* Volume */}
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Observations · 12mo</div>
          <BarChart vals={monthlyVolume} color="var(--primary)" maxH={80} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {["J","F","M","A","M","J","J","A","S","O","N","D"].map(m => (
              <span key={m} className="faint" style={{ fontSize: 9, fontFamily: "var(--font-mono)" }}>{m}</span>
            ))}
          </div>
          <div className="faint" style={{ fontSize: 11.5, marginTop: 10 }}>
            Number of price observations recorded per month.
          </div>
        </div>

        {/* Regional comparison */}
        <div className="card" style={{ padding: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Regional price comparison</div>
          {regionRows.length === 0 ? (
            <p className="faint" style={{ fontSize: 12.5 }}>No regional data available yet.</p>
          ) : regionRows.map(r => (
            <div key={r.name} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                <span className="muted">{r.name}</span>
                <span className="mono semibold">{toGHS(r.avg)}</span>
              </div>
              <div className="track">
                <div className="track-fill" style={{ width: `${(r.avg / maxAvg) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
