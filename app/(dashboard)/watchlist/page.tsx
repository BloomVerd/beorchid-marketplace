"use client";

import { useId } from "react";
import { toast } from "sonner";
import { useMyWatchlist } from "@/common/hooks/queries/use-my-watchlist";
import { useMySavedSearches } from "@/common/hooks/queries/use-my-saved-searches";
import { useRemoveFromWatchlist } from "@/common/hooks/mutations/use-remove-from-watchlist";
import { useDeleteSavedSearch } from "@/common/hooks/mutations/use-delete-saved-search";
import { ErrorState } from "@/components/dashboard/error-state";
import { toGHS } from "@/lib/format";

const STATIC_SERIES: Record<string, number[]> = {
  CROP: [8,8.2,8.5,8.3,8.8,9.0,9.2,9.1,9.4,9.6,9.5,9.8,10,9.9,10.2,10.5,10.3,10.8,11,11.2],
  COIN: [12,12.5,12.2,12.8,13,13.4,13.2,13.7,14,14.2,14.5,14.3,14.8,15,15.2,15.5,15.3,15.8,16,16.2],
  LISTING: [50,52,51,53,55,54,56,57,55,58,59,60,58,61,62,60,63,64,62,65],
  PLAN: [10,10.3,10.1,10.5,10.8,11,10.9,11.2,11.5,11.4,11.8,12,11.9,12.3,12.5,12.4,12.8,13,12.9,13.2],
};

function Spark({ type }: { type: string }) {
  const gid = useId();
  const pts = STATIC_SERIES[type] ?? STATIC_SERIES.CROP;
  const w = 110, h = 34;
  const mn = Math.min(...pts), mx = Math.max(...pts), rng = mx - mn || 1;
  const X = (i: number) => (i / (pts.length - 1)) * w;
  const Y = (v: number) => h - ((v - mn) / rng) * (h - 4) - 2;
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={d + ` L${X(pts.length - 1).toFixed(1)},${h} L0,${h} Z`} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke="var(--primary)" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function WatchlistPage() {
  const { data: watchData, loading: wLoading, error: wError, refetch: refetchWatch } = useMyWatchlist();
  const { data: searchData, loading: sLoading, refetch: refetchSearch } = useMySavedSearches();
  const [removeFromWatchlist] = useRemoveFromWatchlist();
  const [deleteSavedSearch] = useDeleteSavedSearch();

  const handleRemove = async (id: string) => {
    try { await removeFromWatchlist({ variables: { id } }); toast.success("Removed."); refetchWatch(); }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed."); }
  };

  const handleDeleteSearch = async (id: string) => {
    try { await deleteSavedSearch({ variables: { id } }); toast.success("Deleted."); refetchSearch(); }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed."); }
  };

  if (wError) return <ErrorState message={wError.message} onRetry={() => refetchWatch()} />;

  const watchlist = watchData?.myWatchlist ?? [];
  const searches  = searchData?.mySavedSearches ?? [];

  return (
    <div className="anim-up">
      <h1 className="h1" style={{ margin: "0 0 6px" }}>Watchlist &amp; alerts</h1>
      <p className="muted" style={{ margin: "0 0 20px" }}>Follow markets and get notified when prices move.</p>

      <div className="grid-2" style={{ gap: 18, alignItems: "start" }}>
        {/* Left — Followed markets */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "18px 20px 14px" }} className="h3">Followed markets</div>
          {wLoading
            ? [1,2,3].map((i) => <div key={i} style={{ height: 52, borderTop: "1px solid var(--line)", background: "var(--surface-2)", animation: "skeletonPulse 1.5s infinite" }} />)
            : watchlist.length === 0
              ? <div style={{ padding: "24px 20px", textAlign: "center" }} className="faint">Nothing followed yet.</div>
              : watchlist.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderTop: "1px solid var(--line)" }}>
                    <div style={{ flex: 1 }}>
                      <div className="semibold" style={{ fontWeight: 600, fontSize: 13 }}>{item.entityType.charAt(0) + item.entityType.slice(1).toLowerCase()}</div>
                      <div className="faint" style={{ fontSize: 11.5 }}>{item.entityId.slice(0, 14)}…</div>
                    </div>
                    <Spark type={item.entityType} />
                    <div style={{ textAlign: "right", minWidth: 80 }}>
                      <div className="mono semibold" style={{ fontSize: 13 }}>
                        {item.priceThreshold ? toGHS(item.priceThreshold) : "—"}
                      </div>
                      <div className="pc pc-up" style={{ fontSize: 11 }}>▲ 2.4%</div>
                    </div>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: "var(--loss)", flexShrink: 0 }}
                      onClick={() => handleRemove(item.id)}
                    >✕</button>
                  </div>
                ))}
        </div>

        {/* Right — Alerts + Saved searches */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Price alerts */}
          <div className="card" style={{ padding: 20 }}>
            <div className="h3" style={{ marginBottom: 14 }}>Price alerts</div>
            {wLoading
              ? <div style={{ height: 40, background: "var(--surface-2)", borderRadius: "var(--r-sm)", animation: "skeletonPulse 1.5s infinite" }} />
              : watchlist.filter((w) => w.priceThreshold).length === 0
                ? <p className="faint" style={{ fontSize: 13, margin: "0 0 12px" }}>No active alerts.</p>
                : watchlist.filter((w) => w.priceThreshold).map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div>
                        <div className="semibold" style={{ fontSize: 13, fontWeight: 600 }}>{item.entityType.charAt(0) + item.entityType.slice(1).toLowerCase()}</div>
                        <div className="muted" style={{ fontSize: 12 }}>above {toGHS(item.priceThreshold ?? 0)}</div>
                      </div>
                      <span className="badge badge-mod">Active</span>
                    </div>
                  ))}
            <button className="btn btn-outline btn-block btn-sm" onClick={() => toast.info("Set price threshold when adding to watchlist.")}>
              + New alert
            </button>
          </div>

          {/* Saved searches */}
          <div className="card" style={{ padding: 20 }}>
            <div className="h3" style={{ marginBottom: 14 }}>Saved searches</div>
            {sLoading
              ? <div style={{ height: 40, background: "var(--surface-2)", borderRadius: "var(--r-sm)", animation: "skeletonPulse 1.5s infinite" }} />
              : searches.length === 0
                ? <p className="faint" style={{ fontSize: 13, margin: 0 }}>No saved searches.</p>
                : searches.map((s) => (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div>
                        <div className="semibold" style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {Object.entries(s.filters).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className="badge badge-primary">3 new</span>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: "var(--loss)" }} onClick={() => handleDeleteSearch(s.id)}>✕</button>
                      </div>
                    </div>
                  ))}
          </div>
        </div>
      </div>
    </div>
  );
}
