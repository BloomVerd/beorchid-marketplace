"use client";

import { useState, useId } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useCoinDetail } from "@/common/hooks/queries/use-coin-detail";
import { useCoinPrices } from "@/common/hooks/queries/use-coin-prices";
import { useMyCoins } from "@/common/hooks/queries/use-my-coins";
import { useBuyCoin } from "@/common/hooks/mutations/use-buy-coin";
import { useSellCoin } from "@/common/hooks/mutations/use-sell-coin";
import { ErrorState } from "@/components/dashboard/error-state";
import { toGHS } from "@/lib/format";

const COIN_COLORS: Record<string, string> = {
  MAIZ: "var(--sun)",
  COCO: "var(--primary)",
  RICO: "var(--water)",
  SOYA: "var(--money)",
};
const COIN_BACKING: Record<string, string> = {
  MAIZ: "maize",
  COCO: "cocoa",
  RICO: "rice",
  SOYA: "soybean",
};
const RANGES = ["7d", "30d", "90d", "1Y"];
const RANGE_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1Y": 365 };
const BUCKET_MS: Record<string, number> = {
  "7d":  86_400_000,
  "30d": 86_400_000,
  "90d": 3 * 86_400_000,
  "1Y":  7 * 86_400_000,
};

/* ── candle aggregation ─────────────────────────────────────────── */
interface Candle { ts: number; open: number; high: number; low: number; close: number }

function toCandles(pts: { price: number; computedAt: string }[], bucketMs: number): Candle[] {
  const map = new Map<number, number[]>();
  for (const p of pts) {
    const key = Math.floor(new Date(p.computedAt).getTime() / bucketMs) * bucketMs;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p.price);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([ts, prices]) => ({
      ts,
      open:  prices[0],
      close: prices[prices.length - 1],
      high:  Math.max(...prices),
      low:   Math.min(...prices),
    }));
}

/* ── AreaChart ──────────────────────────────────────────────────── */
function AreaChart({ pts, color }: { pts: number[]; color: string }) {
  const gid = useId();
  const W = 700, H = 200;
  if (pts.length < 2)
    return <div style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center" }} className="faint">No price data for this period</div>;
  const pad = { t: 16, b: 28, l: 48, r: 8 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const mn = Math.min(...pts) * 0.97, mx = Math.max(...pts) * 1.03, rng = mx - mn;
  const X = (i: number) => pad.l + (i / (pts.length - 1)) * iw;
  const Y = (v: number) => pad.t + ih - ((v - mn) / rng) * ih;
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  const yLabels = [mn, (mn + mx) / 2, mx];
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {yLabels.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} y1={Y(v).toFixed(1)} x2={W - pad.r} y2={Y(v).toFixed(1)} stroke="var(--line)" strokeWidth={0.8} />
          <text x={pad.l - 4} y={Y(v) + 4} fontSize={9} fill="var(--ink-3)" textAnchor="end" fontFamily="var(--font-mono)">{v.toFixed(2)}</text>
        </g>
      ))}
      <path d={d + ` L${X(pts.length - 1).toFixed(1)},${H - pad.b} L${pad.l},${H - pad.b} Z`} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

