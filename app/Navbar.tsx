"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    // Use a full navigation (not router.push) to bust the Next.js router cache
    // so middleware re-evaluates with the cleared session cookie.
    window.location.href = "/";
  }

  function linkClass(href: string) {
    return pathname?.startsWith(href)
      ? "text-brand-gold"
      : "text-brand-body hover:text-brand-gold";
  }

  return (
    <nav className="border-b border-brand-gold" style={{ background: "linear-gradient(to right, #12171F 0%, #0D1C2E 38%)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top bar (always visible) ─────────────────────────────────────── */}
        <div className="flex items-center justify-between h-[68px]">

          {/* Left: logo + desktop nav links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/argus-logo-icon.svg"
                alt=""
                aria-hidden="true"
                style={{ height: "52px", width: "auto" }}
              />
              <span className="tracking-tight text-white" style={{ fontSize: "22px", fontWeight: 700 }}>
                Argus
              </span>
            </Link>

            {/* Desktop nav links — hidden on mobile */}
            {user && (
              <div className="hidden sm:flex items-center gap-8">
                <Link href="/certifications" className={`text-sm font-medium transition-colors ${linkClass("/certifications")}`}>
                  Certifications
                </Link>
                <Link href="/cpe-activities" className={`text-sm font-medium transition-colors ${linkClass("/cpe-activities")}`}>
                  CPD Activities
                </Link>
                <Link href="/account" className={`text-sm font-medium transition-colors ${linkClass("/account")}`}>
                  Account
                </Link>
              </div>
            )}
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {/* Desktop sign out — hidden on mobile */}
            {user && (
              <button
                onClick={handleLogout}
                className="hidden sm:block px-3 py-1.5 text-sm font-medium text-brand-body hover:text-white border border-brand-gold/60 hover:border-brand-gold rounded-lg hover:bg-white/5 transition-colors"
              >
                Sign Out
              </button>
            )}

            {/* Theme toggle — always visible */}
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-brand-body hover:bg-white/10 transition-colors"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Mobile hamburger — hidden on desktop */}
            {user && (
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="sm:hidden p-2 rounded-lg text-brand-body hover:bg-white/10 transition-colors"
              >
                {menuOpen ? (
                  /* X / close */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  /* Hamburger */
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile dropdown menu ─────────────────────────────────────────── */}
        {user && menuOpen && (
          <div className="sm:hidden border-t border-brand-gold/40 py-2">
            <Link
              href="/certifications"
              className={`block px-2 py-3 text-sm font-medium rounded-lg transition-colors ${linkClass("/certifications")}`}
            >
              Certifications
            </Link>
            <Link
              href="/cpe-activities"
              className={`block px-2 py-3 text-sm font-medium rounded-lg transition-colors ${linkClass("/cpe-activities")}`}
            >
              CPD Activities
            </Link>
            <Link
              href="/account"
              className={`block px-2 py-3 text-sm font-medium rounded-lg transition-colors ${linkClass("/account")}`}
            >
              Account
            </Link>
            <div className="mt-2 pt-2 border-t border-brand-gold/40">
              <button
                onClick={handleLogout}
                className="w-full text-left px-2 py-3 text-sm font-medium text-brand-body hover:text-white rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}
