"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  credits: number;
  plan: string;
}

interface AuthContextValue {
  user: any;
  session: any;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

  const loading = status === "loading";

  const profile: Profile | null = session?.user ? {
    id: (session.user as any).id,
    email: session.user.email ?? null,
    display_name: session.user.name ?? null,
    avatar_url: session.user.image ?? null,
    credits: (session.user as any).credits ?? 0,
    plan: (session.user as any).plan ?? "free",
  } : null;

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/' });
  };

  // Forces NextAuth to re-fetch the session from the DB (picks up new credits/plan)
  const refreshProfile = async () => {
    await update({ forceRefresh: true });
  };

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
