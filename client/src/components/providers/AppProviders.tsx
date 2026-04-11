"use client";

import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ToastViewport } from "@/components/ui/ToastViewport";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
        <ToastViewport />
      </NotificationProvider>
    </AuthProvider>
  );
}
