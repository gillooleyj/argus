"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthCtx = { user: User | null; loading: boolean; isFullyAuthenticated: boolean };

const AuthContext = createContext<AuthCtx>({ user: null, loading: true, isFullyAuthenticated: false });

export const useAuth = () => useContext(AuthContext);

async function checkFullAuth(): Promise<boolean> {
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return aal?.currentLevel === "aal2";
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullyAuthenticated, setIsFullyAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      setIsFullyAuthenticated(user ? await checkFullAuth() : false);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setIsFullyAuthenticated(session?.user ? await checkFullAuth() : false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isFullyAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
