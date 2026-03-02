"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-brand-navy">
      <div className="w-full max-w-sm bg-brand-blue border border-brand-gold/40 rounded-xl shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-brand-body mb-6">
          An unexpected error occurred. Your data is safe — please try again.
        </p>
        <button
          onClick={reset}
          className="w-full py-2 px-4 bg-brand-gold hover:bg-brand-gold-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
