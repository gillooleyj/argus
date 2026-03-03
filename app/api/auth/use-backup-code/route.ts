import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { serverEnv } from "@/lib/env.server";

// ── Rate limit: 5 attempts per 15-minute window per user ─────────────────────
// Enforced via a Supabase RPC that atomically increments a persistent counter,
// so the limit survives server restarts and works across serverless instances.
const RATE_LIMIT = 5;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, factorId } = body as { code?: string; factorId?: string };

    if (!code || !factorId) {
      return NextResponse.json({ error: "Missing code or factorId." }, { status: 400 });
    }

    // ── Get authenticated user from session cookies ──────────────────────────
    const cookieStore = await cookies();
    const supabase = createServerClient(
      serverEnv.SUPABASE_URL,
      serverEnv.SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Read-only in route handlers — session refresh handled by middleware
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    // ── Rate limit (Supabase-backed) ──────────────────────────────────────────
    const { data: attemptCount, error: rateError } = await supabase.rpc(
      "check_and_increment_backup_code_rate_limit",
      { p_user_id: user.id }
    );

    if (rateError || attemptCount === null) {
      return NextResponse.json({ error: "Rate limit check failed." }, { status: 500 });
    }

    if (attemptCount > RATE_LIMIT) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    // ── Normalize and compare against all unused codes via bcrypt ────────────
    const normalized = code.replace("-", "").toUpperCase();

    const { data: rows, error: lookupError } = await supabase
      .from("backup_codes")
      .select("id, code_hash")
      .eq("user_id", user.id)
      .eq("factor_id", factorId)
      .is("used_at", null);

    if (lookupError) {
      return NextResponse.json({ error: "Database error." }, { status: 500 });
    }

    let matchedRow: { id: string } | null = null;
    for (const row of rows ?? []) {
      if (await bcrypt.compare(normalized, row.code_hash)) {
        matchedRow = row;
        break;
      }
    }

    if (!matchedRow) {
      return NextResponse.json(
        { error: "Invalid or already-used backup code." },
        { status: 400 }
      );
    }

    // ── Mark as used ─────────────────────────────────────────────────────────
    const { error: updateError } = await supabase
      .from("backup_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", matchedRow.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to mark code as used." }, { status: 500 });
    }

    // ── Audit log: backup code consumed ──────────────────────────────────────
    // Fire-and-forget — don't block the response on logging success
    supabase.from("mfa_audit_log").insert({
      user_id: user.id,
      event: "backup_code_used",
      factor_id: factorId,
    });

    // ── Delete the TOTP factor via admin API ─────────────────────────────────
    const adminClient = createClient(
      serverEnv.SUPABASE_URL,
      serverEnv.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error: deleteError } = await adminClient.auth.admin.mfa.deleteFactor({
      userId: user.id,
      id: factorId,
    });

    if (deleteError) {
      // Rollback: un-mark the code so the user can try again.
      // If the rollback itself fails the code stays consumed, but that is
      // preferable to leaving the factor intact while the code appears used.
      await supabase
        .from("backup_codes")
        .update({ used_at: null })
        .eq("id", matchedRow.id);

      return NextResponse.json(
        { error: "Failed to remove authenticator factor. Please try again." },
        { status: 500 }
      );
    }

    // ── Clean up all backup codes for this factor ────────────────────────────
    await supabase
      .from("backup_codes")
      .delete()
      .eq("user_id", user.id)
      .eq("factor_id", factorId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
