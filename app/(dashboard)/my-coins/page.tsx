"use client";

import Link from "next/link";
import { useMyCoins } from "@/common/hooks/queries/use-my-coins";
import { ErrorState } from "@/components/dashboard/error-state";
import { toGHS } from "@/lib/format";

const COIN_COLORS: Record<string, string> = {
  MAIZ: "var(--sun)",
  COCO: "var(--primary)",
  RICO: "var(--water)",
  SOYA: "var(--money)",
};

export default function MyCoinsPage() {
  const { data, loading, error, refetch } = useMyCoins();

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const holdings = data?.myCoins ?? [];
  const totalValue = holdings.reduce((s, mc) => s + mc.currentValue, 0);
  const totalPnl   = holdings.reduce((s, mc) => s + mc.unrealizedPnl, 0);

  return (
    <div className="anim-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div>
          <div className="eyebrow">Coins</div>
          <h1 className="h1" style={{ margin: "6px 0 0" }}>My coin holdings</h1>
          <p className="muted" style={{ margin: "6px 0 0" }}>Your current positions across all crop-backed coins.</p>
        </div>
        <Link href="/coins" className="btn btn-outline">← All coins</Link>
      </div>

      {/* Summary cards */}
      {!loading && holdings.length > 0 && (
        <div className="grid-2" style={{ gap: 14, marginBottom: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="eyebrow">Total coin value</div>
            <div className="metric" style={{ fontSize: 28, marginTop: 10, color: "var(--money)" }}>{toGHS(totalValue)}</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div className="eyebrow">Unrealized P&amp;L</div>
            <div className="metric" style={{ fontSize: 28, marginTop: 10, color: totalPnl >= 0 ? "var(--gain)" : "var(--loss)" }}>
              {totalPnl >= 0 ? "+" : ""}{toGHS(totalPnl)}
            </div>
          </div>
        </div>
      )}

      {/* Holdings table */}
      <div className="card" style={{ overflowX: "auto" }}>
        <div className="tbl-head" style={{ gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr 100px" }}>
          <span>Coin</span><span>Units</span><span>Avg cost</span><span>Current price</span><span>Value</span><span>P&amp;L</span>
        </div>
        {loading
          ? [1,2,3].map((i) => (
              <div key={i} className="tbl-row skel" style={{ gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr 100px", height: 62 }} />
            ))
          : holdings.length === 0
            ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <p className="muted" style={{ marginBottom: 14 }}>You don&apos;t hold any coins yet.</p>
                <Link href="/coins" className="btn btn-primary">Browse coins</Link>
              </div>
            )
            : holdings.map((mc) => {
                const color = COIN_COLORS[mc.coin.symbol] ?? "var(--primary)";
                const plUp  = mc.unrealizedPnl >= 0;
                return (
                  <Link
                    key={mc.holding.id}
                    href={`/coins/${mc.coin.id}`}
                    className="tbl-row"
                    style={{ gridTemplateColumns: "1.8fr 1fr 1fr 1fr 1fr 100px", display: "grid", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: "1px solid var(--line)", textDecoration: "none" }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <span className="iconbox iconbox-sm" style={{ background: color, color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                        {mc.coin.symbol.slice(0, 3)}
                      </span>
                      <span className="semibold" style={{ fontWeight: 600, color: "var(--ink)" }}>{mc.coin.name}</span>
                    </span>
                    <span className="mono">{mc.holding.units.toLocaleString()}</span>
                    <span className="mono faint">{toGHS(mc.holding.avgCost)}</span>
                    <span className="mono">{toGHS(mc.coin.currentPrice)}</span>
                    <span className="mono semibold">{toGHS(mc.currentValue)}</span>
                    <span className="mono semibold" style={{ color: plUp ? "var(--gain)" : "var(--loss)", fontSize: 12.5 }}>
                      {plUp ? "+" : ""}{toGHS(mc.unrealizedPnl)}
                    </span>
                  </Link>
                );
              })}
      </div>
    </div>
  );
}
