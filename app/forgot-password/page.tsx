"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full px-3 py-2 border border-brand-gold/40 rounded-lg bg-brand-navy text-brand-heading placeholder-brand-body/40 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent text-sm";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-brand-navy">
        <div className="w-full max-w-md bg-brand-blue border border-brand-gold/40 rounded-xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-xl font-bold text-brand-heading mb-2">
            Check your email
          </h2>
          <p className="text-sm text-brand-body mb-6">
            If an account exists for{" "}
            <span className="font-medium text-brand-heading">
              {email}
            </span>
            , you&apos;ll receive a password reset link shortly.
          </p>
          <Link href="/login" className="text-sm text-brand-gold hover:underline font-medium">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-brand-navy">
      <div className="w-full max-w-md bg-brand-blue border border-brand-gold/40 rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center text-brand-heading mb-2">
          Reset your password
        </h1>
        <p className="text-sm text-center text-brand-body mb-8">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-brand-gold hover:bg-brand-gold-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-body">
          <Link href="/login" className="text-brand-gold hover:underline font-medium">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
