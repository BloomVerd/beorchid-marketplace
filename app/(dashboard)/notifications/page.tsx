"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useGetMyNotifications } from "@/common/hooks/queries/use-get-my-notifications";
import { useMarkNotificationRead } from "@/common/hooks/mutations/use-mark-notification-read";
import { useNotificationStore } from "@/stores/notification-store";
import { ErrorState } from "@/components/dashboard/error-state";

type NotifType = "OFFER" | "DEAL" | "INVESTMENT" | "ALERT" | "SYSTEM" | string;

function iconStyle(type: NotifType): { bg: string; color: string; icon: string } {
  if (type === "OFFER")      return { bg: "var(--primary-soft)", color: "var(--primary)", icon: "💬" };
  if (type === "DEAL")       return { bg: "var(--money-soft)",   color: "var(--money)",   icon: "🤝" };
  if (type === "INVESTMENT") return { bg: "var(--water-soft)",   color: "var(--water)",   icon: "📈" };
  if (type === "ALERT")      return { bg: "rgba(239,68,68,.1)", color: "var(--loss)",    icon: "🔔" };
  return                           { bg: "var(--surface-3)",    color: "var(--ink-3)",   icon: "ℹ" };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.round(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function groupByDate(notifs: Array<{ id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string }>) {
  const today: typeof notifs = [], week: typeof notifs = [], older: typeof notifs = [];
  const now = Date.now();
  for (const n of notifs) {
    const diff = now - new Date(n.createdAt).getTime();
    if (diff < 86400_000)    today.push(n);
    else if (diff < 7 * 86400_000) week.push(n);
    else                     older.push(n);
  }
  return [
    { label: "Today",      items: today },
    { label: "This week",  items: week },
    { label: "Earlier",    items: older },
  ].filter((g) => g.items.length > 0);
}

export default function NotificationsPage() {
  const { data, loading, error, refetch } = useGetMyNotifications(1, 50);
  const [markNotificationRead] = useMarkNotificationRead();
  const { notifications, setNotifications, markRead } = useNotificationStore();

  useEffect(() => {
    if (data?.getMyNotifications) setNotifications(data.getMyNotifications);
  }, [data, setNotifications]);

  const handleMark = async (id: string) => {
    markRead(id);
    try { await markNotificationRead({ variables: { notificationId: id } }); }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Failed."); }
  };

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const groups = groupByDate(notifications);

  return (
    <div className="anim-up" style={{ maxWidth: 760 }}>
      <h1 className="h1" style={{ margin: "0 0 6px" }}>Notifications</h1>
      <p className="muted" style={{ margin: "0 0 22px" }}>Stay up to date on offers, deals, and market alerts.</p>

      {loading && notifications.length === 0
        ? [1,2,3].map((i) => <div key={i} className="card skel" style={{ height: 64, marginBottom: 14 }} />)
        : notifications.length === 0
          ? <div className="card" style={{ padding: 32, textAlign: "center" }}><p className="faint">No notifications yet.</p></div>
          : groups.map((group) => (
              <div key={group.label} className="card" style={{ overflow: "hidden", marginBottom: 18 }}>
                <div style={{ padding: "14px 20px 10px" }} className="eyebrow">{group.label}</div>
                {group.items.map((n) => {
                  const { bg, color, icon } = iconStyle(n.type);
                  return (
                    <div
                      key={n.id}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 14,
                        padding: "14px 20px",
                        borderTop: "1px solid var(--line)",
                        background: n.isRead ? "transparent" : "var(--primary-soft)",
                        cursor: n.isRead ? "default" : "pointer",
                      }}
                      onClick={() => !n.isRead && handleMark(n.id)}
                    >
                      <div className="iconbox iconbox-md" style={{ background: bg, color, fontSize: 16, flexShrink: 0 }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="semibold" style={{ fontWeight: 600, fontSize: 13.5 }}>{n.title}</div>
                        <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>{n.message}</div>
                      </div>
                      <span className="mono faint" style={{ fontSize: 11.5, flexShrink: 0, marginTop: 2 }}>
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
    </div>
  );
}
