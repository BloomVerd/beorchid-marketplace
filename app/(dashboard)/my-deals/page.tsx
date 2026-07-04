"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useMyDeals } from "@/common/hooks/queries/use-my-deals";
import { useConfirmDealPayment } from "@/common/hooks/mutations/use-confirm-deal-payment";
import { useAuthStore } from "@/stores/auth-store";
import { ErrorState } from "@/components/dashboard/error-state";
import { toGHS } from "@/lib/format";

const STEPS = [
  { key: "ACCEPTED",       label: "Offer accepted" },
  { key: "IN_ESCROW",      label: "Escrow paid" },
  { key: "COMPLETED",      label: "Deed transfer" },
];

function stepIndex(status: string): number {
  if (status === "COMPLETED") return 3;
  if (status === "IN_ESCROW") return 2;
  if (status === "PENDING_PAYMENT") return 1;
  return 0;
}

function Stepper({ status }: { status: string }) {
  const idx = stepIndex(status);
  return (
    <div style={{ display: "flex", gap: 0, margin: "18px 0 14px", position: "relative" }}>
      <div style={{ position: "absolute", top: 15, left: 16, right: 16, height: 2, background: "var(--line)", zIndex: 0 }} />
      {STEPS.map((step, i) => {
        const done   = i < idx;
        const active = i === idx - 1;
        return (
          <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, zIndex: 1, position: "relative" }}>
            <div className={`iconbox iconbox-sm${done ? "" : active ? "" : ""}`}
              style={{
                background: done ? "var(--primary)" : active ? "var(--primary-soft)" : "var(--surface-3)",
                color: done ? "#fff" : active ? "var(--primary)" : "var(--ink-3)",
                border: active ? "2px solid var(--primary)" : "none",
                fontSize: 12, fontWeight: 700,
              }}>
              {done ? "✓" : i + 1}
            </div>
            <span className="faint" style={{ fontSize: 11, textAlign: "center" }}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function MyDealsPage() {
  const farmer = useAuthStore((s) => s.farmer);
  const { data, loading, error, refetch } = useMyDeals();
  const [confirmPayment, { loading: confirming }] = useConfirmDealPayment();

  const handlePay = async (dealId: string) => {
    try {
      await confirmPayment({ variables: { dealId } });
      toast.success("Payment confirmed!");
      refetch();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed."); }
  };

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const deals = data?.myDeals ?? [];

  return (
    <div className="anim-up">
      <Link href="/my-offers" className="btn btn-ghost btn-sm" style={{ marginBottom: 14, paddingLeft: 0 }}>
        ← My offers
      </Link>
      <h1 className="h1" style={{ margin: "0 0 6px" }}>My deals</h1>
      <p className="muted" style={{ margin: "0 0 20px" }}>Manage accepted offers through to deed transfer.</p>

      {loading
        ? [1,2].map((i) => <div key={i} className="card skel" style={{ height: 170, marginBottom: 14 }} />)
        : deals.length === 0
          ? <div className="card" style={{ padding: 32, textAlign: "center" }} ><p className="faint">No deals yet. Deals are created when an offer is accepted.</p></div>
          : deals.map((deal) => {
              const isBuyer = deal.buyerId === farmer?.id;
              const canPay  = isBuyer && deal.status === "IN_ESCROW";
              const stageLabel = deal.status === "COMPLETED" ? "Completed" : deal.status === "IN_ESCROW" ? "In escrow" : "Pending payment";
              return (
                <div key={deal.id} className="card" style={{ padding: 22, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div className="h3">Farm deal</div>
                      <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>{deal.id.slice(0, 16)}… · {toGHS(deal.amount)}</div>
                    </div>
                    <span className={`badge ${deal.status === "COMPLETED" ? "badge-low" : deal.status === "IN_ESCROW" ? "badge-mod" : ""}`}>
                      {stageLabel}
                    </span>
                  </div>

                  <Stepper status={deal.status} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <Link href={`/marketplace/${deal.listingId}`} className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
                      View listing →
                    </Link>
                    {canPay && (
                      <button
                        className="btn btn-money"
                        disabled={confirming}
                        onClick={() => handlePay(deal.id)}
                      >
                        {confirming ? "Processing…" : "Pay from wallet"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
    </div>
  );
}