/* ── CandlestickChart ───────────────────────────────────────────── */
function CandlestickChart({ candles }: { candles: Candle[] }) {
  const W = 700, H = 200;
  if (candles.length < 2)
    return <div style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center" }} className="faint">No price data for this period</div>;
  const pad = { t: 16, b: 28, l: 48, r: 8 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const mn = Math.min(...candles.map(c => c.low)) * 0.97;
  const mx = Math.max(...candles.map(c => c.high)) * 1.03;
  const rng = mx - mn;
  const Y = (v: number) => pad.t + ih - ((v - mn) / rng) * ih;
  const step = iw / candles.length;
  const bodyW = Math.max(2, step * 0.6);
  const yLabels = [mn, (mn + mx) / 2, mx];
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
      {yLabels.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} y1={Y(v).toFixed(1)} x2={W - pad.r} y2={Y(v).toFixed(1)} stroke="var(--line)" strokeWidth={0.8} />
          <text x={pad.l - 4} y={Y(v) + 4} fontSize={9} fill="var(--ink-3)" textAnchor="end" fontFamily="var(--font-mono)">{v.toFixed(2)}</text>
        </g>
      ))}
      {candles.map((c, i) => {
        const cx = pad.l + (i + 0.5) * step;
        const bullish = c.close >= c.open;
        const clr = bullish ? "var(--gain)" : "var(--loss)";
        const bodyTop = Y(Math.max(c.open, c.close));
        const bodyH = Math.max(1, Y(Math.min(c.open, c.close)) - bodyTop);
        return (
          <g key={c.ts}>
            <line x1={cx.toFixed(1)} y1={Y(c.high).toFixed(1)} x2={cx.toFixed(1)} y2={Y(c.low).toFixed(1)} stroke={clr} strokeWidth={1} />
            <rect x={(cx - bodyW / 2).toFixed(1)} y={bodyTop.toFixed(1)} width={bodyW.toFixed(1)} height={bodyH.toFixed(1)} fill={clr} rx={1} />
          </g>
        );
      })}
    </svg>
  );
}

