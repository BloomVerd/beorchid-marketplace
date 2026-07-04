"use client";

import { forwardRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  error?: string;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, icon: Icon, error, type, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";

    return (
      <div style={{ width: "100%" }}>
        <label className="label">{label}</label>
        <div className="field">
          <Icon size={18} />
          <input ref={ref} type={isPassword && show ? "text" : type} {...props} />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              style={{ color: "var(--ink-3)", display: "flex", alignItems: "center", flexShrink: 0 }}
              tabIndex={-1}
            >
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs" style={{ color: "var(--crit)", marginTop: 5 }}>
            {error}
          </p>
        )}
      </div>
    );
  },
);
AuthField.displayName = "AuthField";

interface AuthSelectFieldProps {
  label: string;
  icon: LucideIcon;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
}

export function AuthSelectField({
  label,
  icon: Icon,
  error,
  value,
  onChange,
  children,
  placeholder,
}: AuthSelectFieldProps) {
  return (
    <div style={{ width: "100%" }}>
      <label className="label">{label}</label>
      <div className="field">
        <Icon size={18} />
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
      </div>
      {error && (
        <p className="text-xs" style={{ color: "var(--crit)", marginTop: 5 }}>
          {error}
        </p>
      )}
    </div>
  );
}
