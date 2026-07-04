"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AdminUsersDocument,
  AuditLogDocument,
  CropsDocument,
} from "@/common/graphql/generated/graphql";
import { useGrantFieldAgent } from "@/common/hooks/mutations/use-grant-field-agent";
import { useRevokeFieldAgent } from "@/common/hooks/mutations/use-revoke-field-agent";
import { useAdminFieldObservations } from "@/common/hooks/queries/use-admin-field-observations";
import { useRejectFieldObservation } from "@/common/hooks/mutations/use-reject-field-observation";
import { TableSkeleton } from "@/components/dashboard/skeleton";
import { RolePickerDropdown } from "@/components/dashboard/role-picker-dropdown";
import { formatDateTime, toGHS } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { useModalStore } from "@/stores/modal-store";

/* ── Types ──────────────────────────────────────────────── */
type OvTab = "users" | "observations" | "crops" | "audit";

const OV_TABS: { key: OvTab; label: string }[] = [
  { key: "users",        label: "Users" },
  { key: "observations", label: "Observations" },
  { key: "crops",        label: "Crops" },
  { key: "audit",        label: "Audit log" },
];

const AUDIT_CATS = ["All", "User", "Observation", "Crop", "Investment", "Coin"];

const CROP_COLORS = [
  "oklch(0.50 0.13 163)",
  "oklch(0.52 0.16 277)",
  "oklch(0.60 0.15 73)",
  "oklch(0.55 0.2 28)",
  "oklch(0.50 0.14 232)",
];

const OBS_GRADS = [
  "linear-gradient(160deg, oklch(0.50 0.13 163), oklch(0.38 0.11 168))",
  "linear-gradient(160deg, oklch(0.60 0.15 73),  oklch(0.48 0.12 80))",
  "linear-gradient(160deg, oklch(0.52 0.16 277), oklch(0.40 0.14 280))",
  "linear-gradient(160deg, oklch(0.55 0.2 28),   oklch(0.45 0.17 25))",
  "linear-gradient(160deg, oklch(0.50 0.14 232), oklch(0.38 0.12 235))",
];

/* ── Helpers ────────────────────────────────────────────── */
function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function obsStatusCls(status: string) {
  if (status === "APPROVED")                                    return "badge badge-low";
  if (status === "REJECTED")                                    return "badge badge-high";
  if (status === "SUBMITTED" || status === "UNDER_REVIEW")      return "badge badge-mod";
  return "badge";
}

function healthCls(confidence: string) {
  if (confidence === "HIGH")   return "badge badge-low";
  if (confidence === "MEDIUM") return "badge badge-mod";
  return "badge badge-high";
}

function auditCatCls(entity: string) {
  const e = entity.toLowerCase();
  if (e.includes("user"))                       return "badge badge-primary";
  if (e.includes("observation"))                return "badge badge-low";
  if (e.includes("coin"))                       return "badge badge-money";
  if (e.includes("plan") || e.includes("invest")) return "badge badge-mod";
  return "badge";
}

/* ── Observation type from hook ─────────────────────────── */
interface ObsRow {
  id: string; cropId: string; region: string; observedPrice: number;
  priceType: string; qualityGrade: string | null; confidence: string;
  status: string; createdAt: string;
}

