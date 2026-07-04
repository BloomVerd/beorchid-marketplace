import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex col gap-3"
      style={{ alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center" }}
    >
      <div
        className="iconbox iconbox-lg"
        style={{ background: "var(--surface-2)", color: "var(--ink-3)", width: 56, height: 56, borderRadius: "var(--r-lg)" }}
      >
        <Icon size={24} />
      </div>
      <div>
        <p className="semibold" style={{ marginBottom: 4 }}>{title}</p>
        {description && <p className="text-sm muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
