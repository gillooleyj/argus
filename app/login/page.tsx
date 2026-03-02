"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full px-3 py-2 border border-brand-gold/40 rounded-lg bg-brand-navy text-brand-heading placeholder-brand-body/40 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent text-sm";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("timeout") === "1";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/certifications");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-brand-navy">
      <div className="w-full max-w-md bg-brand-blue border border-brand-gold/40 rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center text-brand-heading mb-2">
          Sign in
        </h1>
        <p className="text-sm text-center text-brand-body mb-8">
          Welcome back to Argus
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {sessionExpired && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2.5 text-amber-700 dark:text-amber-400 text-sm">
              Your session expired due to inactivity. Please log in again.
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-body mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-brand-body">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-brand-gold hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-brand-gold hover:bg-brand-gold-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-body">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand-gold hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

// Suspense boundary is required because LoginForm uses useSearchParams().
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
