"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdminCreateUser } from "@/common/hooks/mutations/use-admin-create-user";

const ROLES = [
  { value: "farmer",      label: "Individual" },
  { value: "company",     label: "Company" },
  { value: "super_admin", label: "Admin" },
];

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  country: "GH",
  password: "",
  role: "farmer",
};

interface Props { onClose: () => void }

export function CreateUserModal({ onClose }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [adminCreateUser, { loading }] = useAdminCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error("All fields are required.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    try {
      const result = await adminCreateUser({
        variables: {
          input: {
            firstName: form.firstName.trim(),
            lastName:  form.lastName.trim(),
            email:     form.email.trim().toLowerCase(),
            country:   form.country.trim() || "GH",
            password:  form.password,
            roles:     [form.role],
          },
        },
      });
      const name = `${result.data?.adminCreateUser.firstName} ${result.data?.adminCreateUser.lastName}`;
      toast.success(`User "${name}" created.`);
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create user.");
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="h3">Add user</span>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2" style={{ gap: 12 }}>
              <div>
                <div className="label">First name</div>
                <div className="field">
                  <input
                    placeholder="e.g. Kofi"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <div className="label">Last name</div>
                <div className="field">
                  <input
                    placeholder="e.g. Mensah"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="label">Email address</div>
              <div className="field">
                <input
                  type="email"
                  placeholder="e.g. kofi@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div>
                <div className="label">Country code</div>
                <div className="field">
                  <input
                    placeholder="GH"
                    maxLength={2}
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>
              <div>
                <div className="label">Role</div>
                <div className="field">
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <div className="label">
                Temporary password
                <span className="faint" style={{ marginLeft: 6 }}>min 8 characters</span>
              </div>
              <div className="field">
                <input
                  type="password"
                  placeholder="········"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !form.firstName || !form.email || !form.password}
            >
              {loading ? "Creating…" : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
