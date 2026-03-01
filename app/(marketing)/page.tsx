"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-navy text-white">

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-16 text-center">
        {/* Hero badge logo */}
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/argus-logo-badge.svg"
            alt="Argus"
            className="w-auto"
            style={{ height: "200px" }}
          />
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
          Never let a certification
          <br />
          <span className="text-brand-gold">expire on you again.</span>
        </h1>

        <p className="text-lg text-brand-body max-w-2xl mx-auto mb-10 leading-relaxed">
          Argus tracks your professional certifications, CPD progress, and renewal deadlines
          across every credential you hold — all in one place.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="bg-brand-gold hover:bg-brand-gold-hover text-white font-medium px-8 py-3 rounded-lg transition-colors text-sm"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="border border-brand-gold text-white hover:bg-brand-gold/10 font-medium px-8 py-3 rounded-lg transition-colors text-sm"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="relative rounded-xl overflow-hidden border border-brand-gold/40 shadow-2xl shadow-black/50">
          <div
            className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
            style={{
              height: "40%",
              background: "linear-gradient(to top, #0D1C2E, transparent)",
            }}
          />
          <Image
            src="/images/dashboard-preview.png"
            alt="Argus dashboard showing certification tracking"
            width={1200}
            height={750}
            className="w-full"
            priority
          />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Everything you need to stay certified</h2>
          <p className="text-brand-body">Designed for professionals who hold multiple credentials across different bodies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-brand-blue border border-brand-gold/40 rounded-xl p-6">
            <div className="w-10 h-10 bg-brand-navy border border-brand-gold/40 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Multi-Certification Tracking</h3>
            <p className="text-sm text-brand-body leading-relaxed">
              Track CISSP, CISM, PMP, CompTIA, and dozens more. Each cert shows CPD progress, expiration countdowns, and pace indicators.
            </p>
          </div>

          <div className="bg-brand-blue border border-brand-gold/40 rounded-xl p-6">
            <div className="w-10 h-10 bg-brand-navy border border-brand-gold/40 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">CPD Activity Logging</h3>
            <p className="text-sm text-brand-body leading-relaxed">
              Log continuing education activities once and apply them to multiple certifications simultaneously. Attach proof and track submission status.
            </p>
          </div>

          <div className="bg-brand-blue border border-brand-gold/40 rounded-xl p-6">
            <div className="w-10 h-10 bg-brand-navy border border-brand-gold/40 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Pace Intelligence</h3>
            <p className="text-sm text-brand-body leading-relaxed">
              Know exactly how many CPD hours per month you need to hit renewal deadlines. Stay on track before it becomes urgent.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-brand-gold/40 bg-brand-blue/30">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start tracking your credentials today.</h2>
          <p className="text-brand-body mb-8">Free to use. No credit card required.</p>
          <Link
            href="/signup"
            className="inline-flex bg-brand-gold hover:bg-brand-gold-hover text-white font-medium px-8 py-3 rounded-lg transition-colors text-sm"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-gold/40">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/argus-logo-icon.svg"
              alt=""
              aria-hidden="true"
              className="h-5 w-auto"
            />
            <span className="text-sm text-brand-body/70">
              © 2026 COOEY Tools. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-xs text-brand-body/70 hover:text-brand-gold transition-colors">Sign In</Link>
            <Link href="/signup" className="text-xs text-brand-body/70 hover:text-brand-gold transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
