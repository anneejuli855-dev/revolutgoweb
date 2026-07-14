import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = {
  name: string;
  email: string;
  initials: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
};

const STORAGE_KEY = "novabank.auth.v1";
const DEMO_EMAIL = "Julieanneee10@mail.com";
const DEMO_PASSWORD = "Julieannee@2026";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const login: AuthContextValue["login"] = (email, password) => {
    if (email.trim().toLowerCase() !== DEMO_EMAIL.toLowerCase() || password !== DEMO_PASSWORD) {
      return { ok: false, error: "Invalid email or password." };
    }
    const next: User = { name: "Julie Annee", email: DEMO_EMAIL, initials: "JA" };
    setUser(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const DEMO_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD };