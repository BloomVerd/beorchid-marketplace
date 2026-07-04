"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useApproveFieldObservation } from "@/common/hooks/mutations/use-approve-field-observation";

interface Props {
  id: string;
  observedPrice: number;
  onClose: () => void;
}

export function ApproveObservationModal({ id, observedPrice, onClose }: Props) {
  const [adjustedPrice, setAdjustedPrice] = useState("");
  const [approveObs, { loading }] = useApproveFieldObservation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = adjustedPrice.trim() ? Number(adjustedPrice.trim()) : undefined;
    try {
      await approveObs({ variables: { id, adjustedPrice: price } });
      toast.success("Observation approved.");
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to approve.");
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="h3">Approve observation</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="muted" style={{ marginBottom: 16 }}>
              Approving will publish this observation to farm health scores. The observed
              price is <strong>GHS {observedPrice.toLocaleString()}</strong>.
            </p>
            <div>
              <div className="label">
                Adjusted price (GHS)
                <span className="faint" style={{ marginLeft: 6 }}>optional</span>
              </div>
              <div className="field">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={observedPrice.toLocaleString()}
                  value={adjustedPrice}
                  onChange={(e) => setAdjustedPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Approving…" : "Approve"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
