"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";

export interface NotificationSseEvent {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotificationStream(
  onNotification: (event: NotificationSseEvent) => void,
) {
  const cbRef = useRef(onNotification);
  cbRef.current = onNotification;

  useEffect(() => {
    let es: EventSource;
    let retry: ReturnType<typeof setTimeout>;

    function connect() {
      const token = useAuthStore.getState().accessToken;
      if (!token) return;

      const base = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_GRAPHQL_URL?.replace("/graphql", "");
      es = new EventSource(`${base}/notifications/stream?token=${encodeURIComponent(token)}`);

      es.onmessage = (e: MessageEvent) => {
        try {
          cbRef.current(JSON.parse(e.data as string) as NotificationSseEvent);
        } catch {}
      };

      es.onerror = () => {
        es.close();
        retry = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      clearTimeout(retry);
      es?.close();
    };
  }, []);
}
