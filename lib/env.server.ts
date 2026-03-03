/**
 * Server-only environment variable validation.
 *
 * This module is imported at the top level of server route handlers, so
 * validation runs at module load time (i.e. on cold start in production,
 * immediately on the first request in dev). A missing variable surfaces as a
 * clear startup error rather than a cryptic runtime failure deep inside a
 * request handler.
 *
 * Never import this file from client components — it references server-only
 * env vars and will cause build errors if bundled for the browser.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `\n` +
      `  Missing required server environment variable: ${name}\n` +
      `  See .env.example for setup instructions.\n`
    );
  }
  return value;
}

export const serverEnv = {
  SUPABASE_URL:             requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_ANON_KEY:        requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
};
