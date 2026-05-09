"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface User {
  id: number;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "cm_token";

async function fetchMe(token: string): Promise<User> {
  const res = await fetch(`${API}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("invalid token");
  return res.json();
}

async function postAuth(path: string, body: object): Promise<string> {
  const res = await fetch(`${API}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Request failed");
  }
  const data = await res.json();
  return data.access_token as string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) { setLoading(false); return; }
    fetchMe(saved)
      .then((u) => { setToken(saved); setUser(u); })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((t: string, u: User) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const t = await postAuth("login", { email, password });
    const u = await fetchMe(t);
    persist(t, u);
  }, [persist]);

  const register = useCallback(async (email: string, password: string) => {
    const t = await postAuth("register", { email, password });
    const u = await fetchMe(t);
    persist(t, u);
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
