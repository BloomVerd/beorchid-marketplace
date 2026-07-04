"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { ModalRoot } from "@/components/modals";
import { NotificationStreamProvider } from "@/components/features/notifications/notification-stream-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Topbar />
        <div className="main-scroll">
          <div className="main-pad">{children}</div>
        </div>
      </main>
      <ModalRoot />
      <NotificationStreamProvider />
    </div>
  );
}
