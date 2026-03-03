-- Migration: 012_mfa_audit_log
-- Creates a persistent audit log for security-relevant MFA events.
-- Events are written by the client (browser session) or server route handlers.
-- Rows are immutable — no UPDATE or DELETE policies are granted.

CREATE TABLE mfa_audit_log (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event       TEXT        NOT NULL,
  -- Known events: enrollment_complete | totp_verify_fail |
  --               backup_code_used    | backup_codes_regenerated | mfa_disabled
  factor_id   TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mfa_audit_log_user
  ON mfa_audit_log (user_id, created_at DESC);

ALTER TABLE mfa_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can write their own audit events (client-side pages fire-and-forget)
CREATE POLICY "Users can insert own audit events"
  ON mfa_audit_log FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can read their own audit history (available for future display)
CREATE POLICY "Users can read own audit log"
  ON mfa_audit_log FOR SELECT
  USING (user_id = auth.uid());

-- No UPDATE or DELETE policies — audit rows are append-only
