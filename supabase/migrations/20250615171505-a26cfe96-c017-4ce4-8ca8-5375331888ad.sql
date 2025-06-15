
-- Step 1: Add 'creator' to the app_role enum (do this alone)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'creator'
      AND enumtypid = 'app_role'::regtype
  ) THEN
    ALTER TYPE app_role ADD VALUE 'creator';
  END IF;
END
$$;
