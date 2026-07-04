"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth-store";
import { AdminMetricsDocument } from "@/common/graphql/generated/graphql";
import { useMyWallet } from "@/common/hooks/queries/use-my-wallet";
import { useMyOffers } from "@/common/hooks/queries/use-my-offers";
import { useMyInvestments } from "@/common/hooks/queries/use-my-investments";
import { useInvestmentPlans } from "@/common/hooks/queries/use-investment-plans";
import { useCoins } from "@/common/hooks/queries/use-coins";
import { useMyCoins } from "@/common/hooks/queries/use-my-coins";
import { useMarketInsights } from "@/common/hooks/queries/use-market-insights";
import { useMyLedger } from "@/common/hooks/queries/use-my-ledger";
import { toGHS, formatRelative } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/status-badge";

/* ── icon SVG paths from the design ─────────────────────────── */
const ICON = {
  bell: [
    "M10.27 21a2 2 0 0 0 3.46 0",
    "M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33",
  ],
  alert: [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
    "M12 9v4",
    "M12 17h.01",
  ],
  offers: [
    "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z",
    "M14 2v6h6",
    "M16 13H8",
    "M16 17H8",
    "M10 9H8",
  ],
  market: [
    "M3 21h18",
    "M5 21V7l8-4v18",
    "M19 21V11l-6-4",
    "M9 9v.01",
    "M9 12v.01",
    "M9 15v.01",
  ],
};

