"use client";

import { createContext, useMemo, useState } from "react";
import type { AuthUser } from "@/services/auth";

type AuthContextValue = {       // Authentication context
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  isHydrated: boolean;
  token: string | null;
  user: AuthUser | null;
  setSession: (user: AuthUser, token: string) => void;
  continueAsGuest: () => void;
  clearSession: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);    // Create a React context for authentication, initialized with undefined. This context will hold the authentication state and functions to manage the session.

const STORAGE_KEY = "mini-event-auth";

type StoredSession = {
  user: AuthUser;
  token: string | null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {   // Authentication provider component
  const [session, setSessionState] = useState<StoredSession | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);
      return storedValue ? (JSON.parse(storedValue) as StoredSession) : null;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  const user = session?.user ?? null;
  const token = session?.token ?? null;
  const isHydrated = true;

  const value = useMemo<AuthContextValue>(
    () => ({
      // PDF Requirement: State management for auth session
      // Tracks signed-in users, admin role, and guest mode in one shared context.
      isAuthenticated: Boolean(user && user.role !== "guest" && token),
      isAdmin: user?.role === "admin",
      isGuest: user?.role === "guest",
      isHydrated,
      token,
      user,
      setSession: (nextUser, nextToken) => {
        setSessionState({ user: nextUser, token: nextToken });
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            user: nextUser,
            token: nextToken,
          })
        );
      },
      continueAsGuest: () => {
        // Custom Requirement: Guest mode
        // Guest can browse the app but cannot create, edit, or delete events.
        const guestUser: AuthUser = {
          _id: "guest-session",
          name: "Guest",
          email: "",
          role: "guest",
        };

        setSessionState({ user: guestUser, token: null });
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            user: guestUser,
            token: null,
          })
        );
      },
      clearSession: () => {
        setSessionState(null);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [isHydrated, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
