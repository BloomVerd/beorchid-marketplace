"use client";

import { useState } from "react";
import { useMyWallet } from "@/common/hooks/queries/use-my-wallet";
import { useMyLedger } from "@/common/hooks/queries/use-my-ledger";
import { useMyCoins } from "@/common/hooks/queries/use-my-coins";
import { useMyInvestments } from "@/common/hooks/queries/use-my-investments";
import { useModalStore } from "@/stores/modal-store";
import { ErrorState } from "@/components/dashboard/error-state";
import { toGHS, formatDate } from "@/lib/format";
import { LedgerAccount } from "@/common/graphql/generated/graphql";

const LEDGER_CHIPS = ["All", "Deposit", "Coin trade", "Investment", "Escrow", "Withdraw"];

const SLICE_COLORS = ["var(--primary)", "var(--water)", "var(--money)", "var(--line)"];
const SLICE_LABELS = ["Cash balance", "Coin value", "Investments", "Escrow"];

const CHIP_ACCOUNT: Record<string, LedgerAccount | undefined> = {
  "Deposit":    "USER_CASH",
  "Coin trade": "COIN_POOL",
  "Investment": "INVESTMENT_POOL",
  "Escrow":     "ESCROW",
  "Withdraw":   "USER_CASH",
};

function DonutSVG({ parts, total }: { parts: number[]; total: number }) {
  const r = 58, cx = 80, cy = 80, gap = 2;
  const circ = 2 * Math.PI * r;
  const safeTotal = total || 1;
  let offset = 0;
  const slices = parts.map((v, i) => {
    const f = v / safeTotal;
    const len = Math.max(0, f * circ - gap);
    const s = { len, offset, color: SLICE_COLORS[i] };
    offset += f * circ;
    return s;
  });
  return (
    <svg width={160} height={160} viewBox="0 0 160 160" style={{ display: "block", flexShrink: 0 }}>
      {slices.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill="none" stroke={s.color} strokeWidth={18}
          strokeDasharray={`${s.len} ${circ - s.len}`}
          strokeDashoffset={-s.offset + circ * 0.25}
          strokeLinecap="round"
        />
      ))}
      <text x={cx} y={cy - 7} textAnchor="middle" fontSize={9} fill="var(--ink-3)" fontFamily="var(--font-sans)">TOTAL</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-mono)">{toGHS(total)}</text>
    </svg>
  );
}

