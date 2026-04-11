"use client";

import { useNotifications } from "@/hooks/useNotifications";

const toneClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

export function ToastViewport() {
  const { notifications, dismiss } = useNotifications();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg ${toneClasses[notification.tone]}`}
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium leading-6">{notification.message}</p>
            <button
              type="button"
              onClick={() => dismiss(notification.id)}
              className="text-xs font-semibold uppercase tracking-[0.2em]"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
