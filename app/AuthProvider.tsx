"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthCtx = { user: User | null; loading: boolean; isFullyAuthenticated: boolean };

const AuthContext = createContext<AuthCtx>({ user: null, loading: true, isFullyAuthenticated: false });

export const useAuth = () => useContext(AuthContext);

// Used only for the initial page load — safe because it runs outside
// of any onAuthStateChange callback.
async function checkFullAuth(): Promise<boolean> {
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return aal?.currentLevel === "aal2";
}

// Reads the AAL directly from the JWT payload already in memory.
// MUST be used instead of getAuthenticatorAssuranceLevel() inside
// onAuthStateChange to avoid a deadlock: mfa.verify() holds the
// Supabase storage lock while firing the callback chain; calling any
// auth method that re-acquires that lock (getSession, getUser, etc.)
// causes verify() to never resolve.
function aalFromSession(session: Session | null): string | null {
  if (!session?.access_token) return null;
  try {
    // JWTs use base64url; normalise before decoding
    const b64 = session.access_token
      .split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const payload = JSON.parse(atob(b64));
    return payload.aal ?? null;
  } catch {
    return null;
  }
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
    // Initial load: API call is safe here (not inside onAuthStateChange)
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      setIsFullyAuthenticated(user ? await checkFullAuth() : false);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Synchronous — no Supabase API calls inside this handler.
      setUser(session?.user ?? null);
      setIsFullyAuthenticated(aalFromSession(session) === "aal2");
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isFullyAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