/* ── Page ───────────────────────────────────────────────── */
export default function AdminPage() {
  const farmer     = useAuthStore((s) => s.farmer);
  const activeRole = useAuthStore((s) => s.activeRole);
  const router     = useRouter();

  const openCreateUserModal        = useModalStore((s) => s.openCreateUserModal);
  const openCreateCropModal        = useModalStore((s) => s.openCreateCropModal);
  const openApproveObservationModal = useModalStore((s) => s.openApproveObservationModal);

  const [tab,        setTab]        = useState<OvTab>("users");
  const [userSearch, setUserSearch] = useState("");
  const [auditCat,   setAuditCat]  = useState("All");

  const isAdmin = activeRole === "super_admin";

  /* Always load for stat cards + tab content */
  const { data: usersData,  loading: uLoading,  refetch: refetchUsers } =
    useQuery(AdminUsersDocument, { skip: !isAdmin });
  const { data: obsData,    loading: obsLoading } =
    useAdminFieldObservations(undefined, !isAdmin);
  const { data: cropsData,  loading: cropsLoading } =
    useQuery(CropsDocument, { skip: !isAdmin });
  const { data: auditData,  loading: aLoading } =
    useQuery(AuditLogDocument, { skip: !isAdmin || tab !== "audit" });

  const [grantFA]  = useGrantFieldAgent();
  const [revokeFA] = useRevokeFieldAgent();
  const [rejectObs] = useRejectFieldObservation();

  if (!isAdmin) { router.replace("/dashboard"); return null; }

  const adminName  = farmer ? `${farmer.firstName} ${farmer.lastName}` : "Admin";
  const allUsers   = usersData?.adminUsers ?? [];
  const allObs     = (obsData?.adminFieldObservations ?? []) as ObsRow[];
  const allCrops   = cropsData?.crops ?? [];
  const fieldAgents = allUsers.filter((u) => u.isFieldAgent).length;
  const pendingObs  = allObs.filter(
    (o) => o.status === "submitted" || o.status === "under_review"
  ).length;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return allUsers;
    const q = userSearch.toLowerCase();
    return allUsers.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [allUsers, userSearch]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const filteredAudit = useMemo(() => {
    const entries = auditData?.auditLog ?? [];
    if (auditCat === "All") return entries;
    return entries.filter((e) =>
      e.entity.toLowerCase().includes(auditCat.toLowerCase())
    );
  }, [auditData, auditCat]);

  const tabCounts: Partial<Record<OvTab, number>> = {
    users:        allUsers.length  || undefined,
    observations: pendingObs       || undefined,
    crops:        allCrops.length  || undefined,
  };

  /* ── Handlers ─────────────────────────────────────────── */
  const handleToggleFA = async (userId: string, isFA: boolean) => {
    try {
      if (isFA) { await revokeFA({ variables: { userId } }); toast.success("Field agent revoked."); }
      else       { await grantFA({ variables: { userId } }); toast.success("Field agent granted."); }
      refetchUsers();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed."); }
  };

  const handleApproveObs = (id: string, observedPrice: number) => {
    openApproveObservationModal(id, observedPrice);
  };

  const handleRejectObs = async (id: string) => {
    const reason = window.prompt("Rejection reason:");
    if (!reason) return;
    try { await rejectObs({ variables: { id, reason } }); toast.success("Observation rejected."); }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed."); }
  };

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="anim-up">
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div>
          <div className="eyebrow">Admin console</div>
          <h1 className="h1" style={{ margin: "6px 0 0" }}>Overview</h1>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            Manage people, field observations and the crop catalog · signed in as {adminName}.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-stat" style={{ marginBottom: 22 }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Total users</div>
          <div className="metric" style={{ fontSize: 26, margin: "12px 0 4px" }}>
            {uLoading ? "—" : allUsers.length}
          </div>
          <div className="faint" style={{ fontSize: 11.5 }}>across all roles</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Field agents</div>
          <div className="metric" style={{ fontSize: 26, margin: "12px 0 4px" }}>
            {uLoading ? "—" : fieldAgents}
          </div>
          <div className="faint" style={{ fontSize: 11.5 }}>submitting observations</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Pending observations</div>
          <div className="metric" style={{ fontSize: 26, margin: "12px 0 4px", color: "var(--risk-mod)" }}>
            {obsLoading ? "—" : pendingObs}
          </div>
          <div className="faint" style={{ fontSize: 11.5 }}>awaiting review</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow">Crops in catalog</div>
          <div className="metric" style={{ fontSize: 26, margin: "12px 0 4px" }}>
            {cropsLoading ? "—" : allCrops.length}
          </div>
          <div className="faint" style={{ fontSize: 11.5 }}>active &amp; draft</div>
        </div>
      </div>

      {/* Underline tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--line)", marginBottom: 22, overflowX: "auto" }}>
        {OV_TABS.map(({ key, label }) => {
          const count = tabCounts[key];
          return (
            <button
              key={key}
              className="ov-tab"
              data-active={tab === key}
              onClick={() => setTab(key)}
            >
              {label}
              {count != null && <span className="ov-tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* ── USERS TAB ──────────────────────────────────────── */}
      {tab === "users" && (
        uLoading ? <TableSkeleton rows={8} /> : (
          <div className="card" style={{ overflowX: "auto" }}>
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="h3">Users &amp; roles</span>
                <span className="faint" style={{ fontSize: 12.5, marginLeft: 10 }}>
                  Update roles, promote field agents, or revoke access
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="topbar-search" style={{ maxWidth: 240, flex: "none" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  placeholder="Search users…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={openCreateUserModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add user
              </button>
              </div>
            </div>
            <div className="tbl-head" style={{ gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1.6fr" }}>
              <span>User</span><span>Role</span><span>Status</span><span>Region</span>
              <span style={{ textAlign: "right" }}>Actions</span>
            </div>
            {filteredUsers.map((user) => (
              <div key={user.id} className="tbl-row" style={{ gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1.6fr" }}>
                {/* User */}
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="avatar" style={{ width: 38, height: 38, fontSize: 13 }}>
                    {initials(user.firstName, user.lastName)}
                  </span>
                  <span>
                    <span className="semibold" style={{ display: "block", fontWeight: 600, color: "var(--ink)" }}>
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="faint" style={{ fontSize: 11.5 }}>{user.email}</span>
                  </span>
                </span>
                {/* Role picker */}
                <RolePickerDropdown userId={user.id} roles={user.roles} />
                {/* Status */}
                <span><span className="badge badge-low">Active</span></span>
                {/* Region */}
                <span className="muted" style={{ fontSize: 12.5 }}>—</span>
                {/* Actions */}
                <span style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  {user.isFieldAgent && (
                    <span className="badge badge-primary" style={{ height: 32 }}>◎ Field agent</span>
                  )}
                  {!user.isFieldAgent && (
                    <button className="btn btn-outline btn-sm" onClick={() => handleToggleFA(user.id, false)}>
                      Make agent
                    </button>
                  )}
                  {user.isFieldAgent && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--loss)" }}
                      onClick={() => handleToggleFA(user.id, true)}
                    >
                      Revoke
                    </button>
                  )}
                </span>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div style={{ padding: 20, textAlign: "center" }} className="faint text-sm">
                No users match the search.
              </div>
            )}
          </div>
        )
      )}

      {/* ── OBSERVATIONS TAB ───────────────────────────────── */}
      {tab === "observations" && (
        obsLoading ? <TableSkeleton rows={6} /> : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span className="muted" style={{ fontSize: 13 }}>
                Field observations submitted from the Bloomverd agent app. Approve to publish to farm health scores.
              </span>
            </div>
            {allObs.length === 0 ? (
              <div className="card card-pad">
                <p className="text-sm faint" style={{ textAlign: "center" }}>No field observations found.</p>
              </div>
            ) : (
              <div className="obs-grid">
                {allObs.map((obs, i) => {
                  const pending = obs.status === "SUBMITTED" || obs.status === "UNDER_REVIEW";
                  return (
                    <div key={obs.id} className="card" style={{ overflow: "hidden" }}>
                      <div style={{ display: "flex" }}>
                        <div style={{ width: 96, flexShrink: 0, background: OBS_GRADS[i % OBS_GRADS.length] }} />
                        <div style={{ flex: 1, padding: "16px 18px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                            <div>
                              <span className="semibold" style={{ fontWeight: 600, color: "var(--ink)" }}>
                                Farm #{obs.cropId.slice(0, 6)}
                              </span>
                              <div className="faint" style={{ fontSize: 11.5, marginTop: 2 }}>
                                {obs.priceType} · {obs.region}
                              </div>
                            </div>
                            <span className={obsStatusCls(obs.status)}>
                              {obs.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                            <span className="badge">{obs.priceType}</span>
                            <span className={healthCls(obs.confidence)}>
                              Health {obs.confidence}
                            </span>
                          </div>
                          <p className="muted" style={{ margin: "0 0 12px", fontSize: 12.5, lineHeight: 1.5 }}>
                            Observed price GHS {obs.observedPrice.toLocaleString()}
                            {obs.qualityGrade ? ` · Grade ${obs.qualityGrade}` : ""}.
                          </p>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>FA</span>
                              <span className="faint" style={{ fontSize: 11.5 }}>
                                Field Agent · {formatDateTime(obs.createdAt)}
                              </span>
                            </span>
                            {pending && (
                              <span style={{ display: "flex", gap: 7 }}>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  style={{ color: "var(--loss)" }}
                                  onClick={() => handleRejectObs(obs.id)}
                                >
                                  Reject
                                </button>
                                <button className="btn btn-primary btn-sm" onClick={() => handleApproveObs(obs.id, obs.observedPrice)}>
                                  Approve
                                </button>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )
      )}

      {/* ── CROPS TAB ──────────────────────────────────────── */}
      {tab === "crops" && (
        cropsLoading ? <TableSkeleton rows={6} /> : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <span className="muted" style={{ fontSize: 13 }}>
                The crop catalog all listings, plans and coins draw from.
              </span>
              <button className="btn btn-primary" onClick={openCreateCropModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create crop
              </button>
            </div>
            {allCrops.length === 0 ? (
              <div className="card card-pad">
                <p className="text-sm faint" style={{ textAlign: "center" }}>No crops in catalog yet.</p>
              </div>
            ) : (
              <div className="card" style={{ overflowX: "auto" }}>
                <div className="tbl-head" style={{ gridTemplateColumns: "1.8fr 1fr 1fr 0.8fr 0.8fr 1fr" }}>
                  <span>Crop</span><span>Base price</span><span>Coin</span>
                  <span>Farms</span><span>Status</span><span>Created</span>
                </div>
                {allCrops.map((crop, i) => (
                  <div key={crop.id} className="tbl-row" style={{ gridTemplateColumns: "1.8fr 1fr 1fr 0.8fr 0.8fr 1fr" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className="iconbox iconbox-sm" style={{ background: CROP_COLORS[i % CROP_COLORS.length] }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 22 16 8" />
                          <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
                          <path d="M15.66 9.66 17 8a3.5 3.5 0 0 0-4.94-4.94L10.5 4.66" />
                        </svg>
                      </span>
                      <span>
                        <span className="semibold" style={{ display: "block", fontWeight: 600, color: "var(--ink)" }}>
                          {crop.name}
                        </span>
                        <span className="faint" style={{ fontSize: 11.5 }}>
                          {crop.category ?? "—"} · {crop.unit ?? "—"}
                        </span>
                      </span>
                    </span>
                    <span className="mono semibold">
                      {crop.coin ? toGHS(crop.coin.basePrice) : <span className="faint">—</span>}
                    </span>
                    <span>
                      {crop.coin
                        ? <span className="badge badge-money">{crop.coin.symbol}</span>
                        : <span className="faint mono">—</span>}
                    </span>
                    <span className="mono faint">—</span>
                    <span>
                      <span className={`badge ${crop.coin ? "badge-primary" : ""}`}>
                        {crop.coin ? crop.coin.status : "Active"}
                      </span>
                    </span>
                    <span className="faint mono" style={{ fontSize: 11.5 }}>{formatDateTime(crop.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      )}

      {/* ── AUDIT TAB ──────────────────────────────────────── */}
      {tab === "audit" && (
        aLoading ? <TableSkeleton rows={8} /> : (
          <>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 16 }}>
              {AUDIT_CATS.map((cat) => (
                <button
                  key={cat}
                  className="chip"
                  data-active={auditCat === cat}
                  style={{ height: 30 }}
                  onClick={() => setAuditCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            {filteredAudit.length === 0 ? (
              <div className="card card-pad">
                <p className="text-sm faint" style={{ textAlign: "center" }}>No audit entries.</p>
              </div>
            ) : (
              <div className="card" style={{ overflowX: "auto" }}>
                <div className="tbl-head" style={{ gridTemplateColumns: "1.4fr 2.4fr 1fr 1.2fr" }}>
                  <span>Actor</span><span>Action</span><span>Category</span><span>When</span>
                </div>
                {filteredAudit.map((entry) => (
                  <div key={entry.id} className="tbl-row" style={{ gridTemplateColumns: "1.4fr 2.4fr 1fr 1.2fr" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="avatar" style={{ width: 30, height: 30, fontSize: 10 }}>
                        {entry.actorId.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="semibold" style={{ fontWeight: 600, color: "var(--ink)", fontSize: 13 }}>
                        User {entry.actorId.slice(0, 8)}
                      </span>
                    </span>
                    <span>
                      <span className="semibold" style={{ fontWeight: 600, color: "var(--ink)", fontSize: 13 }}>
                        {entry.action}
                      </span>
                      <div className="faint" style={{ fontSize: 11.5, marginTop: 2 }}>
                        {entry.entity} · {entry.entityId.slice(0, 8)}…
                      </div>
                    </span>
                    <span><span className={auditCatCls(entry.entity)}>{entry.entity}</span></span>
                    <span className="faint mono" style={{ fontSize: 11.5 }}>
                      {formatDateTime(entry.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      )}

    </div>
  );
}
