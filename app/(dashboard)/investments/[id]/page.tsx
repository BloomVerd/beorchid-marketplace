"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useInvestmentPlanDetail } from "@/common/hooks/queries/use-investment-plan-detail";
import { usePurchaseInvestment } from "@/common/hooks/mutations/use-purchase-investment";
import { useMyWallet } from "@/common/hooks/queries/use-my-wallet";
import { ErrorState } from "@/components/dashboard/error-state";
import { toGHS } from "@/lib/format";

function riskBadge(notes: string | null | undefined) {
  const n = (notes ?? "").toLowerCase();
  if (n.includes("high"))                              return { cls: "badge badge-high", label: "High" };
  if (n.includes("moderate") || n.includes("medium")) return { cls: "badge badge-mod",  label: "Moderate" };
  return                                                      { cls: "badge badge-low",  label: "Low" };
}

export default function InvestmentPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [units, setUnits] = useState(5);

  const { data, loading, error, refetch } = useInvestmentPlanDetail(id);
  const { data: walletData } = useMyWallet();
  const [purchase, { loading: buying }] = usePurchaseInvestment();

  if (loading) return <div className="card skel" style={{ minHeight: 400 }} />;
  if (error || !data?.investmentPlan) return <ErrorState message={error?.message} onRetry={() => refetch()} />;

  const plan = data.investmentPlan;
  const rb = riskBadge(plan.riskNotes);
  const maturityMonths = Math.round(plan.maturityDays / 30);
  const cost = plan.unitCost * units;
  const rmin = plan.expectedProfitMin * units;
  const rmax = plan.expectedProfitMax * units;
  const walletBalance = walletData?.myWallet?.availableBalance ?? 0;
  const afterWallet = walletBalance - cost;
  const retPct = cost > 0 ? `${((rmin / cost) * 100).toFixed(0)}–${((rmax / cost) * 100).toFixed(0)}%` : "—";

  const handlePurchase = async () => {
    if (units < 1 || units > plan.unitsRemaining) { toast.error("Invalid unit count."); return; }
    try {
      await purchase({ variables: { planId: id, units } });
      toast.success("Investment purchased!");
      router.push("/my-investments");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Purchase failed."); }
  };

  return (
    <div className="anim-up">
      <Link href="/investments" className="btn btn-ghost btn-sm" style={{ marginBottom: 14, paddingLeft: 0 }}>
        ← Investment plans
      </Link>

      <div className="detail-grid">
        {/* Left */}
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <span className="badge badge-primary">{plan.title}</span>
            <span className={rb.cls}>{rb.label} risk</span>
          </div>
          <h1 className="h1" style={{ margin: 0 }}>{plan.title} harvest plan</h1>
          <p className="muted" style={{ margin: "8px 0 18px" }}>{plan.acreage} acres · matures in {maturityMonths} months</p>

          {/* 3 metric cards */}
          <div className="grid-3" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
            <div className="card" style={{ padding: 16 }}>
              <div className="eyebrow">Unit cost</div>
              <div className="metric" style={{ fontSize: 20, marginTop: 10 }}>{toGHS(plan.unitCost)}</div>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div className="eyebrow">Projected / unit</div>
              <div className="metric" style={{ fontSize: 20, marginTop: 10, color: "var(--money)" }}>{toGHS(plan.expectedProfitMin)}+</div>
              <div className="faint" style={{ fontSize: 11, marginTop: 3 }}>up to {toGHS(plan.expectedProfitMax)}</div>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div className="eyebrow">Units left</div>
              <div className="metric" style={{ fontSize: 20, marginTop: 10 }}>{plan.unitsRemaining}</div>
              <div className="faint" style={{ fontSize: 11, marginTop: 3 }}>of {plan.totalUnits}</div>
            </div>
          </div>

          {/* Payout illustration */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div className="h3" style={{ marginBottom: 14 }}>Projected payout illustration</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 120, padding: "0 8px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", height: 50, background: "var(--surface-3)", borderRadius: "var(--r-sm)" }} />
                <span className="faint" style={{ fontSize: 11 }}>Principal</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", height: 64, background: "var(--primary-soft)", border: "1px solid var(--primary)", borderRadius: "var(--r-sm)" }} />
                <span className="faint" style={{ fontSize: 11 }}>Low case</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ width: "100%", height: 96, background: "var(--money-soft)", border: "1px solid var(--money)", borderRadius: "var(--r-sm)" }} />
                <span className="faint" style={{ fontSize: 11 }}>High case</span>
              </div>
            </div>
            <p className="faint" style={{ fontSize: 12, margin: "16px 0 0" }}>
              Return range per unit: {toGHS(plan.expectedProfitMin)}–{toGHS(plan.expectedProfitMax)} ({retPct}). Projected, not guaranteed.
            </p>
          </div>

          {/* Risk notes */}
          <div className="card" style={{ padding: 20 }}>
            <div className="h3" style={{ marginBottom: 10 }}>Risk notes</div>
            <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
              {plan.riskNotes || "Investment returns depend on harvest yield and market prices at settlement. Crop failure or adverse weather may reduce payouts. Past performance is not indicative of future results."}
            </p>
          </div>
        </div>

        {/* Right rail */}
        <div style={{ position: "sticky", top: 0 }}>
          <div className="card" style={{ padding: 22 }}>
            <div className="h3" style={{ marginBottom: 16 }}>Buy units</div>
            <div className="label">Number of units</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button className="btn btn-outline btn-icon" onClick={() => setUnits(Math.max(1, units - 1))}>−</button>
              <div className="field" style={{ textAlign: "center" }}>
                <input
                  value={units}
                  onChange={(e) => setUnits(Math.max(1, Math.min(plan.unitsRemaining, parseInt(e.target.value) || 1)))}
                  style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 600 }}
                />
              </div>
              <button className="btn btn-outline btn-icon" onClick={() => setUnits(Math.min(plan.unitsRemaining, units + 1))}>+</button>
            </div>
            <hr className="divider" style={{ margin: "6px 0 16px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span className="muted">Total cost</span>
              <span className="mono semibold">{toGHS(cost)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span className="muted">Projected return</span>
              <span className="mono semibold" style={{ color: "var(--money)" }}>{toGHS(rmin)}–{toGHS(rmax)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <span className="muted">Wallet after</span>
              <span className="mono semibold">{toGHS(afterWallet)}</span>
            </div>
            <button
              className="btn btn-money btn-block btn-lg"
              disabled={buying || plan.status !== "OPEN" || plan.unitsRemaining < 1}
              onClick={handlePurchase}
            >
              {buying ? "Processing…" : "Confirm & pay from wallet"}
            </button>
            <p className="faint" style={{ fontSize: 11, margin: "14px 0 0", lineHeight: 1.5 }}>Projected, not guaranteed. Payout occurs at maturity based on actual harvest results.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
