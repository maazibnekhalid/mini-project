"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "@/services/auth";

type AuthContextValue = {
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

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "mini-event-auth";

type StoredSession = {
  user: AuthUser;
  token: string | null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);

      if (storedValue) {
        const parsed = JSON.parse(storedValue) as StoredSession;
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

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
        setUser(nextUser);
        setToken(nextToken);
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

        setUser(guestUser);
        setToken(null);
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            user: guestUser,
            token: null,
          })
        );
      },
      clearSession: () => {
        setUser(null);
        setToken(null);
        window.localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [isHydrated, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
