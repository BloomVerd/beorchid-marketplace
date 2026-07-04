"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { useInvestmentPlans } from "@/common/hooks/queries/use-investment-plans";
import { useCrops } from "@/common/hooks/queries/use-crops";
import { ErrorState } from "@/components/dashboard/error-state";
import { EmptyState } from "@/components/dashboard/empty-state";
import { toGHS } from "@/lib/format";

function riskBadge(notes: string | null | undefined) {
  const n = (notes ?? "").toLowerCase();
  if (n.includes("high"))                    return { cls: "badge badge-high", label: "High" };
  if (n.includes("moderate") || n.includes("medium")) return { cls: "badge badge-mod",  label: "Moderate" };
  return                                            { cls: "badge badge-low",  label: "Low" };
}

const CHIPS = ["All plans", "Maize", "Cocoa", "Low risk", "Under 6 months"];

const CROP_CHIPS = ["Maize", "Cocoa"];

export default function InvestmentsPage() {
  const [activeChip, setActiveChip] = useState(0);

  const { data: cropsData } = useCrops();
  const chipLabel = CHIPS[activeChip];

  const cropId = CROP_CHIPS.includes(chipLabel)
    ? cropsData?.crops.find(c => c.name.toLowerCase() === chipLabel.toLowerCase())?.id
    : undefined;
  const maxMaturityDays = chipLabel === "Under 6 months" ? 180 : undefined;
  const lowRiskOnly     = chipLabel === "Low risk" ? true : undefined;

  const { data, loading, error, refetch } = useInvestmentPlans("OPEN", cropId, maxMaturityDays, lowRiskOnly);

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const plans = data?.investmentPlans ?? [];

  return (
    <div className="anim-up">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div className="eyebrow">Investments</div>
          <h1 className="h1" style={{ margin: "6px 0 0" }}>Investment plans</h1>
          <p className="muted" style={{ margin: "6px 0 0" }}>Fund real harvests by the unit. Returns are projected ranges, not guaranteed.</p>
        </div>
        <Link href="/my-investments" className="btn btn-outline">My investments</Link>
      </div>

      {/* Chip filters */}
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 18 }}>
        {CHIPS.map((label, i) => (
          <button key={label} className={`chip${i === activeChip ? " chip-active" : ""}`} onClick={() => setActiveChip(i)}>
            {label}
          </button>
        ))}
      </div>

      {/* Plan cards */}
      {!loading && plans.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ClipboardList}
            title="No investment plans yet"
            description="Check back soon, or try a different filter above."
          />
        </div>
      ) : (
      <div className="grid-3">
        {loading
          ? [1,2,3,4].map((i) => <div key={i} className="card skel" style={{ height: 200 }} />)
          : plans.map((plan) => {
              const pct = ((plan.totalUnits - plan.unitsRemaining) / plan.totalUnits) * 100;
              const rb = riskBadge(plan.riskNotes);
              const maturityMonths = Math.round(plan.maturityDays / 30);
              return (
                <Link
                  key={plan.id}
                  href={`/investments/${plan.id}`}
                  className="card card-hover"
                  style={{ padding: 20, textAlign: "left", display: "block" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div className="h3">{plan.title} plan</div>
                    <span className={rb.cls}>{rb.label} risk</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span className="faint" style={{ fontSize: 12.5 }}>Unit cost</span>
                    <span className="mono semibold">{toGHS(plan.unitCost)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span className="faint" style={{ fontSize: 12.5 }}>Projected / unit</span>
                    <span className="mono semibold" style={{ color: "var(--money)" }}>
                      {toGHS(plan.expectedProfitMin)}–{toGHS(plan.expectedProfitMax)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <span className="faint" style={{ fontSize: 12.5 }}>Maturity</span>
                    <span className="mono semibold">{maturityMonths} months</span>
                  </div>
                  <div className="track" style={{ marginBottom: 6 }}>
                    <div className="track-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="faint" style={{ fontSize: 11.5 }}>{plan.unitsRemaining} units remaining</div>
                </Link>
              );
            })}
      </div>
      )}

      <p className="faint" style={{ fontSize: 12, marginTop: 18, display: "flex", gap: 7, alignItems: "center" }}>
        <span className="badge badge-mod badge-dot">Projected, not guaranteed</span>
        Actual payouts depend on harvest yield and market price at settlement.
      </p>
    </div>
  );
}
