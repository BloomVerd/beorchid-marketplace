"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useUpdateUserRoles } from "@/common/hooks/mutations/use-update-user-roles";

// Maps dropdown label → the actual role string it controls
const ROLE_KEY: Record<string, string> = {
  Company: "company",
  Admin:   "super_admin",
};

export function roleLabel(roles: string[]) {
  if (roles.includes("super_admin")) return "Admin";
  if (roles.includes("company"))     return "Company";
  return "Individual";
}

export function roleBadgeCls(roles: string[]) {
  if (roles.includes("super_admin")) return "badge badge-money";
  if (roles.includes("company"))     return "badge badge-primary";
  return "badge";
}

function isActive(label: string, roles: string[]) {
  if (label === "Individual") return !roles.includes("company") && !roles.includes("super_admin");
  return roles.includes(ROLE_KEY[label]);
}

export function RolePickerDropdown({ userId, roles }: { userId: string; roles: string[] }) {
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [updateRoles, { loading }] = useUpdateUserRoles();

  const isOpen = menuPos !== null;

  function openMenu() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.left });
  }

  function closeMenu() {
    setMenuPos(null);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleMouseDown(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    }

    function handleScroll() { closeMenu(); }

    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  async function handleToggle(label: string) {
    let newRoles: string[];

    if (label === "Individual") {
      // "Individual" means strip all managed roles
      newRoles = roles.filter((r) => !Object.values(ROLE_KEY).includes(r));
    } else {
      const key = ROLE_KEY[label];
      newRoles = roles.includes(key)
        ? roles.filter((r) => r !== key)   // remove
        : [...roles, key];                  // add
    }

    try {
      await updateRoles({ variables: { userId, roles: newRoles } });
      toast.success("Roles updated.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update roles.");
    }
  }

  return (
    <>
      <button
        ref={btnRef}
        className="role-pick"
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        disabled={loading}
      >
        <span className={roleBadgeCls(roles)}>{roleLabel(roles)}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && menuPos && createPortal(
        <div
          ref={menuRef}
          className="menu"
          style={{ position: "fixed", top: menuPos.top, left: menuPos.left, minWidth: 180, zIndex: 9999 }}
        >
          <div className="eyebrow" style={{ padding: "8px 10px" }}>Set role</div>
          {["Individual", "Company", "Admin"].map((r) => (
            <button key={r} className="menu-item" onClick={() => handleToggle(r)}>
              <span style={{ flex: 1 }}>{r}</span>
              {isActive(r, roles) && <span style={{ color: "var(--primary)" }}>✓</span>}
            </button>
          ))}
        </div>,
        document.querySelector(".v2-root") ?? document.body
      )}
    </>
  );
}
