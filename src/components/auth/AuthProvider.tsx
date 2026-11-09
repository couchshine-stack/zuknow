"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AuthUser = {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  openLogin: (next?: string) => void;
  closeLogin: () => void;
  loginOpen: boolean;
  loginNext: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginNext, setLoginNext] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = (await res.json()) as { user: AuthUser | null };
    setUser(data.user);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const openLogin = useCallback((next?: string) => {
    setLoginNext(next ?? null);
    setLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setLoginOpen(false);
    setLoginNext(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      logout,
      openLogin,
      closeLogin,
      loginOpen,
      loginNext,
    }),
    [user, loading, refresh, logout, openLogin, closeLogin, loginOpen, loginNext],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