function Ic({ paths, size = 16 }: { paths: string[]; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/* ── tiny sparkline helper ──────────────────────────────────── */
function Spark({
  values,
  color = "var(--primary)",
  w: propW,
  h: propH,
  full,
}: {
  values: number[];
  color?: string;
  w?: number;
  h?: number;
  full?: boolean;
}) {
  if (values.length < 2) return null;
  const mn = Math.min(...values);
  const mx = Math.max(...values);
  const rng = mx - mn || 1;
  const w = propW ?? 90;
  const h = propH ?? 32;
  const pts = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * w},${h - ((v - mn) / rng) * (h - 4) - 2}`,
    )
    .join(" ");
  return (
    <svg
      width={full ? "100%" : w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: "block" }}
      preserveAspectRatio="none"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={full ? "1.5" : "1.5"}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── percentage change indicator ───────────────────────────── */
function Pc({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <span className={`pc ${up ? "pc-up" : "pc-down"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

const RANGES = ["1M", "3M", "6M", "1Y"] as const;
type Range = (typeof RANGES)[number];
const RANGE_DAYS: Record<Range, number> = {
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
};

/* ────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const farmer = useAuthStore((s) => s.farmer);
  const activeRole = useAuthStore((s) => s.activeRole);
  const isAdmin = activeRole === "super_admin";

  const [range, setRange] = useState<Range>("3M");
  const ledgerFrom = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - RANGE_DAYS[range]);
    return d.toISOString();
  }, [range]);

  /* queries */
  const { data: walletData } = useMyWallet();
  const { data: offersData } = useMyOffers();
  const { data: investData } = useMyInvestments();
  const { data: plansData } = useInvestmentPlans("OPEN");
  const { data: coinsData } = useCoins();
  const { data: myCoinsData } = useMyCoins();
  const { data: insightsData } = useMarketInsights();
  const { data: ledgerData, loading: ledgerLoading } = useMyLedger(ledgerFrom);
  const { data: adminData } = useQuery(AdminMetricsDocument, {
    skip: !isAdmin,
  });

  /* derived values */
  const firstName = farmer?.firstName ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? `Good morning, ${firstName}.`
      : hour < 18
        ? `Good afternoon, ${firstName}.`
        : `Good evening, ${firstName}.`;

  const walletAvail = walletData?.myWallet.availableBalance ?? 0;
  const walletLocked = walletData?.myWallet.lockedBalance ?? 0;

  const activeInvest =
    investData?.myInvestments.filter((i) => i.status === "ACTIVE") ?? [];
  const investPrincipal = activeInvest.reduce((s, i) => s + i.principal, 0);

  const coinHoldings = myCoinsData?.myCoins ?? [];
  const coinValue = coinHoldings.reduce((s, c) => s + c.currentValue, 0);
  const coinPnl = coinHoldings.reduce((s, c) => s + c.unrealizedPnl, 0);
  const coinPnlUp = coinPnl >= 0;

  const portfolioTotal = walletAvail + investPrincipal + coinValue;

  /* running wallet-balance series from ledger (cash only, in range window) */
  const portfolioSeries = useMemo(() => {
    const entries = (ledgerData?.myLedger ?? [])
      .filter((e) => e.account === "USER_CASH")
      .slice()
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    if (entries.length === 0) return [portfolioTotal, portfolioTotal];
    let running = 0;
    return entries.map((e) => {
      running += e.direction === "CREDIT" ? e.amount : -e.amount;
      return running;
    });
  }, [ledgerData, portfolioTotal]);

  const portfolioPct = useMemo(() => {
    const first = portfolioSeries[0];
    const last = portfolioSeries[portfolioSeries.length - 1];
    return first ? ((last - first) / Math.abs(first)) * 100 : 0;
  }, [portfolioSeries]);

  const openOffers =
    offersData?.myOffers.filter((o) =>
      ["PENDING", "COUNTERED"].includes(o.status),
    ) ?? [];

  const planMap = Object.fromEntries(
    (plansData?.investmentPlans ?? []).map((p) => [p.id, p]),
  );

  const adminM = adminData?.adminMetrics;
  const insights = insightsData?.marketInsights ?? [];

  /* ─── ADMIN VIEW ────────────────────────────────────────────── */
  if (isAdmin) {
    const kpis = [
      {
        label: "Platform GMV",
        value: adminM ? toGHS(adminM.gmv) : "—",
        sub: "total traded",
        chg: <Pc pct={adminM?.gmvDelta ?? 0} />,
      },
      {
        label: "Assets under mgmt",
        value: adminM ? toGHS(adminM.aum) : "—",
        sub: "investments",
        chg: <Pc pct={adminM?.aumDelta ?? 0} />,
      },
      {
        label: "Active investments",
        value: adminM ? String(adminM.activeInvestments) : "—",
        sub: "positions open",
        chg: <Pc pct={adminM?.activeInvestmentsDelta ?? 0} />,
      },
      {
        label: "Total users",
        value: adminM ? String(adminM.totalUsers) : "—",
        sub: "registered",
        chg: <Pc pct={adminM?.totalUsersDelta ?? 0} />,
      },
    ];
    const attention = [
      {
        t: "Pending deals",
        s: `${adminM?.totalDeals ?? 0} total deals on platform`,
        icon: ICON.offers,
      },
      {
        t: "Active listings",
        s: `${adminM?.totalListings ?? 0} listings in marketplace`,
        icon: ICON.market,
      },
      {
        t: "Coin market volume",
        s: adminM ? toGHS(adminM.coinVolume) + " traded" : "—",
        icon: ICON.bell,
      },
    ];

    return (
      <div className="anim-up">
        <div style={{ marginBottom: 22 }}>
          <div className="eyebrow">Super admin</div>
          <h1 className="h1" style={{ margin: "6px 0 0" }}>
            Platform overview
          </h1>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            Marketplace, investments and coin activity across AgriMarket.
          </p>
        </div>

        <div className="grid-stat" style={{ marginBottom: 20 }}>
          {kpis.map((k) => (
            <div key={k.label} className="card" style={{ padding: 18 }}>
              <div className="eyebrow">{k.label}</div>
              <div
                className="metric"
                style={{ fontSize: 26, margin: "12px 0 8px" }}
              >
                {k.value}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {k.chg}
                <span className="faint" style={{ fontSize: 11.5 }}>
                  {k.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div className="card" style={{ padding: 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span className="h3">Recent activity</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => router.push("/notifications")}
              >
                View all
              </button>
            </div>
            {insights.length === 0 ? (
              <p
                className="faint text-sm"
                style={{ textAlign: "center", padding: "20px 0" }}
              >
                No recent activity
              </p>
            ) : (
              insights.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: "flex",
                    gap: 13,
                    padding: "13px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span className="badge badge-primary">
                    {n.type.replace(/_/g, " ")}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      className="semibold"
                      style={{ fontWeight: 600, color: "var(--ink)" }}
                    >
                      {String(
                        (n.payload as Record<string, string>)?.summary ??
                          (n.payload as Record<string, string>)?.message ??
                          n.type,
                      )}
                    </div>
                    <div
                      className="faint"
                      style={{ fontSize: 12, marginTop: 3 }}
                    >
                      {formatRelative(n.publishedAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div className="h3" style={{ marginBottom: 16 }}>
              Needs attention
            </div>
            {attention.map((a) => (
              <div
                key={a.t}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span
                  className="iconbox iconbox-sm"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--ink-2)",
                  }}
                >
                  <Ic paths={a.icon} size={16} />
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    className="semibold"
                    style={{
                      fontWeight: 600,
                      color: "var(--ink)",
                      fontSize: 13.5,
                    }}
                  >
                    {a.t}
                  </div>
                  <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>
                    {a.s}
                  </div>
                </div>
              </div>
            ))}
            <button
              className="btn btn-outline btn-block"
              style={{ marginTop: 14 }}
              onClick={() => router.push("/investment-plans")}
            >
              Open admin console
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── INVESTOR / COMPANY VIEW ───────────────────────────────── */
  return (
    <div className="anim-up">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div>
          <div className="eyebrow">Portfolio</div>
          <h1 className="h1" style={{ margin: "6px 0 0" }}>
            {greeting}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-outline"
            onClick={() => router.push("/wallet")}
          >
            Wallet
          </button>
          <button
            className="btn btn-primary"
            onClick={() => router.push("/market-trends")}
          >
            Explore markets
          </button>
        </div>
      </div>

      {/* Portfolio chart + mini cards */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div className="eyebrow">Total portfolio value</div>
              <div
                className="metric"
                style={{ fontSize: 34, margin: "10px 0 8px" }}
              >
                {toGHS(portfolioTotal)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Pc pct={portfolioPct} />
                <span className="faint" style={{ fontSize: 12.5 }}>
                  past {range}
                </span>
              </div>
            </div>
            <div className="segmented">
              {RANGES.map((r) => (
                <button
                  key={r}
                  className="seg-btn"
                  data-active={range === r}
                  onClick={() => setRange(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            {ledgerLoading ? (
              <div
                className="skel"
                style={{ height: 150, borderRadius: "var(--r-md)" }}
              />
            ) : (
              <Spark
                values={portfolioSeries}
                color="var(--primary)"
                full
                h={150}
              />
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="eyebrow">Wallet available</div>
            <div
              className="metric"
              style={{ fontSize: 24, margin: "10px 0 4px" }}
            >
              {toGHS(walletAvail)}
            </div>
            <div className="faint" style={{ fontSize: 12 }}>
              {toGHS(walletLocked)} in escrow
            </div>
          </div>
          <div className="card" style={{ padding: 18 }}>
            <div className="eyebrow">Coin holdings</div>
            <div
              className="metric"
              style={{ fontSize: 24, margin: "10px 0 4px" }}
            >
              {toGHS(coinValue)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: coinPnlUp ? "var(--gain)" : "var(--loss)",
                }}
              >
                {coinPnlUp ? "+" : ""}
                {toGHS(coinPnl)}
              </span>
              <span className="faint" style={{ fontSize: 12 }}>
                unrealized
              </span>
            </div>
          </div>
          <div className="card" style={{ padding: 18 }}>
            <div className="eyebrow">Active investments</div>
            <div
              className="metric"
              style={{ fontSize: 24, margin: "10px 0 4px" }}
            >
              {activeInvest.length} positions
            </div>
            <div className="faint" style={{ fontSize: 12 }}>
              {toGHS(investPrincipal)} principal
            </div>
          </div>
        </div>
      </div>

      {/* Market snapshot ticker */}
      <div className="card" style={{ padding: "18px 22px", marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          Market snapshot
        </div>
        <div className="ticker">
          {(coinsData?.coins ?? []).map((coin) => {
            const pct = coin.basePrice
              ? ((coin.currentPrice - coin.basePrice) / coin.basePrice) * 100
              : 0;
            return (
              <button
                key={coin.id}
                className="tk-cell card-hover"
                onClick={() => router.push(`/coins/${coin.id}`)}
                style={{ textAlign: "left" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span className="semibold" style={{ fontWeight: 700 }}>
                    {coin.symbol}
                  </span>
                  <Pc pct={pct} />
                </div>
                <div className="mono" style={{ fontSize: 13, marginBottom: 6 }}>
                  {toGHS(coin.currentPrice)}
                </div>
                <Spark
                  values={[coin.basePrice, coin.currentPrice]}
                  color={pct >= 0 ? "var(--gain)" : "var(--loss)"}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Open offers + Active investments */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span className="h3">Open offers</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push("/my-offers")}
            >
              All offers
            </button>
          </div>
          {openOffers.length === 0 ? (
            <p
              className="faint text-sm"
              style={{ textAlign: "center", padding: "20px 0" }}
            >
              No open offers
            </p>
          ) : (
            openOffers.slice(0, 4).map((o) => (
              <button
                key={o.id}
                onClick={() => router.push("/my-offers")}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  textAlign: "left",
                  padding: "13px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div>
                  <div
                    className="semibold"
                    style={{ fontWeight: 600, color: "var(--ink)" }}
                  >
                    Listing #{o.listingId.slice(-6)}
                  </div>
                  <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>
                    {formatRelative(o.createdAt)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono semibold" style={{ fontWeight: 600 }}>
                    {toGHS(o.amount)}
                  </div>
                  <div style={{ marginTop: 5 }}>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span className="h3">Active investments</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push("/my-investments")}
            >
              Portfolio
            </button>
          </div>
          {activeInvest.length === 0 ? (
            <p
              className="faint text-sm"
              style={{ textAlign: "center", padding: "20px 0" }}
            >
              No active investments
            </p>
          ) : (
            activeInvest.slice(0, 3).map((inv) => {
              const plan = planMap[inv.planId];
              const matures = new Date(inv.maturesAt);
              const daysLeft = Math.max(
                0,
                Math.ceil((matures.getTime() - Date.now()) / 86_400_000),
              );
              const projMin = plan
                ? toGHS(inv.units * plan.expectedProfitMin)
                : "—";
              const projMax = plan
                ? toGHS(inv.units * plan.expectedProfitMax)
                : "—";
              const pct = plan
                ? Math.round(100 - (daysLeft / plan.maturityDays) * 100)
                : 50;
              return (
                <div
                  key={inv.id}
                  style={{
                    padding: "13px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      className="semibold"
                      style={{ fontWeight: 600, color: "var(--ink)" }}
                    >
                      {plan?.title ?? `Plan #${inv.planId.slice(-6)}`}
                    </span>
                    <span className="badge badge-mod">{daysLeft}d left</span>
                  </div>
                  <div className="track" style={{ marginBottom: 8 }}>
                    <div className="track-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                    }}
                  >
                    <span className="faint">
                      {inv.units} units · {toGHS(inv.principal)}
                    </span>
                    <span className="muted mono">
                      Proj {projMin}–{projMax}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Coin holdings P/L + Insights */}
      <div className="grid-2">
        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span className="h3">Coin holdings · P/L</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push("/coins")}
            >
              Trade
            </button>
          </div>
          {coinHoldings.length === 0 ? (
            <p
              className="faint text-sm"
              style={{ textAlign: "center", padding: "20px 0" }}
            >
              No coin holdings yet
            </p>
          ) : (
            coinHoldings.slice(0, 4).map((h) => {
              const plUp = h.unrealizedPnl >= 0;
              return (
                <div
                  key={h.coin.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      className="semibold"
                      style={{ fontWeight: 600, color: "var(--ink)" }}
                    >
                      {h.coin.symbol}
                    </div>
                    <div className="faint" style={{ fontSize: 12 }}>
                      {h.holding.units} units
                    </div>
                  </div>
                  <div style={{ width: 90 }}>
                    <Spark
                      values={[h.holding.avgCost, h.coin.currentPrice]}
                      color={plUp ? "var(--gain)" : "var(--loss)"}
                    />
                  </div>
                  <div style={{ textAlign: "right", minWidth: 96 }}>
                    <div className="mono semibold" style={{ fontWeight: 600 }}>
                      {toGHS(h.currentValue)}
                    </div>
                    <div
                      style={{
                        marginTop: 3,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: plUp ? "var(--gain)" : "var(--loss)",
                      }}
                    >
                      {plUp ? "+" : ""}
                      {toGHS(h.unrealizedPnl)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span className="h3">What&apos;s new</span>
            <span className="badge badge-primary">Insights</span>
          </div>
          {insights.length === 0 ? (
            <p
              className="faint text-sm"
              style={{ textAlign: "center", padding: "20px 0" }}
            >
              No insights available
            </p>
          ) : (
            insights.slice(0, 4).map((n) => (
              <button
                key={n.id}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "13px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <span className="badge">{n.type.replace(/_/g, " ")}</span>
                  <span className="faint" style={{ fontSize: 11.5 }}>
                    {formatRelative(n.publishedAt)}
                  </span>
                </div>
                <div
                  className="semibold"
                  style={{
                    fontWeight: 600,
                    color: "var(--ink)",
                    lineHeight: 1.3,
                  }}
                >
                  {String(
                    (n.payload as Record<string, string>)?.summary ??
                      (n.payload as Record<string, string>)?.title ??
                      n.type.replace(/_/g, " "),
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
