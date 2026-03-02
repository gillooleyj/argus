"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full px-3 py-2 border border-brand-gold/40 rounded-lg bg-brand-navy text-brand-heading placeholder-brand-body/40 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent text-sm";

export default function SignupPage() {
  const [firstName, setFirstName]           = useState("");
  const [lastName, setLastName]             = useState("");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                   = useState<string | null>(null);
  const [success, setSuccess]               = useState(false);
  const [loading, setLoading]               = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    // Pass names as user metadata so the Postgres trigger can create the
    // profile row (user_profiles) automatically on signup.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name:  lastName.trim(),
        },
      },
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
            We sent a confirmation link to{" "}
            <span className="font-medium text-brand-heading">
              {email}
            </span>
            . Click it to activate your account, then sign in.
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
          Create an account
        </h1>
        <p className="text-sm text-center text-brand-body mb-8">
          Start tracking your CPD requirements
        </p>

        <form onSubmit={handleSignup} className="space-y-4" noValidate>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-brand-body mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                placeholder="Jane"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-brand-body mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
                placeholder="Smith"
                className={inputClass}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-body mb-1">
              Email <span className="text-red-500">*</span>
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

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-body mb-1">
              Password <span className="text-red-500">*</span>
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
            <p className="mt-1 text-xs text-brand-body">
              Minimum 8 characters
            </p>
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-body mb-1">
              Confirm Password <span className="text-red-500">*</span>
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
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-body">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-gold hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
