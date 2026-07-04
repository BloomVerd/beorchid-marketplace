"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useMyWallet } from "@/common/hooks/queries/use-my-wallet";
import { useGetMyNotifications } from "@/common/hooks/queries/use-get-my-notifications";
import { useMarkNotificationRead } from "@/common/hooks/mutations/use-mark-notification-read";
import { useSearchLazy } from "@/common/hooks/queries/use-search";
import { toGHS, formatRelative } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { useNotificationStore } from "@/stores/notification-store";

/* ── exact icon SVG paths from the design ────────────────────── */
const ICON = {
  bell: [
    "M10.27 21a2 2 0 0 0 3.46 0",
    "M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33",
  ],
  alert: [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",
    "M12 9v4",
    "M12 17h.01",
  ],
  check: ["M20 6 9 17l-5-5"],
  wallet: [
    "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1",
    "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",
  ],
  user: [
    "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",
    "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  ],
  building: [
    "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",
    "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",
    "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",
    "M10 6h4",
    "M10 10h4",
    "M10 14h4",
    "M10 18h4",
  ],
  shield: [
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z",
  ],
  signout: [
    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
    "m16 17 5-5-5-5",
    "M21 12H9",
  ],
  sun: [
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
    "M12 2v2",
    "M12 20v2",
    "m4.93 4.93 1.41 1.41",
    "m17.66 17.66 1.41 1.41",
    "M2 12h2",
    "M20 12h2",
    "m6.34 17.66-1.41 1.41",
    "m19.07 4.93-1.41 1.41",
  ],
  moon: ["M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"],
};

function Ic({ paths, size = 18 }: { paths: string[]; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/* wallet SVG has a circle child, handle separately */
function WalletIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
      <circle cx="17" cy="14" r="1" />
    </svg>
  );
}

/* map notification type to icon key */
function notifIcon(type: string): string[] {
  const t = type.toUpperCase();
  if (t.includes("ALERT") || t.includes("REJECTED") || t.includes("DISPUTED"))
    return ICON.alert;
  if (
    t.includes("ACCEPTED") ||
    t.includes("COMPLETED") ||
    t.includes("SETTLED") ||
    t.includes("APPROVED") ||
    t.includes("DEPOSIT")
  )
    return ICON.check;
  return ICON.bell;
}

function notifIconStyle(type: string): React.CSSProperties {
  const t = type.toUpperCase();
  if (t.includes("ALERT") || t.includes("REJECTED") || t.includes("DISPUTED"))
    return { background: "var(--loss-soft)", color: "var(--loss)" };
  if (
    t.includes("ACCEPTED") ||
    t.includes("COMPLETED") ||
    t.includes("SETTLED") ||
    t.includes("APPROVED") ||
    t.includes("DEPOSIT")
  )
    return { background: "var(--gain-soft)", color: "var(--gain)" };
  return { background: "var(--primary-soft)", color: "var(--primary-strong)" };
}

/* role option definitions */
const ROLE_META: Record<string, { name: string; sub: string; icon: string[] }> =
  {
    individual: { name: "Individual", sub: "Retail investor", icon: ICON.user },
    farmer: { name: "Individual", sub: "Retail investor", icon: ICON.user },
    company: { name: "Company", sub: "Org with members", icon: ICON.building },
    super_admin: { name: "Admin", sub: "Platform ops", icon: ICON.shield },
    field_agent: {
      name: "Field Agent",
      sub: "Field observer",
      icon: ICON.user,
    },
  };

export function Topbar() {
  const router = useRouter();
  const farmer = useAuthStore((s) => s.farmer);
  const logout = useAuthStore((s) => s.logout);
  const activeRole = useAuthStore((s) => s.activeRole) ?? "farmer";
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const { theme, setTheme } = useTheme();

  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const searchOpen = useUIStore((s) => s.searchOpen);
  const openSearch = useUIStore((s) => s.openSearch);
  const closeSearch = useUIStore((s) => s.closeSearch);

  const [notifOpen, setNotifOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: walletData } = useMyWallet();
  const { data: notifData } = useGetMyNotifications();
  const { notifications, unreadCount, setNotifications, markRead } =
    useNotificationStore();
  const [markNotificationRead] = useMarkNotificationRead();
  const [executeSearch, { data: searchData, loading: searchLoading }] =
    useSearchLazy();

  useEffect(() => {
    if (notifData?.getMyNotifications) setNotifications(notifData.getMyNotifications);
  }, [notifData, setNotifications]);

  useEffect(() => {
    if (!searchOpen || searchQuery.trim().length < 2) return;
    const t = setTimeout(() => {
      executeSearch({ variables: { query: searchQuery.trim(), limit: 5 } });
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, searchOpen, executeSearch]);

  const handleNotifClick = async (id: string) => {
    markRead(id);
    try {
      await markNotificationRead({ variables: { notificationId: id } });
    } catch {}
  };

  /* close dropdowns on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node))
        setRoleOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* focus search input when overlay opens */
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  /* close search on ESC, open on Cmd+K / Ctrl+K */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSearch();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [closeSearch, openSearch]);

  /* derived values */
  const balance = walletData?.myWallet.availableBalance;
  const recentN = notifications.slice(0, 5);

  const roles = farmer?.roles ?? [];
  const initials = farmer
    ? `${farmer.firstName[0]}${farmer.lastName[0]}`.toUpperCase()
    : "?";
  const rm = ROLE_META[activeRole] ?? ROLE_META.farmer;

  const roleOptions = roles.map((r) => ({
    role: r,
    name: ROLE_META[r]?.name ?? r,
    sub: ROLE_META[r]?.sub ?? r,
    icon: ROLE_META[r]?.icon ?? ICON.user,
    active: r === activeRole,
  }));

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  const isDark = theme === "dark";

  return (
    <header className="topbar">
      {/* Hamburger — visible on mobile via CSS */}
      <button
        className="btn-icon btn-ghost topbar-hamburger"
        onClick={toggleSidebar}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Search trigger — icon on mobile, fake input on desktop */}
      <button
        className="topbar-search-btn"
        onClick={openSearch}
        title="Search (⌘K)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="topbar-search-placeholder">Search...</span>
        <kbd className="topbar-search-kbd">⌘K</kbd>
      </button>

      <div style={{ flex: 1 }} />

      {/* Search command overlay */}
      {searchOpen && (
        <div className="search-overlay" onClick={closeSearch}>
          <div className="search-cmd" onClick={(e) => e.stopPropagation()}>
            <div className="search-cmd-input">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crops, listings, coins, plans…"
              />
              <button
                className="btn-icon btn-ghost"
                onClick={closeSearch}
                style={{ flexShrink: 0 }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="search-cmd-hint">Press ESC to close</div>

            {searchQuery.trim().length >= 2 && (
              <div className="search-cmd-results">
                {searchLoading && (
                  <div className="search-cmd-empty">Searching…</div>
                )}
                {!searchLoading &&
                  searchData &&
                  (() => {
                    const { listings, coins, plans, crops } = searchData.search;
                    const total =
                      listings.length +
                      coins.length +
                      plans.length +
                      crops.length;
                    if (total === 0) {
                      return (
                        <div className="search-cmd-empty">
                          No results for &ldquo;{searchQuery}&rdquo;
                        </div>
                      );
                    }
                    return (
                      <>
                        {listings.length > 0 && (
                          <div className="search-section">
                            <div className="search-section-label">Listings</div>
                            {listings.map((l) => (
                              <button
                                key={l.id}
                                className="search-result-item"
                                onClick={() => {
                                  router.push(`/marketplace/${l.id}`);
                                  closeSearch();
                                }}
                              >
                                <span className="search-result-title">
                                  {l.crop}
                                </span>
                                <span className="search-result-meta">
                                  {l.region} · {toGHS(l.askingPrice)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                        {coins.length > 0 && (
                          <div className="search-section">
                            <div className="search-section-label">Coins</div>
                            {coins.map((c) => (
                              <button
                                key={c.id}
                                className="search-result-item"
                                onClick={() => {
                                  router.push(`/coins/${c.id}`);
                                  closeSearch();
                                }}
                              >
                                <span className="search-result-title">
                                  {c.name}
                                </span>
                                <span className="search-result-meta">
                                  {c.symbol} · {toGHS(c.currentPrice)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                        {plans.length > 0 && (
                          <div className="search-section">
                            <div className="search-section-label">
                              Investment Plans
                            </div>
                            {plans.map((p) => (
                              <button
                                key={p.id}
                                className="search-result-item"
                                onClick={() => {
                                  router.push(`/investments/${p.id}`);
                                  closeSearch();
                                }}
                              >
                                <span className="search-result-title">
                                  {p.title}
                                </span>
                                <span className="search-result-meta">
                                  {toGHS(p.unitCost)} · {p.maturityDays}d
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                        {crops.length > 0 && (
                          <div className="search-section">
                            <div className="search-section-label">Crops</div>
                            {crops.map((c) => (
                              <button
                                key={c.id}
                                className="search-result-item"
                                onClick={() => {
                                  router.push(`/market-trends`);
                                  closeSearch();
                                }}
                              >
                                <span className="search-result-title">
                                  {c.name}
                                </span>
                                <span className="search-result-meta">
                                  {c.category ?? "Market data"}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wallet pill — always shown */}
      <div className="wallet-pill">
        <WalletIcon />
        {balance !== undefined ? toGHS(balance) : "—"}
      </div>

      {/* Notification bell */}
      <div style={{ position: "relative" }} ref={notifRef}>
        <button
          className="btn-icon btn-ghost"
          onClick={() => {
            setNotifOpen((v) => !v);
            setRoleOpen(false);
          }}
          style={{ position: "relative" }}
        >
          <Ic paths={ICON.bell} size={19} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 7,
                right: 8,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--loss)",
                border: "1.5px solid var(--surface)",
              }}
            />
          )}
        </button>

        {notifOpen && (
          <div
            className="menu"
            style={{
              right: 0,
              top: 46,
              width: 320,
              maxHeight: 420,
              overflowY: "auto",
            }}
          >
            <div
              style={{
                padding: "8px 10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span className="h3">Notifications</span>
              <button
                className="link-btn faint"
                style={{ fontSize: 12 }}
                onClick={() => {
                  setNotifOpen(false);
                  router.push("/notifications");
                }}
              >
                See all
              </button>
            </div>

            {recentN.length === 0 ? (
              <div style={{ padding: "14px 10px", textAlign: "center" }}>
                <span className="faint" style={{ fontSize: 13 }}>
                  No notifications yet
                </span>
              </div>
            ) : (
              recentN.map((n) => (
                <button
                  key={n.id}
                  className="menu-item"
                  style={{
                    alignItems: "flex-start",
                    background: n.isRead ? "transparent" : "var(--primary-soft)",
                  }}
                  onClick={() => !n.isRead && handleNotifClick(n.id)}
                >
                  <span
                    className="iconbox iconbox-sm"
                    style={notifIconStyle(n.type)}
                  >
                    <Ic paths={notifIcon(n.type)} size={15} />
                  </span>
                  <span style={{ flex: 1 }}>
                    <span
                      className="text-sm semibold"
                      style={{
                        display: "block",
                        color: "var(--ink)",
                        fontWeight: n.isRead ? 500 : 600,
                      }}
                    >
                      {n.title}
                    </span>
                    <span className="faint" style={{ fontSize: 12 }}>
                      {formatRelative(n.createdAt)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button
        className="btn-icon btn-ghost"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title="Toggle theme"
      >
        <Ic paths={isDark ? ICON.sun : ICON.moon} size={18} />
      </button>

      {/* Role / user dropdown */}
      <div style={{ position: "relative" }} ref={roleRef}>
        <button
          onClick={() => {
            setRoleOpen((v) => !v);
            setNotifOpen(false);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "4px 8px 4px 4px",
            borderRadius: "var(--r-md)",
            transition: "background .15s",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span
            className="avatar"
            style={{ width: 34, height: 34, fontSize: 13 }}
          >
            {initials}
          </span>
          <span
            className="topbar-profile-name"
            style={{ textAlign: "left", lineHeight: 1.2 }}
          >
            <span
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: 13,
                color: "var(--ink)",
              }}
            >
              {farmer ? `${farmer.firstName} ${farmer.lastName}` : "—"}
            </span>
            <span className="faint" style={{ fontSize: 11 }}>
              {rm.sub}
            </span>
          </span>
        </button>

        {roleOpen && (
          <div className="menu" style={{ right: 0, top: 50 }}>
            <div className="eyebrow" style={{ padding: "8px 10px" }}>
              Switch role
            </div>

            {roleOptions.map((r) => (
              <button
                key={r.role}
                className="menu-item"
                data-active={r.active}
                onClick={() => setActiveRole(r.role)}
              >
                <span
                  className="iconbox iconbox-sm"
                  style={{
                    background: "var(--primary-soft)",
                    color: "var(--primary-strong)",
                  }}
                >
                  <Ic paths={r.icon} size={16} />
                </span>
                <span style={{ flex: 1 }}>
                  <span
                    style={{
                      display: "block",
                      fontWeight: 600,
                      color: "var(--ink)",
                    }}
                  >
                    {r.name}
                  </span>
                  <span className="faint" style={{ fontSize: 12 }}>
                    {r.sub}
                  </span>
                </span>
                {r.active && <span style={{ color: "var(--primary)" }}>✓</span>}
              </button>
            ))}

            <div className="divider" style={{ margin: "6px 0" }} />

            <button className="menu-item" onClick={handleLogout}>
              <span
                className="iconbox iconbox-sm"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--ink-2)",
                }}
              >
                <Ic paths={ICON.signout} size={15} />
              </span>
              <span style={{ flex: 1 }}>Sign out · view onboarding</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
