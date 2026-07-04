"use client";

import Link from "next/link";
import { useMyInvestments } from "@/common/hooks/queries/use-my-investments";
import { ErrorState } from "@/components/dashboard/error-state";
import { toGHS, formatDate } from "@/lib/format";

function plEl(pl: number) {
  const up = pl >= 0;
  return (
    <span style={{ color: up ? "var(--gain)" : "var(--loss)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
      {up ? "+" : ""}{toGHS(pl)}
    </span>
  );
}

export default function MyInvestmentsPage() {
  const { data, loading, error, refetch } = useMyInvestments();

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const investments = data?.myInvestments ?? [];
  const active  = investments.filter((i) => i.status === "ACTIVE");
  const settled = investments.filter((i) => i.status !== "ACTIVE");

  const totalInvested = investments.reduce((s, i) => s + i.principal, 0);
  const totalReturned = settled.reduce((s, i) => s + (i.payoutAmount ?? 0), 0);

  return (
    <div className="anim-up">
      <Link href="/investments" className="btn btn-ghost btn-sm" style={{ marginBottom: 14, paddingLeft: 0 }}>
        ← Investment plans
      </Link>
      <h1 className="h1" style={{ margin: "0 0 6px" }}>My investments</h1>
      <p className="muted" style={{ margin: "0 0 20px" }}>Track active positions and settled payouts.</p>

      {/* Summary stats */}
      <div className="grid-3" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 22 }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Total invested</div>
          <div className="metric" style={{ fontSize: 24, marginTop: 10 }}>{toGHS(totalInvested)}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Total returned</div>
          <div className="metric" style={{ fontSize: 24, marginTop: 10, color: "var(--gain)" }}>{toGHS(totalReturned)}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Active positions</div>
          <div className="metric" style={{ fontSize: 24, marginTop: 10 }}>{active.length}</div>
        </div>
      </div>

      {/* Active positions */}
      <div className="card" style={{ marginBottom: 22, overflowX: "auto" }}>
        <div style={{ padding: "16px 20px" }} className="h3">Active positions</div>
        <div className="tbl-head" style={{ gridTemplateColumns: "2fr 1fr 1.4fr 1.2fr" }}>
          <span>Plan</span><span>Units</span><span>Maturity</span><span>Projected</span>
        </div>
        {loading
          ? [1,2].map((i) => <div key={i} className="tbl-row skel" style={{ gridTemplateColumns: "2fr 1fr 1.4fr 1.2fr", height: 52 }} />)
          : active.length === 0
            ? <div style={{ padding: "20px 20px", textAlign: "center" }} className="faint">No active investments yet.</div>
            : active.map((p) => {
                const totalDays = p.maturesAt
                  ? Math.max(0, Math.round((new Date(p.maturesAt).getTime() - Date.now()) / 86400000))
                  : 90;
                const projMin = toGHS(p.principal * 1.12);
                const projMax = toGHS(p.principal * 1.26);
                return (
                  <div key={p.id} className="tbl-row" style={{ gridTemplateColumns: "2fr 1fr 1.4fr 1.2fr" }}>
                    <span className="semibold" style={{ fontWeight: 600, color: "var(--ink)" }}>{p.planId.slice(0,12)}…</span>
                    <span className="mono">{p.units}</span>
                    <span>
                      <span className="badge badge-mod" style={{ marginBottom: 5 }}>{totalDays}d left</span>
                      <div className="track" style={{ marginTop: 4 }}>
                        <div className="track-fill" style={{ width: "45%" }} />
                      </div>
                    </span>
                    <span className="mono" style={{ color: "var(--money)", fontSize: 12.5 }}>{projMin}–{projMax}</span>
                  </div>
                );
              })}
      </div>

      {/* Settled positions */}
      <div className="card" style={{ overflowX: "auto" }}>
        <div style={{ padding: "16px 20px" }} className="h3">Settled positions</div>
        <div className="tbl-head" style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1fr" }}>
          <span>Plan</span><span>Units</span><span>Principal</span><span>Payout</span><span>P/L</span>
        </div>
        {loading
          ? [1,2].map((i) => <div key={i} className="tbl-row skel" style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1fr", height: 52 }} />)
          : settled.length === 0
            ? <div style={{ padding: "20px 20px", textAlign: "center" }} className="faint">No settled investments yet.</div>
            : settled.map((p) => {
                const payout = p.payoutAmount ?? 0;
                const pl = payout - p.principal;
                return (
                  <div key={p.id} className="tbl-row" style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1fr" }}>
                    <span className="semibold" style={{ fontWeight: 600, color: "var(--ink)" }}>{p.planId.slice(0,12)}…</span>
                    <span className="mono">{p.units}</span>
                    <span className="mono">{toGHS(p.principal)}</span>
                    <span className="mono semibold">{payout ? toGHS(payout) : "—"}</span>
                    <span>{payout ? plEl(pl) : <span className="faint">—</span>}</span>
                  </div>
                );
              })}
      </div>
    </div>
  );
}
