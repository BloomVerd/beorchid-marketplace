import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong.", onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex col gap-3"
      style={{ alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center" }}
    >
      <div
        className="iconbox iconbox-lg"
        style={{ background: "var(--loss-soft)", color: "var(--loss)", width: 56, height: 56, borderRadius: "var(--r-lg)" }}
      >
        <AlertTriangle size={24} />
      </div>
      <div>
        <p className="semibold" style={{ marginBottom: 4 }}>Error</p>
        <p className="text-sm muted">{message}</p>
      </div>
      {onRetry && (
        <button className="btn btn-outline btn-sm" onClick={onRetry}>
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}
