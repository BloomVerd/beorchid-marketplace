"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

/* ── exact icon SVG paths from the design ────────────────────── */
const ICON = {
  dashboard: [
    "M3 13h8V3H3z",
    "M13 21h8V8h-8z",
    "M3 21h8v-6H3z",
    "M13 3h8v3h-8z",
  ],
  trends: ["M3 3v18h18", "m19 9-5 5-4-4-3 3"],
  market: [
    "M3 21h18",
    "M5 21V7l8-4v18",
    "M19 21V11l-6-4",
    "M9 9v.01",
    "M9 12v.01",
    "M9 15v.01",
  ],
  invest: ["M12 2v20", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"],
  coins: [
    "M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z",
    "M18.09 10.37A6 6 0 1 1 10.34 18",
    "m7 6h1v4",
    "m16.71 13.88.7.71-2.82 2.82",
  ],
  wallet: [
    "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1",
    "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",
  ],
  watch: [
    "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  ],
  plans: ["M3 3v18h18", "M18 17V9", "M13 17V5", "M8 17v-3"],
  pricing: [
    "M4 21v-7",
    "M4 10V3",
    "M12 21v-9",
    "M12 8V3",
    "M20 21v-5",
    "M20 12V3",
    "M1 14h6",
    "M9 8h6",
    "M17 16h6",
  ],
  leaf: [
    "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
    "M2 21c0-3 1.85-5.36 5.08-6",
  ],
  fieldObs: [
    "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",
    "M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  ],
  admin: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
};

function NavIcon({ paths }: { paths: string[] }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

function DesignSystemIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="6.5" cy="13.5" r="2.5" />
      <circle cx="13.5" cy="13.5" r="2.5" />
    </svg>
  );
}

/* ── nav item definition ────────────────────────────────────── */
const NAV_MAIN = [
  { href: "/dashboard", label: "Dashboard", icon: ICON.dashboard },
  { href: "/market-trends", label: "Market Trends", icon: ICON.trends },
  { href: "/marketplace", label: "Marketplace", icon: ICON.market },
  { href: "/investments", label: "Investments", icon: ICON.invest },
  { href: "/coins", label: "Coins", icon: ICON.coins },
  { href: "/wallet", label: "Wallet", icon: ICON.wallet },
  { href: "/watchlist", label: "Watchlist", icon: ICON.watch },
];

const NAV_ADMIN = [
  { href: "/admin", label: "Admin overview", icon: ICON.admin },
  { href: "/investment-plans", label: "Investment plans", icon: ICON.plans },
  { href: "/coin-pricing", label: "Coin pricing", icon: ICON.pricing },
];

const NAV_FIELD_AGENTS = [
  {
    href: "/field-observations",
    label: "Field observations",
    icon: ICON.fieldObs,
  },
];

/* ── active-state logic mirrors the design's navList() ──────── */
function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/market-trends") return pathname.startsWith("/market-trends");
  if (href === "/marketplace")
    return (
      pathname.startsWith("/marketplace") ||
      pathname.startsWith("/my-offers") ||
      pathname.startsWith("/my-deals")
    );
  if (href === "/investments")
    return (
      pathname.startsWith("/investments") ||
      pathname.startsWith("/my-investments")
    );
  if (href === "/coins") return pathname.startsWith("/coins");
  if (href === "/wallet") return pathname.startsWith("/wallet");
  if (href === "/watchlist") return pathname.startsWith("/watchlist");
  return pathname.startsWith(href);
}

/* ── component ──────────────────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname();
  const activeRole = useAuthStore((s) => s.activeRole);
  const farmer = useAuthStore((s) => s.farmer);
  const isAdmin = activeRole === "super_admin";
  const isFieldAgentSection = isAdmin || !!farmer?.isFieldAgent;

  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const closeSidebar = useUIStore((s) => s.closeSidebar);

  return (
    <>
      {/* Backdrop — mobile only, closes sidebar on click */}
      <div
        className={`sidebar-backdrop${sidebarOpen ? " sidebar-open" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar${sidebarOpen ? " sidebar-open" : ""}`}>
        {/* Brand */}
        <div className="side-head">
          <div className="brand">
            <div className="brand-mark">
              <NavIcon paths={ICON.leaf} />
            </div>
            <div>
              <div className="brand-name">AgriMarket</div>
              <div className="brand-sub">by Bloomverd</div>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <nav className="side-nav">
          <span className="side-label">Markets</span>
          {NAV_MAIN.map(({ href, label, icon }) => (
            <Link
              key={href + label}
              href={href}
              className="nav-btn"
              data-active={isNavActive(pathname, href)}
              onClick={closeSidebar}
            >
              <NavIcon paths={icon} />
              <span>{label}</span>
            </Link>
          ))}

          {/* Admin section */}
          {isAdmin && (
            <>
              <span className="side-label">Admin</span>
              {NAV_ADMIN.map(({ href, label, icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="nav-btn"
                  data-active={pathname.startsWith(href)}
                  onClick={closeSidebar}
                >
                  <NavIcon paths={icon} />
                  <span>{label}</span>
                </Link>
              ))}
            </>
          )}

          {/* Field agents section */}
          {isFieldAgentSection && (
            <>
              <span className="side-label">Field agents</span>
              {NAV_FIELD_AGENTS.map(({ href, label, icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="nav-btn"
                  data-active={pathname.startsWith(href)}
                  onClick={closeSidebar}
                >
                  <NavIcon paths={icon} />
                  <span>{label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Design system button */}
        {/*<div style={{ padding: "4px" }}>
          <button className="nav-btn" data-active={false}>
            <DesignSystemIcon />
            <span>Design system</span>
          </button>
        </div>*/}
      </aside>
    </>
  );
}
