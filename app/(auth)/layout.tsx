import { Leaf } from "lucide-react";
import { ThemeToggle } from "@/components/auth/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-stage">
      {/* Left brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-inner">
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span className="brand-mark-dark">
              <Leaf size={20} color="#fff" />
            </span>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "#fff" }}>
                AgriMarket
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>by Bloomverd</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 420 }}>
            <div className="eyebrow" style={{ color: "rgba(255,255,255,.7)", marginBottom: 14 }}>
              Agri-fintech for Ghana
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(30px,3.4vw,42px)",
                letterSpacing: "-.02em",
                lineHeight: 1.06,
                color: "#fff",
                margin: "0 0 18px",
              }}
            >
              Invest in the harvest,
              <br />
              not just the hype.
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,.85)", margin: 0 }}>
              Trade crop trends, buy farms, fund harvests and hold crop-backed
              coins — all priced from real Bloomverd field data.
            </p>

            {/* Stats */}
            <div style={{ display: "flex", gap: 32, marginTop: 36 }}>
              {[
                { value: "GHS 4.8M", label: "Monthly volume" },
                { value: "1,284",   label: "Active investments" },
                { value: "6",       label: "Crop coins" },
              ].map(({ value, label }) => (
                <div key={label} className="auth-stat">
                  <span className="auth-stat-value">{value}</span>
                  <span className="auth-stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 12, color: "rgba(255,255,255,.55)", margin: 0 }}>
            Projections shown as ranges — never guaranteed returns.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-theme">
          <ThemeToggle />
        </div>

        <div className="auth-form">
          {/* Mobile logo (shown on small screens only) */}
          <div className="auth-mobile-logo">
            <div className="brand-mark">
              <Leaf size={18} />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--ink)" }}>
              AgriMarket
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
