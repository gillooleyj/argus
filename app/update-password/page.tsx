"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full px-3 py-2 border border-brand-gold/40 rounded-lg bg-brand-navy text-brand-heading placeholder-brand-body/40 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent text-sm";

type PageState = "waiting" | "ready" | "invalid";

export default function UpdatePasswordPage() {
  const [pageState, setPageState] = useState<PageState>("waiting");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If no PASSWORD_RECOVERY event arrives within 5 seconds the link is
    // invalid or expired — show the error state.
    const timeout = setTimeout(() => {
      setPageState((s) => (s === "waiting" ? "invalid" : s));
    }, 5000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        clearTimeout(timeout);
        setPageState("ready");
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    // Full navigation to bust the Next.js router cache so middleware
    // re-evaluates with the cleared session cookie.
    window.location.href = "/login?updated=1";
  }

  // ── Waiting for PASSWORD_RECOVERY event ─────────────────────────────────────
  if (pageState === "waiting") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-brand-navy">
        <div className="w-full max-w-md bg-brand-blue border border-brand-gold/40 rounded-xl shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-brand-body">Verifying reset link…</p>
        </div>
      </div>
    );
  }

  // ── Invalid / expired link ───────────────────────────────────────────────────
  if (pageState === "invalid") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-brand-navy">
        <div className="w-full max-w-md bg-brand-blue border border-brand-gold/40 rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-xl font-bold text-brand-heading mb-2">
            Link expired or invalid
          </h2>
          <p className="text-sm text-brand-body mb-6">
            This reset link is no longer valid. Request a new one and try again.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block px-4 py-2 bg-brand-gold hover:bg-brand-gold-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  // ── Ready: password form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-brand-navy">
      <div className="w-full max-w-md bg-brand-blue border border-brand-gold/40 rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center text-brand-heading mb-2">
          Set a new password
        </h1>
        <p className="text-sm text-center text-brand-body mb-8">
          Choose a strong password for your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-body mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-brand-body">Minimum 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-body mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-brand-gold hover:bg-brand-gold-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
