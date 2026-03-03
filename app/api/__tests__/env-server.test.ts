import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Helpers ───────────────────────────────────────────────────────────────────

const ALL_VARS = {
  NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("lib/env.server — startup validation", () => {
  beforeEach(() => {
    vi.resetModules();
    for (const [key, value] of Object.entries(ALL_VARS)) {
      process.env[key] = value;
    }
  });

  it("exports serverEnv with all values when every var is present", async () => {
    const { serverEnv } = await import("@/lib/env.server");
    expect(serverEnv.SUPABASE_URL).toBe(ALL_VARS.NEXT_PUBLIC_SUPABASE_URL);
    expect(serverEnv.SUPABASE_ANON_KEY).toBe(ALL_VARS.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    expect(serverEnv.SUPABASE_SERVICE_ROLE_KEY).toBe(ALL_VARS.SUPABASE_SERVICE_ROLE_KEY);
  });

  it("throws at import time when SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await expect(import("@/lib/env.server")).rejects.toThrow(
      /SUPABASE_SERVICE_ROLE_KEY/
    );
  });

  it("throws at import time when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    await expect(import("@/lib/env.server")).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/
    );
  });

  it("throws at import time when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    await expect(import("@/lib/env.server")).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY/
    );
  });

  it("error message includes setup instructions", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await expect(import("@/lib/env.server")).rejects.toThrow(
      /.env.example/
    );
  });
});
