"use client";

import { createContext, useCallback, useMemo, useState } from "react";

export type NotificationTone = "success" | "error" | "info";

export type NotificationItem = {
  id: string;
  message: string;
  tone: NotificationTone;
};

type NotificationContextValue = {
  notifications: NotificationItem[];
  notify: (message: string, tone?: NotificationTone) => void;
  dismiss: (id: string) => void;
};

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: NotificationTone = "info") => {
      const id = crypto.randomUUID();

      setNotifications((current) => [...current, { id, message, tone }]);

      window.setTimeout(() => {
        dismiss(id);
      }, 3500);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      notifications,
      notify,
      dismiss,
    }),
    [dismiss, notifications, notify]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
