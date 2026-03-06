"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

type UserRole = "owner" | "admin" | "staff" | "client";

interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  specialty?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getSupabase() {
  if (typeof window === "undefined") return null;
  return createClient();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabaseRef.current = supabase;

    const initAuth = async () => {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (supabaseUser) {
        const role = (supabaseUser.user_metadata?.role as UserRole) || "client";
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          role,
          fullName: supabaseUser.user_metadata?.full_name,
          specialty: supabaseUser.user_metadata?.specialty,
        });
      }
      setLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        const role = (session.user.user_metadata?.role as UserRole) || "client";
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          role,
          fullName: session.user.user_metadata?.full_name,
          specialty: session.user.user_metadata?.specialty,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = supabaseRef.current || getSupabase();
    if (!supabase) return { error: "Not available on server" };
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const signOut = async () => {
    const supabase = supabaseRef.current || getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  const hasPermission = (requiredRoles: UserRole[]) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