function PcEl({ chg }: { chg: number }) {
  const up = chg >= 0;
  return <span className={`pc ${up ? "pc-up" : "pc-down"}`}>{up ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%</span>;
}

export default function CoinDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState("20");
  const [range, setRange] = useState("30d");
  const [mode, setMode] = useState<"area" | "candles">("area");

  const from = new Date(Date.now() - (RANGE_DAYS[range] ?? 30) * 86_400_000).toISOString();

  const { data: coinData, loading, error, refetch } = useCoinDetail(id);
  const { data: pricesData, loading: pricesLoading } = useCoinPrices(id, from);
  const { data: myCoinsData, refetch: refetchMyCoins } = useMyCoins();
  const [buyCoin, { loading: buying }] = useBuyCoin();
  const [sellCoin, { loading: selling }] = useSellCoin();

  if (loading) return <div className="card skel" style={{ minHeight: 400 }} />;
  if (error || !coinData?.coin) return <ErrorState message={error?.message} onRetry={() => refetch()} />;

  const coin = coinData.coin;
  const mine = myCoinsData?.myCoins.find((mc) => mc.coin.id === id);
  const sym = coin.symbol;
  const color = COIN_COLORS[sym] ?? "var(--primary)";
  const backing = COIN_BACKING[sym] ?? sym.toLowerCase();
  const pct = ((coin.currentPrice - coin.basePrice) / coin.basePrice) * 100;

  const units = parseFloat(qty) || 0;
  const gross = units * coin.currentPrice;
  const fee = gross * 0.005;
  const total = side === "buy" ? gross + fee : gross - fee;
  const totalLabel = side === "buy" ? "You pay" : "You receive";
  const execLabel = side === "buy" ? `Buy ${sym}` : `Sell ${sym}`;

  const rawPts = pricesData?.coinPrices ?? [];
  const priceValues = rawPts.map(p => p.price);
  const candles = toCandles(rawPts, BUCKET_MS[range] ?? 86_400_000);

  const handleTrade = async () => {
    if (!units || units <= 0) { toast.error("Enter a valid unit amount."); return; }
    const key = crypto.randomUUID();
    try {
      if (side === "buy") {
        await buyCoin({ variables: { coinId: id, units, idempotencyKey: key } });
        toast.success(`Bought ${units} ${sym}`);
      } else {
        await sellCoin({ variables: { coinId: id, units, idempotencyKey: key } });
        toast.success(`Sold ${units} ${sym}`);
      }
      setQty("");
      refetchMyCoins();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Trade failed.");
    }
  };

  return (
    <div className="anim-up">
      <Link href="/coins" className="btn btn-ghost btn-sm" style={{ marginBottom: 14, paddingLeft: 0 }}>
        ← Coins
      </Link>

      <div className="detail-grid">
        {/* Left */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div className="iconbox iconbox-lg" style={{ background: "var(--money-soft)", color, fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13 }}>
              {sym.slice(0, 4)}
            </div>
            <div>
              <h1 className="h1" style={{ margin: 0 }}>{coin.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                <span className="metric" style={{ fontSize: 26 }}>{toGHS(coin.currentPrice)}</span>
                <PcEl chg={pct} />
              </div>
            </div>
          </div>

          {/* Price chart */}
          <div className="card" style={{ padding: 22, marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              <span className="eyebrow">Price chart</span>
              <div style={{ display: "flex", gap: 10 }}>
                <div className="segmented">
                  <button className="seg-btn" data-active={mode === "area"} onClick={() => setMode("area")}>Area</button>
                  <button className="seg-btn" data-active={mode === "candles"} onClick={() => setMode("candles")}>Candles</button>
                </div>
                <div className="segmented">
                  {RANGES.map((r) => (
                    <button key={r} className="seg-btn" data-active={range === r} onClick={() => setRange(r)}>{r}</button>
                  ))}
                </div>
              </div>
            </div>
            {pricesLoading
              ? <div className="skel" style={{ height: 200, borderRadius: "var(--r-sm)" }} />
              : mode === "candles"
                ? <CandlestickChart candles={candles} />
                : <AreaChart pts={priceValues} color={color} />
            }
          </div>

          {/* What drives this price */}
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="h3">What drives this price</span>
              <Link href="/market-trends" className="btn btn-ghost btn-sm">View {backing} trend →</Link>
            </div>
            <p className="muted" style={{ margin: "0 0 18px", lineHeight: 1.6 }}>
              {sym} is priced from real {backing} market data — not random. A weighted blend of crop price momentum, demand, and farm health sets the rate.
            </p>
            {[
              { n: "Crop momentum", v: 68, c: "var(--primary)" },
              { n: "Market demand",  v: 45, c: "var(--money)"   },
              { n: "Farm health",    v: 80, c: "var(--water)"   },
            ].map((d) => (
              <div key={d.n} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                  <span className="muted">{d.n}</span>
                  <span className="mono semibold">{d.v}%</span>
                </div>
                <div className="track">
                  <div className="track-fill" style={{ width: `${d.v}%`, background: d.c }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div style={{ position: "sticky", top: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Trade card */}
          <div className="card" style={{ padding: 22 }}>
            <div className="segmented" style={{ width: "100%", marginBottom: 18 }}>
              <button className="seg-btn" data-active={side === "buy"} onClick={() => setSide("buy")} style={{ flex: 1, justifyContent: "center" }}>Buy</button>
              <button className="seg-btn" data-active={side === "sell"} onClick={() => setSide("sell")} style={{ flex: 1, justifyContent: "center" }}>Sell</button>
            </div>
            <div className="label">Units of {sym}</div>
            <div className="field" style={{ marginBottom: 16 }}>
              <input value={qty} onChange={(e) => setQty(e.target.value)} style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }} />
              <span className="mono faint">{sym}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
              <span className="muted">Price</span>
              <span className="mono">{toGHS(coin.currentPrice)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
              <span className="muted">Subtotal</span>
              <span className="mono">{toGHS(gross)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
              <span className="muted">Fee (0.5%)</span>
              <span className="mono">{toGHS(fee)}</span>
            </div>
            <hr className="divider" style={{ margin: "8px 0 12px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span className="semibold" style={{ fontWeight: 600 }}>{totalLabel}</span>
              <span className="mono semibold" style={{ fontSize: 15 }}>{toGHS(total)}</span>
            </div>
            <button className="btn btn-money btn-block btn-lg" disabled={buying || selling || coin.status !== "ACTIVE"} onClick={handleTrade}>
              {buying || selling ? "Processing…" : execLabel}
            </button>
          </div>

          {/* Your holding */}
          <div className="card" style={{ padding: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Your holding</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span className="muted">Units</span>
              <span className="mono semibold">{mine ? mine.holding.units : "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span className="muted">Value</span>
              <span className="mono semibold">{mine ? toGHS(mine.currentValue) : "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="muted">Unrealized P/L</span>
              {mine ? (
                <span className="mono semibold" style={{ color: mine.unrealizedPnl >= 0 ? "var(--gain)" : "var(--loss)" }}>
                  {mine.unrealizedPnl >= 0 ? "+" : ""}{toGHS(mine.unrealizedPnl)}
                </span>
              ) : (
                <span className="faint">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
