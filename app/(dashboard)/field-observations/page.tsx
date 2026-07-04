"use client";

import { useRouter } from "next/navigation";
import { useMyFieldObservations } from "@/common/hooks/queries/use-my-field-observations";
import { useCrops } from "@/common/hooks/queries/use-crops";
import { ErrorState } from "@/components/dashboard/error-state";
import { toGHS } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { useModalStore } from "@/stores/modal-store";
import type { ObservationStatus } from "@/common/graphql/generated/graphql";

const STATUS_CLS: Record<ObservationStatus, string> = {
  SUBMITTED:    "badge badge-mod",
  UNDER_REVIEW: "badge badge-mod",
  APPROVED:     "badge badge-low",
  REJECTED:     "badge badge-high",
};

export default function FieldObservationsPage() {
  const farmer  = useAuthStore((s) => s.farmer);
  const router  = useRouter();
  const openSubmitObservationModal = useModalStore((s) => s.openSubmitObservationModal);

  const { data, loading, error, refetch } = useMyFieldObservations();
  const { data: cropsData }               = useCrops();

  if (!farmer?.isFieldAgent) {
    router.replace("/dashboard");
    return null;
  }

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const observations = data?.myFieldObservations ?? [];
  const crops        = cropsData?.crops ?? [];
  const cropName = (id: string) => crops.find((c) => c.id === id)?.name ?? id.slice(0, 8) + "…";

  const approved = observations.filter((o) => o.status === "APPROVED").length;
  const pending  = observations.filter((o) => o.status === "SUBMITTED" || o.status === "UNDER_REVIEW").length;

  return (
    <div className="anim-up">
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div>
          <div className="eyebrow">Field agent</div>
          <h1 className="h1" style={{ margin: "6px 0 0" }}>Field observations</h1>
          <p className="muted" style={{ margin: "6px 0 0" }}>Submit crop price data from the field to inform market trends.</p>
        </div>
        <button className="btn btn-primary" onClick={openSubmitObservationModal}>+ Submit observation</button>
      </div>

      {/* Summary cards */}
      <div className="grid-3" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 22 }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Total submitted</div>
          <div className="metric" style={{ fontSize: 28, marginTop: 10 }}>{observations.length}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Approved</div>
          <div className="metric" style={{ fontSize: 28, marginTop: 10, color: "var(--gain)" }}>{approved}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Pending review</div>
          <div className="metric" style={{ fontSize: 28, marginTop: 10, color: "var(--sun)" }}>{pending}</div>
        </div>
      </div>

      {/* Observations table */}
      <div className="card" style={{ overflowX: "auto" }}>
        <div style={{ padding: "16px 20px" }} className="h3">My observations</div>
        <div className="tbl-head" style={{ gridTemplateColumns: "1.6fr 1.2fr 1fr 0.8fr 1fr 1fr" }}>
          <span>Crop</span>
          <span>Region</span>
          <span>Price / unit</span>
          <span>Grade</span>
          <span>Confidence</span>
          <span>Status</span>
        </div>
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="tbl-row skel" style={{ gridTemplateColumns: "1.6fr 1.2fr 1fr 0.8fr 1fr 1fr", height: 52 }} />
            ))
          : observations.length === 0
            ? (
              <div style={{ padding: "32px 20px", textAlign: "center" }} className="faint">
                No observations yet. Submit your first price report from the field.
              </div>
            )
            : observations.map((obs) => (
              <div key={obs.id} className="tbl-row" style={{ gridTemplateColumns: "1.6fr 1.2fr 1fr 0.8fr 1fr 1fr" }}>
                <span className="semibold" style={{ fontWeight: 600, color: "var(--ink)" }}>{cropName(obs.cropId)}</span>
                <span className="muted" style={{ fontSize: 13 }}>{obs.region.replace(/_/g, " ")}</span>
                <span className="mono semibold">{toGHS(obs.observedPrice / 100)}</span>
                <span><span className="badge">{obs.qualityGrade ?? "—"}</span></span>
                <span><span className="badge">{obs.confidence}</span></span>
                <span>
                  <span className={STATUS_CLS[obs.status]}>
                    {obs.status.charAt(0) + obs.status.slice(1).toLowerCase().replace(/_/g, " ")}
                  </span>
                </span>
              </div>
            ))}
      </div>
    </div>
  );
}
