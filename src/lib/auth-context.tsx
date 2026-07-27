"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "./supabase/client";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
}

interface AuthContextType extends AuthState {
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoggedIn: false,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, isLoggedIn: false });

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setState({ user: data.user, loading: false, isLoggedIn: true });
          return;
        }
      }
    } catch {}
    setState({ user: null, loading: false, isLoggedIn: false });
  };

  useEffect(() => { fetchUser(); }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ user: null, loading: false, isLoggedIn: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, refresh: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
