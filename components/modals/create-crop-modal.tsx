"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCreateCrop } from "@/common/hooks/mutations/use-create-crop";

const EMPTY_FORM = { name: "", unit: "", category: "", region: "" };

interface Props { onClose: () => void }

export function CreateCropModal({ onClose }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [createCrop, { loading }] = useCreateCrop();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await createCrop({
        variables: {
          input: {
            name:     form.name.trim(),
            unit:     form.unit.trim()     || undefined,
            category: form.category.trim() || undefined,
            region:   form.region.trim()   || undefined,
          },
        },
      });
      toast.success(`Crop "${form.name}" created.`);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create crop.");
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="h3">New crop</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div>
              <div className="label">Name *</div>
              <div className="field">
                <input
                  placeholder="e.g. Sorghum"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div>
                <div className="label">Unit</div>
                <div className="field">
                  <input
                    placeholder="per 100kg bag"
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <div className="label">Category</div>
                <div className="field">
                  <input
                    placeholder="e.g. grains"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="label">Region <span className="faint">optional</span></div>
              <div className="field">
                <input
                  placeholder="e.g. ashanti"
                  value={form.region}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !form.name.trim()}
            >
              {loading ? "Creating…" : "Create crop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
