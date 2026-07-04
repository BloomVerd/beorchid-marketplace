"use client";

import Link from "next/link";
import { useMyOffers } from "@/common/hooks/queries/use-my-offers";
import { ErrorState } from "@/components/dashboard/error-state";
import { toGHS, formatDate } from "@/lib/format";

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "accepted") return "badge badge-low";
  if (s === "rejected" || s === "withdrawn" || s === "expired") return "badge badge-high";
  if (s === "countered") return "badge badge-mod";
  return "badge";
}

export default function MyOffersPage() {
  const { data, loading, error, refetch } = useMyOffers();

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const offers = data?.myOffers ?? [];

  return (
    <div className="anim-up">
      <Link href="/marketplace" className="btn btn-ghost btn-sm" style={{ marginBottom: 14, paddingLeft: 0 }}>
        ← Marketplace
      </Link>
      <h1 className="h1" style={{ margin: "0 0 6px" }}>My offers</h1>
      <p className="muted" style={{ margin: "0 0 20px" }}>Track every bid you've made on farm listings.</p>

      <div className="card" style={{ overflowX: "auto" }}>
        <div className="tbl-head" style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1fr 110px" }}>
          <span>Farm</span><span>Crop</span><span>Your offer</span><span>Status</span><span>Updated</span><span></span>
        </div>
        {loading
          ? [1,2,3,4].map((i) => (
              <div key={i} className="tbl-row skel" style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1fr 110px", height: 52 }} />
            ))
          : offers.length === 0
            ? <div style={{ padding: "28px 20px", textAlign: "center" }} className="faint">No offers yet.</div>
            : offers.map((offer) => (
                <div key={offer.id} className="tbl-row" style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1fr 110px" }}>
                  <span>
                    <span className="semibold" style={{ fontWeight: 600, color: "var(--ink)", display: "block" }}>
                      Listing #{offer.listingId.slice(-6)}
                    </span>
                    <span className="faint" style={{ fontSize: 11.5 }}>ID {offer.listingId.slice(0, 12)}…</span>
                  </span>
                  <span className="muted">—</span>
                  <span className="mono semibold" style={{ fontWeight: 600 }}>{toGHS(offer.amount)}</span>
                  <span><span className={statusBadge(offer.status)}>{offer.status.charAt(0) + offer.status.slice(1).toLowerCase()}</span></span>
                  <span className="mono faint" style={{ fontSize: 12 }}>{formatDate(offer.createdAt)}</span>
                  <Link href={`/marketplace/${offer.listingId}`} className="btn btn-outline btn-sm">Open →</Link>
                </div>
              ))}
      </div>
    </div>
  );
}
