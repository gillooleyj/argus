-- Migration: 011_mfa_rate_limits
-- Creates a persistent rate-limit store for backup code verification.
-- Replaces the ephemeral in-memory Map in the route handler, which did not
-- survive server restarts or work across multiple serverless instances.

CREATE TABLE mfa_rate_limits (
  user_id       UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_count INTEGER     NOT NULL DEFAULT 0,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No direct user access — table is only mutated via the SECURITY DEFINER function below.
ALTER TABLE mfa_rate_limits ENABLE ROW LEVEL SECURITY;

-- ── RPC: atomic increment + window reset ─────────────────────────────────────
-- Returns the updated attempt_count for the current window so the route handler
-- can compare it against the limit constant (currently 5).
-- SECURITY DEFINER lets the function write to the table without granting direct
-- user access. The auth.uid() guard prevents a caller from incrementing another
-- user's counter (e.g. via a direct PostgREST RPC call).

CREATE OR REPLACE FUNCTION check_and_increment_backup_code_rate_limit(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Callers may only increment their own counter
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO mfa_rate_limits (user_id, attempt_count, window_start)
  VALUES (p_user_id, 1, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    attempt_count = CASE
      WHEN mfa_rate_limits.window_start < NOW() - INTERVAL '15 minutes'
      THEN 1
      ELSE mfa_rate_limits.attempt_count + 1
    END,
    window_start = CASE
      WHEN mfa_rate_limits.window_start < NOW() - INTERVAL '15 minutes'
      THEN NOW()
      ELSE mfa_rate_limits.window_start
    END
  RETURNING attempt_count INTO v_count;

  RETURN v_count;
END;
$$;
