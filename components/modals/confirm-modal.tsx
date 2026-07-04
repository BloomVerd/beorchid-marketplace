"use client";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  variant = "default",
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="h3">{title}</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p className="muted">{message}</p>
        </div>
        <div className="modal-foot">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className={variant === "danger" ? "btn btn-outline" : "btn btn-primary"}
            style={variant === "danger" ? { color: "var(--loss)", borderColor: "var(--loss)" } : undefined}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
