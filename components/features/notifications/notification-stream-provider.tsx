"use client";

import { toast } from "sonner";
import { useNotificationStream } from "@/common/hooks/use-notification-stream";
import { useNotificationStore } from "@/stores/notification-store";

export function NotificationStreamProvider() {
  const { prependNotification } = useNotificationStore();

  useNotificationStream((event) => {
    prependNotification(event);
    toast(event.title, { description: event.message });
  });

  return null;
}
