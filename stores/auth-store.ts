import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Farmer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isFieldAgent: boolean;
}

interface AuthState {
  farmer: Farmer | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  activeRole: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setAuth: (farmer: Farmer, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setActiveRole: (role: string) => void;
  logout: () => void;
}

function deriveInitialRole(roles: string[]): string {
  if (roles.includes("super_admin")) return "super_admin";
  if (roles.includes("company")) return "company";
  return "farmer";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      farmer: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      activeRole: null,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setAuth: (farmer, accessToken, refreshToken) => {
        set({
          farmer,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          activeRole: deriveInitialRole(farmer.roles),
        });
      },
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },
      setActiveRole: (role) => set({ activeRole: role }),
      logout: () => {
        set({ farmer: null, accessToken: null, refreshToken: null, isAuthenticated: false, activeRole: null });
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        farmer: state.farmer,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        activeRole: state.activeRole,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
