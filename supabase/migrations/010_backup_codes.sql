-- Migration: 010_backup_codes
-- Creates the backup_codes table used for MFA recovery.
-- Each user gets 8 bcrypt-hashed codes on TOTP enrollment.
-- Codes are single-use (used_at is set on consumption) and deleted
-- when the TOTP factor is unenrolled or when codes are regenerated.

CREATE TABLE backup_codes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  factor_id   TEXT        NOT NULL,
  code_hash   TEXT        NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for the most common query pattern: look up codes by user + factor
CREATE INDEX idx_backup_codes_user_factor
  ON backup_codes (user_id, factor_id);

-- Partial index to accelerate the unused-code count and lookup queries
CREATE INDEX idx_backup_codes_unused
  ON backup_codes (user_id, factor_id)
  WHERE used_at IS NULL;

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE backup_codes ENABLE ROW LEVEL SECURITY;

-- Users can read their own codes (needed for unused-code count in account page)
CREATE POLICY "Users can read own backup codes"
  ON backup_codes FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own codes (MFA enrollment and code regeneration)
CREATE POLICY "Users can insert own backup codes"
  ON backup_codes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own codes (marking a code as used via used_at)
CREATE POLICY "Users can update own backup codes"
  ON backup_codes FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own codes (cleanup on unenroll / regenerate)
CREATE POLICY "Users can delete own backup codes"
  ON backup_codes FOR DELETE
  USING (user_id = auth.uid());
