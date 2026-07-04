import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  sub?: string;
}

export function StatCard({
  label,
  value,
  delta,
  deltaPositive,
  icon: Icon,
  iconColor = "var(--primary)",
  iconBg = "var(--primary-soft)",
  sub,
}: StatCardProps) {
  return (
    <div className="card card-pad flex col gap-3" style={{ gap: 16 }}>
      <div className="flex" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <p className="text-sm muted semibold">{label}</p>
        {Icon && (
          <div
            className="iconbox iconbox-sm"
            style={{ background: iconBg, color: iconColor, borderRadius: "var(--r-sm)" }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>
      <div>
        <p className="metric" style={{ fontSize: 26 }}>{value}</p>
        {sub && <p className="text-xs faint" style={{ marginTop: 4 }}>{sub}</p>}
      </div>
      {delta && (
        <span
          className="badge"
          style={{
            alignSelf: "flex-start",
            background: deltaPositive ? "var(--gain-soft)" : "var(--loss-soft)",
            color: deltaPositive ? "var(--gain)" : "var(--loss)",
            border: "none",
          }}
        >
          {delta}
        </span>
      )}
    </div>
  );
}
