import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env.server";

// Deletes an unverified TOTP factor without triggering Supabase's
// "Authenticator App Removed" security notification email.
//
// The user-facing mfa.unenroll() sends that email for any factor deletion,
// including factors that were never verified (i.e. MFA was never active).
// Using the admin API bypasses the notification, so cleanup of an abandoned
// enrollment attempt is silent — as it should be.
//
// The verified-factor path (deliberate "disable MFA") goes through the
// account page's handleDisable(), which calls client-side mfa.unenroll()
// intentionally so the security email fires.

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { factorId } = body as { factorId?: string };

    if (!factorId) {
      return NextResponse.json({ error: "factorId required." }, { status: 400 });
    }

    // ── Authenticate the request ─────────────────────────────────────────────
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

    // ── Verify the factor belongs to this user and is unverified ────────────
    // Only unverified factors should be silently cleaned up. Verified factors
    // must go through the account-page disable flow so the email fires.
    const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) {
      return NextResponse.json({ error: "Failed to check MFA status." }, { status: 500 });
    }

    const factor = factors?.all.find((f) => f.id === factorId);
    if (!factor) {
      return NextResponse.json({ error: "Factor not found." }, { status: 404 });
    }

    if (factor.status !== "unverified") {
      return NextResponse.json(
        { error: "Only unverified factors can be silently cleaned up." },
        { status: 400 }
      );
    }

    // ── Delete via admin API — no user notification fired ───────────────────
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
      return NextResponse.json(
        { error: "Failed to remove factor. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
