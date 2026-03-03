-- Migration: 013_certifications_cascade_delete
-- The certifications table was created with the default NO ACTION delete rule
-- on its user_id FK to auth.users. This prevents auth.admin.deleteUser() from
-- succeeding because Postgres blocks the deletion when a child row exists.
-- Fix: drop the existing FK and re-add it with ON DELETE CASCADE.

DO $$
DECLARE
  v_constraint TEXT;
BEGIN
  -- Find the actual FK constraint name (avoids hardcoding)
  SELECT constraint_name
    INTO v_constraint
    FROM information_schema.table_constraints
   WHERE table_schema = 'public'
     AND table_name   = 'certifications'
     AND constraint_type = 'FOREIGN KEY';

  IF v_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE certifications DROP CONSTRAINT %I', v_constraint);
  END IF;
END;
$$;

ALTER TABLE certifications
  ADD CONSTRAINT certifications_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
