"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCrops } from "@/common/hooks/queries/use-crops";
import { useSubmitFieldObservation } from "@/common/hooks/mutations/use-submit-field-observation";
import type { FieldPriceType, QualityGrade, ObservationConfidence } from "@/common/graphql/generated/graphql";

const REGIONS    = ["ashanti", "northern", "greater_accra", "brong_ahafo"];
const PRICE_TYPES = ["FARM_GATE", "WHOLESALE", "RETAIL", "AUCTION"];
const CONFIDENCE  = ["HIGH", "MEDIUM", "LOW"];

const EMPTY_FORM = {
  cropId: "", region: "ashanti",
  observedAt: new Date().toISOString().slice(0, 10),
  pricePerUnit: "", priceType: "FARM_GATE", qualityGrade: "A",
  confidence: "HIGH", notes: "",
};

interface Props { onClose: () => void }

export function SubmitObservationModal({ onClose }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const { data: cropsData } = useCrops();
  const [submitObservation, { loading: submitting }] = useSubmitFieldObservation();

  const crops = cropsData?.crops ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cropId || !form.pricePerUnit) {
      toast.error("Crop and price are required.");
      return;
    }
    try {
      await submitObservation({
        variables: {
          input: {
            cropId:        form.cropId,
            region:        form.region,
            observedAt:    new Date(form.observedAt).toISOString(),
            observedPrice: parseFloat(form.pricePerUnit),
            priceType:     form.priceType as FieldPriceType,
            qualityGrade:  form.qualityGrade as QualityGrade,
            confidence:    form.confidence as ObservationConfidence,
            sourceNote:    form.notes || "Field observation",
          },
        },
      });
      toast.success("Observation submitted for review.");
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Submission failed.");
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="h3">Submit observation</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div className="label">Crop</div>
                <div className="field">
                  <select value={form.cropId} onChange={(e) => setForm((f) => ({ ...f, cropId: e.target.value }))}>
                    <option value="">Select…</option>
                    {crops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div className="label">Region</div>
                <div className="field">
                  <select value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}>
                    {REGIONS.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div className="label">Date observed</div>
                <div className="field">
                  <input type="date" value={form.observedAt}
                    onChange={(e) => setForm((f) => ({ ...f, observedAt: e.target.value }))} />
                </div>
              </div>
              <div>
                <div className="label">Price per unit</div>
                <div className="field">
                  <span className="mono faint">GHS</span>
                  <input type="number" min="0" step="0.01" placeholder="e.g. 42.50"
                    value={form.pricePerUnit}
                    onChange={(e) => setForm((f) => ({ ...f, pricePerUnit: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div className="label">Price type</div>
                <div className="field">
                  <select value={form.priceType} onChange={(e) => setForm((f) => ({ ...f, priceType: e.target.value }))}>
                    {PRICE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div className="label">Quality grade</div>
                <div className="field">
                  <input placeholder="A, B, C…" value={form.qualityGrade}
                    onChange={(e) => setForm((f) => ({ ...f, qualityGrade: e.target.value }))} />
                </div>
              </div>
            </div>
            <div>
              <div className="label">Confidence</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {CONFIDENCE.map((c) => (
                  <button key={c} type="button" className="chip" data-active={form.confidence === c}
                    onClick={() => setForm((f) => ({ ...f, confidence: c }))}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="label">Notes <span className="faint">optional</span></div>
              <div className="field" style={{ height: "auto", padding: "10px 14px", alignItems: "flex-start" }}>
                <textarea rows={3}
                  style={{ flex: 1, border: "none", outline: "none", background: "none", resize: "none", fontFamily: "inherit", fontSize: 14, color: "var(--ink)", width: "100%" }}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
