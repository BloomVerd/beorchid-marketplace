"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useInvestmentPlans } from "@/common/hooks/queries/use-investment-plans";
import { useCrops } from "@/common/hooks/queries/use-crops";
import { useCreateInvestmentPlan } from "@/common/hooks/mutations/use-create-investment-plan";
import { useSettleInvestmentPlan } from "@/common/hooks/mutations/use-settle-investment-plan";
import { useOpenInvestmentPlan } from "@/common/hooks/mutations/use-open-investment-plan";
import { useCloseInvestmentPlan } from "@/common/hooks/mutations/use-close-investment-plan";
import { useModalStore } from "@/stores/modal-store";
import { ErrorState } from "@/components/dashboard/error-state";
import { toGHS, toPesewas } from "@/lib/format";

const PLAN_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "var(--muted)" },
  OPEN: { label: "Open", color: "var(--money)" },
  CLOSED: { label: "Closed", color: "var(--sun)" },
  MATURED: { label: "Matured", color: "var(--water)" },
  SETTLED: { label: "Settled", color: "var(--primary)" },
};

function riskBadge(notes: string | null | undefined) {
  const n = (notes ?? "").toLowerCase();
  if (n.includes("high")) return { cls: "badge badge-high", label: "High" };
  if (n.includes("moderate") || n.includes("medium"))
    return { cls: "badge badge-mod", label: "Moderate" };
  return { cls: "badge badge-low", label: "Low" };
}

const EMPTY_FORM = {
  title: "",
  crop: "",
  unitCost: "",
  profitMin: "",
  profitMax: "",
  acreage: "",
  maturityDays: "",
  totalUnits: "",
  riskNotes: "",
};

