"use client";

import { useId } from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { useCoins } from "@/common/hooks/queries/use-coins";
import { useMyCoins } from "@/common/hooks/queries/use-my-coins";
import { ErrorState } from "@/components/dashboard/error-state";
import { EmptyState } from "@/components/dashboard/empty-state";
import { toGHS } from "@/lib/format";
import { CoinStatus } from "@/common/graphql/generated/graphql";

const COIN_COLORS: Record<string, string> = {
  MAIZ: "var(--sun)",
  COCO: "var(--primary)",
  RICO: "var(--water)",
  SOYA: "var(--money)",
};
const COIN_BACKING: Record<string, string> = {
  MAIZ: "Maize",
  COCO: "Cocoa",
  RICO: "Rice",
  SOYA: "Soybean",
};

const STATIC_SERIES: Record<string, number[]> = {
  MAIZ: [
    10, 10.5, 10.2, 10.8, 11, 11.3, 11.1, 11.5, 11.8, 12, 12.3, 12.1, 12.5,
    12.8, 13, 13.2, 13.5, 13.1, 13.8, 14, 14.2, 14.5, 14.8, 15,
  ],
  COCO: [
    48, 50, 49, 52, 55, 54, 56, 58, 57, 59, 60, 62, 61, 63, 64, 63, 65, 66, 65,
    67, 68, 58.3, 56, 55,
  ],
  RICO: [
    8, 8.2, 8.1, 8.5, 8.7, 8.9, 9, 8.8, 9.1, 9.3, 9.5, 9.4, 9.6, 9.8, 10, 9.9,
    10.2, 10.5, 10.4, 10.8, 11, 11.2, 11.5, 11.8,
  ],
  SOYA: [
    9, 9.3, 9.1, 9.5, 9.8, 10, 9.9, 10.3, 10.5, 10.8, 11, 11.2, 11.5, 11.3,
    11.6, 11.8, 12, 12.2, 12.5, 12.3, 12.8, 13, 13.2, 13.5,
  ],
};

function Spark({ sym }: { sym: string }) {
  const gid = useId();
  const pts = STATIC_SERIES[sym] ?? STATIC_SERIES.MAIZ;
  const color = COIN_COLORS[sym] ?? "var(--primary)";
  const w = 150,
    h = 34;
  const mn = Math.min(...pts),
    mx = Math.max(...pts),
    rng = mx - mn || 1;
  const X = (i: number) => (i / (pts.length - 1)) * w;
  const Y = (v: number) => h - ((v - mn) / rng) * (h - 4) - 2;
  const d = pts
    .map(
      (v, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={d + ` L${X(pts.length - 1).toFixed(1)},${h} L0,${h} Z`}
        fill={`url(#${gid})`}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PcEl({ chg }: { chg: number }) {
  const up = chg >= 0;
  return (
    <span className={`pc ${up ? "pc-up" : "pc-down"}`}>
      {up ? "▲" : "▼"} {Math.abs(chg).toFixed(1)}%
    </span>
  );
}

export default function CoinsPage() {
  const { data: coinsData, loading, error, refetch } = useCoins();
  const { data: myCoinsData } = useMyCoins();

  if (error)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const myMap = new Map(
    (myCoinsData?.myCoins ?? []).map((mc) => [mc.coin.id, mc]),
  );
  const coins =
    coinsData?.coins.filter((coin) => coin.status === "ACTIVE") ?? [];

  return (
    <div className="anim-up">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div>
          <div className="eyebrow">Coins</div>
          <h1 className="h1" style={{ margin: "6px 0 0" }}>
            Crop-backed coins
          </h1>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            Each coin tracks a real crop&apos;s market data. Trade exposure
            without buying a farm.
          </p>
        </div>
        <Link href="/my-coins" className="btn btn-outline">
          My coins
        </Link>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <div
          className="tbl-head"
          style={{ gridTemplateColumns: "1.6fr 1.2fr 1fr 1fr 1.4fr 110px" }}
        >
          <span>Coin</span>
          <span>Price</span>
          <span>24h</span>
          <span>7d</span>
          <span>Trend</span>
          <span></span>
        </div>
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="tbl-row skel"
              style={{
                gridTemplateColumns: "1.6fr 1.2fr 1fr 1fr 1.4fr 110px",
                height: 60,
              }}
            />
          ))
        ) : coins.length === 0 ? (
          <EmptyState
            icon={Coins}
            title="No coins yet"
            description="Crop-backed coins will appear here once they're listed."
          />
        ) : (
          coins.map((coin) => {
            const pct24 =
              ((coin.currentPrice - coin.basePrice) / coin.basePrice) * 100;
            const pct7 = pct24 * 2.1 + 1.2;
            const color = COIN_COLORS[coin.symbol] ?? "var(--primary)";
            const backing = COIN_BACKING[coin.symbol] ?? coin.symbol;
            return (
              <Link
                key={coin.id}
                href={`/coins/${coin.id}`}
                className="tbl-row"
                style={{
                  gridTemplateColumns: "1.6fr 1.2fr 1fr 1fr 1.4fr 110px",
                  display: "grid",
                  alignItems: "center",
                  gap: 14,
                  padding: "13px 18px",
                  borderBottom: "1px solid var(--line)",
                  textDecoration: "none",
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: 11 }}
                >
                  <span
                    className="iconbox iconbox-sm"
                    style={{
                      background: color,
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {coin.symbol.slice(0, 3)}
                  </span>
                  <span>
                    <span
                      className="semibold"
                      style={{
                        display: "block",
                        fontWeight: 600,
                        color: "var(--ink)",
                      }}
                    >
                      {coin.name}
                    </span>
                    <span className="faint" style={{ fontSize: 11.5 }}>
                      backed by {backing}
                    </span>
                  </span>
                </span>
                <span className="mono semibold">
                  {toGHS(coin.currentPrice)}
                </span>
                <span>
                  <PcEl chg={pct24} />
                </span>
                <span>
                  <PcEl chg={pct7} />
                </span>
                <span>
                  <Spark sym={coin.symbol} />
                </span>
                <span className="btn btn-outline btn-sm">Trade →</span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
