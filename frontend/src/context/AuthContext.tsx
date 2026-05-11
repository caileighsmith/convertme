"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface OnboardingData {
  journeyStage: string;
  tradition: string;
  hebrewLevel: number;
}

interface User {
  id: number;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  onboardingComplete: boolean;
  onboardingData: OnboardingData | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "cm_token";

interface MeResponse {
  id: number;
  email: string;
  journey_stage: string | null;
  tradition: string | null;
  hebrew_level: number | null;
}

function parseOnboarding(me: MeResponse): OnboardingData | null {
  if (!me.journey_stage) return null;
  return {
    journeyStage: me.journey_stage,
    tradition: me.tradition ?? "",
    hebrewLevel: me.hebrew_level ?? 25,
  };
}

async function fetchMe(token: string): Promise<{ user: User; onboardingData: OnboardingData | null }> {
  const res = await fetch(`${API}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("invalid token");
  const data: MeResponse = await res.json();
  return {
    user: { id: data.id, email: data.email },
    onboardingData: parseOnboarding(data),
  };
}

async function postAuth(path: string, body: object): Promise<string> {
  const res = await fetch(`${API}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? "Request failed");
  }
  const data = await res.json();
  return (data as { access_token: string }).access_token;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) { setLoading(false); return; }
    fetchMe(saved)
      .then(({ user: u, onboardingData: od }) => {
        setToken(saved);
        setUser(u);
        setOnboardingData(od);
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (t: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    const { user: u, onboardingData: od } = await fetchMe(t);
    setUser(u);
    setOnboardingData(od);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const t = await postAuth("login", { email, password });
    await persist(t);
  }, [persist]);

  const register = useCallback(async (email: string, password: string) => {
    const t = await postAuth("register", { email, password });
    await persist(t);
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setOnboardingData(null);
  }, []);

  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    if (!token) return;
    setOnboardingData(data); // optimistic
    await fetch(`${API}/api/auth/onboarding`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        journey_stage: data.journeyStage,
        tradition: data.tradition,
        hebrew_level: data.hebrewLevel,
      }),
    });
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      onboardingComplete: !!onboardingData,
      onboardingData,
      login, register, logout, completeOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
