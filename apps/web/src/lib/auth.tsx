"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthUserResponse } from "./types";

interface AuthContextValue {
  user: AuthUserResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    tenantName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<AuthUserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? "",
          tenantId: (session.user.user_metadata as Record<string, string>)
            .tenantId ?? "",
          role: (session.user.user_metadata as Record<string, string>).role ?? "ORG_ADMIN",
          isAdminMaster:
            (session.user.user_metadata as Record<string, unknown>)
              .isAdminMaster === true,
          tenantName:
            (session.user.user_metadata as Record<string, string>)
              .tenantName ?? "",
        });
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: { user: { id: string; email?: string; user_metadata: Record<string, unknown> } } | null) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            tenantId: (session.user.user_metadata as Record<string, string>)
              .tenantId ?? "",
            role: (session.user.user_metadata as Record<string, string>).role ?? "ORG_ADMIN",
            isAdminMaster:
              (session.user.user_metadata as Record<string, unknown>)
                .isAdminMaster === true,
            tenantName:
              (session.user.user_metadata as Record<string, string>)
                .tenantName ?? "",
          });
        } else {
          setUser(null);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    },
    [supabase, router],
  );

  const register = useCallback(
    async (email: string, password: string, tenantName: string) => {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              tenantName,
            },
          },
        });
        if (error) throw error;
        try {
          const { api } = await import('@/lib/api');
          await api.register(email, password, tenantName);
        } catch {
          // Backend registration may fail if API is not deployed yet
        }
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    },
    [supabase, router],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  }, [supabase, router]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