export default function InvestmentPlansAdminPage() {
  const {
    data: plansData,
    loading: plansLoading,
    error: plansError,
    refetch,
  } = useInvestmentPlans();
  const { data: cropsData } = useCrops();
  const [createPlan, { loading: creating }] = useCreateInvestmentPlan();
  const [settlePlan, { loading: settling }] = useSettleInvestmentPlan();
  const [openPlan] = useOpenInvestmentPlan();
  const [closePlan] = useCloseInvestmentPlan();
  const openCreateCropModal = useModalStore((s) => s.openCreateCropModal);

  const [settlePlanId, setSettlePlanId] = useState("");
  const [settleProfit, setSettleProfit] = useState("");
  const [newForm, setNewForm] = useState(EMPTY_FORM);

  if (plansError)
    return (
      <ErrorState message={plansError.message} onRetry={() => refetch()} />
    );

  const plans = plansData?.investmentPlans ?? [];
  const crops = cropsData?.crops ?? [];

  const handleOpen = async (planId: string) => {
    try {
      await openPlan({ variables: { id: planId } });
      toast.success("Plan opened for investment.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to open plan.");
    }
  };

  const handleClose = async (planId: string) => {
    try {
      await closePlan({ variables: { id: planId } });
      toast.success("Plan closed.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to close plan.");
    }
  };

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlePlanId || !settleProfit) return;
    try {
      await settlePlan({
        variables: {
          planId: settlePlanId,
          actualProfitPerUnit: toPesewas(parseFloat(settleProfit)),
        },
      });
      toast.success("Plan settled successfully.");
      setSettlePlanId("");
      setSettleProfit("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Settlement failed.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newForm.title ||
      !newForm.unitCost ||
      !newForm.maturityDays ||
      !newForm.totalUnits
    ) {
      toast.error("Title, unit cost, maturity, and total units are required.");
      return;
    }
    try {
      await createPlan({
        variables: {
          input: {
            title: newForm.title,
            cropId: newForm.crop || undefined,
            unitCost: Math.round(parseFloat(newForm.unitCost)),
            expectedProfitMin: Math.round(parseFloat(newForm.profitMin || "0")),
            expectedProfitMax: Math.round(parseFloat(newForm.profitMax || "0")),
            acreage: newForm.acreage ? parseFloat(newForm.acreage) : undefined,
            maturityDays: Math.round(parseFloat(newForm.maturityDays)),
            totalUnits: Math.round(parseFloat(newForm.totalUnits)),
            riskNotes: newForm.riskNotes || undefined,
          },
        },
      });
      toast.success("Investment plan created.");
      setNewForm(EMPTY_FORM);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create plan.",
      );
    }
  };

  return (
    <div className="anim-up">
      <div className="eyebrow">Admin console</div>
      <h1 className="h1" style={{ margin: "6px 0 4px" }}>
        Investment plans
      </h1>
      <p className="muted" style={{ margin: "0 0 22px" }}>
        Manage harvest investment plans and settle mature positions.
      </p>

      <div className="detail-grid">
        {/* Left */}
        <div>
          {/* All plans table */}
          <div className="card" style={{ overflowX: "auto", marginBottom: 18 }}>
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className="h3">All plans</div>
              <span className="badge">{plans.length}</span>
            </div>
            <div
              className="tbl-head"
              style={{
                gridTemplateColumns: "1.2fr 1fr 1.4fr 0.9fr 1fr 80px 120px",
              }}
            >
              <span>Plan</span>
              <span>Unit cost</span>
              <span>Projected</span>
              <span>Maturity</span>
              <span>Units</span>
              <span>Status</span>
              <span></span>
            </div>
            {plansLoading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="tbl-row skel"
                  style={{
                    gridTemplateColumns: "1.2fr 1fr 1.4fr 0.9fr 1fr 80px 120px",
                    height: 52,
                  }}
                />
              ))
            ) : plans.length === 0 ? (
              <div
                style={{ padding: "24px 20px", textAlign: "center" }}
                className="faint"
              >
                No plans yet.
              </div>
            ) : (
              plans.map((plan) => {
                const rb = riskBadge(plan.riskNotes);
                const statusInfo = PLAN_STATUS_LABELS[plan.status] ?? {
                  label: plan.status,
                  color: "var(--muted)",
                };
                return (
                  <div
                    key={plan.id}
                    className="tbl-row"
                    style={{
                      gridTemplateColumns:
                        "1.2fr 1fr 1.4fr 0.9fr 1fr 80px 120px",
                    }}
                  >
                    <span>
                      <span
                        className="semibold"
                        style={{
                          fontWeight: 600,
                          display: "block",
                          fontSize: 13,
                        }}
                      >
                        {plan.title}
                      </span>
                      <span className={rb.cls} style={{ fontSize: 11 }}>
                        {rb.label} risk
                      </span>
                    </span>
                    <span className="mono">{toGHS(plan.unitCost)}</span>
                    <span className="mono" style={{ color: "var(--money)" }}>
                      {toGHS(plan.expectedProfitMin)}–
                      {toGHS(plan.expectedProfitMax)}
                    </span>
                    <span className="mono">
                      {Math.round(plan.maturityDays / 30)}mo
                    </span>
                    <span className="mono">
                      {plan.unitsRemaining}/{plan.totalUnits}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: statusInfo.color,
                      }}
                    >
                      {statusInfo.label}
                    </span>
                    <span style={{ display: "flex", gap: 6 }}>
                      {plan.status === "DRAFT" && (
                        <button
                          className="btn btn-money btn-sm"
                          onClick={() => handleOpen(plan.id)}
                        >
                          Open
                        </button>
                      )}
                      {plan.status === "OPEN" && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleClose(plan.id)}
                        >
                          Close
                        </button>
                      )}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Record settlement */}
          <div className="card" style={{ padding: 22 }}>
            <div className="h3" style={{ marginBottom: 6 }}>
              Record settlement
            </div>
            <p className="muted" style={{ margin: "0 0 18px", fontSize: 13 }}>
              Settle a matured plan by recording the actual profit achieved per
              unit.
            </p>
            <form onSubmit={handleSettle}>
              <div className="grid-2" style={{ gap: 14, marginBottom: 14 }}>
                <div>
                  <div className="label">Plan</div>
                  <div className="field">
                    <select
                      value={settlePlanId}
                      onChange={(e) => setSettlePlanId(e.target.value)}
                    >
                      <option value="">Select a plan…</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="label">Actual profit / unit (GHS)</div>
                  <div className="field">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 14.50"
                      value={settleProfit}
                      onChange={(e) => setSettleProfit(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {settlePlanId && settleProfit && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 14,
                    fontSize: 13,
                  }}
                >
                  <span className="muted">Total payout preview</span>
                  <span
                    className="mono semibold"
                    style={{ color: "var(--money)" }}
                  >
                    {toGHS(
                      parseFloat(settleProfit) *
                        (plans.find((p) => p.id === settlePlanId)?.totalUnits ??
                          0),
                    )}
                  </span>
                </div>
              )}
              <button
                type="submit"
                className="btn btn-money btn-block"
                disabled={settling || !settlePlanId || !settleProfit}
              >
                {settling ? "Settling…" : "Confirm settlement"}
              </button>
            </form>
          </div>
        </div>

        {/* Right rail */}
        <div style={{ position: "sticky", top: 0 }}>
          <div className="card" style={{ padding: 22 }}>
            <div className="h3" style={{ marginBottom: 16 }}>
              New investment plan
            </div>
            <form
              onSubmit={handleCreate}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <div className="label">Plan title</div>
                <div className="field">
                  <input
                    placeholder="e.g. Cocoa Harvest Q3"
                    value={newForm.title}
                    onChange={(e) =>
                      setNewForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <div className="label">Crop (optional)</div>
                {crops.length === 0 ? (
                  <div
                    className="field"
                    style={{ justifyContent: "space-between" }}
                  >
                    <span className="faint" style={{ fontSize: 12.5 }}>
                      No crops yet
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={openCreateCropModal}
                    >
                      + New crop
                    </button>
                  </div>
                ) : (
                  <div className="field">
                    <select
                      value={newForm.crop}
                      onChange={(e) =>
                        setNewForm((f) => ({ ...f, crop: e.target.value }))
                      }
                    >
                      <option value="">Select crop…</option>
                      {crops.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <div className="label">Unit cost (GHS)</div>
                  <div className="field">
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={newForm.unitCost}
                      onChange={(e) =>
                        setNewForm((f) => ({ ...f, unitCost: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <div className="label">Acreage</div>
                  <div className="field">
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={newForm.acreage}
                      onChange={(e) =>
                        setNewForm((f) => ({ ...f, acreage: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <div className="label">Profit min / unit</div>
                  <div className="field">
                    <input
                      type="number"
                      placeholder="e.g. 14"
                      value={newForm.profitMin}
                      onChange={(e) =>
                        setNewForm((f) => ({ ...f, profitMin: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <div className="label">Profit max / unit</div>
                  <div className="field">
                    <input
                      type="number"
                      placeholder="e.g. 28"
                      value={newForm.profitMax}
                      onChange={(e) =>
                        setNewForm((f) => ({ ...f, profitMax: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <div className="label">Maturity (days)</div>
                  <div className="field">
                    <input
                      type="number"
                      placeholder="e.g. 180"
                      value={newForm.maturityDays}
                      onChange={(e) =>
                        setNewForm((f) => ({
                          ...f,
                          maturityDays: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <div className="label">Total units</div>
                  <div className="field">
                    <input
                      type="number"
                      placeholder="e.g. 200"
                      value={newForm.totalUnits}
                      onChange={(e) =>
                        setNewForm((f) => ({
                          ...f,
                          totalUnits: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="label">Risk notes</div>
                <div className="field" style={{ height: "auto" }}>
                  <textarea
                    rows={3}
                    placeholder="Describe risk factors…"
                    value={newForm.riskNotes}
                    onChange={(e) =>
                      setNewForm((f) => ({ ...f, riskNotes: e.target.value }))
                    }
                    style={{
                      resize: "vertical",
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      padding: "10px 14px",
                      color: "var(--ink)",
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-money btn-block"
                disabled={creating}
              >
                {creating ? "Creating…" : "Create plan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