export default function WalletPage() {
  const [activeChip, setActiveChip] = useState(0);
  const openDepositModal = useModalStore((s) => s.openDepositModal);

  const chipLabel    = LEDGER_CHIPS[activeChip];
  const accountFilter = CHIP_ACCOUNT[chipLabel];

  const { data: walletData, loading: wLoading, error: wError, refetch } = useMyWallet();
  const { data: ledgerData, loading: lLoading } = useMyLedger(undefined, undefined, accountFilter);
  const { data: myCoinsData } = useMyCoins();
  const { data: myInvestData } = useMyInvestments();

  if (wError) return <ErrorState message={wError.message} onRetry={() => refetch()} />;

  const wallet = walletData?.myWallet;
  const avail  = wallet?.availableBalance ?? 0;
  const locked = wallet?.lockedBalance ?? 0;

  const coinValue   = (myCoinsData?.myCoins ?? []).reduce((s, mc) => s + mc.currentValue, 0);
  const investValue = (myInvestData?.myInvestments ?? [])
    .filter(i => i.status === "ACTIVE")
    .reduce((s, i) => s + i.principal, 0);

  const portfolioParts = [avail, coinValue, investValue, locked];
  const portfolioTotal = portfolioParts.reduce((s, v) => s + v, 0);

  const rawLedger = ledgerData?.myLedger ?? [];
  const ledger = chipLabel === "Deposit"
    ? rawLedger.filter(e => e.direction === "CREDIT")
    : chipLabel === "Withdraw"
      ? rawLedger.filter(e => e.direction === "DEBIT")
      : rawLedger;

  return (
    <div className="anim-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div>
          <div className="eyebrow">Funds</div>
          <h1 className="h1" style={{ margin: "6px 0 0" }}>Your money</h1>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" onClick={() => openDepositModal("withdraw")}>Withdraw</button>
          <button className="btn btn-money" onClick={() => openDepositModal("deposit")}>+ Deposit</button>
        </div>
      </div>

      {/* Portfolio + Balances */}
      <div className="grid-2" style={{ gap: 16, marginBottom: 18 }}>
        {/* Donut portfolio card */}
        <div className="card" style={{ padding: 22, display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
          {wLoading
            ? <div style={{ width: 160, height: 160, borderRadius: "50%", background: "var(--surface-2)" }} />
            : <DonutSVG parts={portfolioParts} total={portfolioTotal} />}
          <div style={{ flex: 1, minWidth: 140 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Portfolio</div>
            {SLICE_LABELS.map((label, i) => {
              const value = portfolioParts[i] ?? 0;
              const pct   = portfolioTotal > 0 ? (value / portfolioTotal) * 100 : 0;
              return (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: SLICE_COLORS[i], display: "inline-block", flexShrink: 0 }} />
                    <span className="muted">{label}</span>
                  </span>
                  <span className="mono semibold" style={{ fontSize: 12.5 }}>
                    {wLoading ? "—" : toGHS(value)}
                    <span className="faint" style={{ marginLeft: 5, fontWeight: 400 }}>{pct.toFixed(0)}%</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Balance cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 20, flex: 1 }}>
            <div className="eyebrow">Available balance</div>
            <div className="metric" style={{ fontSize: 28, marginTop: 12, color: "var(--money)" }}>
              {wLoading ? "—" : toGHS(avail)}
            </div>
            <p className="faint" style={{ fontSize: 12, marginTop: 6 }}>Ready to invest, trade, or withdraw.</p>
          </div>
          <div className="card" style={{ padding: 20, flex: 1 }}>
            <div className="eyebrow">In escrow</div>
            <div className="metric" style={{ fontSize: 28, marginTop: 12, color: "var(--ink-2)" }}>
              {wLoading ? "—" : toGHS(locked)}
            </div>
            <p className="faint" style={{ fontSize: 12, marginTop: 6 }}>Held until deal completes.</p>
          </div>
        </div>
      </div>

      {/* Transaction ledger */}
      <div className="card" style={{ overflowX: "auto" }}>
        <div style={{ padding: "18px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div className="h3">Transactions</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {LEDGER_CHIPS.map((c, i) => (
              <button key={c} className={`chip${i === activeChip ? " chip-active" : ""}`} onClick={() => setActiveChip(i)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="tbl-head" style={{ gridTemplateColumns: "1.6fr 1.6fr 1fr 1fr 110px" }}>
          <span>Type</span><span>Detail</span><span>Date</span><span>Amount</span><span>Status</span>
        </div>
        {lLoading
          ? [1,2,3,4].map((i) => <div key={i} className="tbl-row skel" style={{ gridTemplateColumns: "1.6fr 1.6fr 1fr 1fr 110px", height: 52 }} />)
          : ledger.length === 0
            ? <div style={{ padding: "28px 20px", textAlign: "center" }} className="faint">No transactions yet.</div>
            : ledger.map((entry) => {
                const credit = entry.direction === "CREDIT";
                return (
                  <div key={entry.id} className="tbl-row" style={{ gridTemplateColumns: "1.6fr 1.6fr 1fr 1fr 110px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span className="iconbox iconbox-sm" style={{ background: credit ? "var(--primary-soft)" : "var(--surface-3)", color: credit ? "var(--primary)" : "var(--ink-3)", fontSize: 13 }}>
                        {credit ? "↓" : "↑"}
                      </span>
                      <span className="semibold" style={{ fontSize: 13, fontWeight: 600 }}>{credit ? "Credit" : "Debit"}</span>
                    </span>
                    <span className="muted" style={{ fontSize: 12.5 }}>{entry.account.replace(/_/g, " ")}</span>
                    <span className="mono faint" style={{ fontSize: 12 }}>{formatDate(entry.createdAt)}</span>
                    <span className="mono semibold" style={{ color: credit ? "var(--gain)" : "var(--loss)", fontSize: 13 }}>
                      {credit ? "+" : "−"}{toGHS(entry.amount)}
                    </span>
                    <span><span className="badge badge-low">Settled</span></span>
                  </div>
                );
              })}
      </div>

    </div>
  );
}
