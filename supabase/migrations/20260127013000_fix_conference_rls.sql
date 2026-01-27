-- =============================================
-- FIX: Conference RLS policies
-- The "Members can view their conferences" policy fails because
-- it queries conference_members which has RLS that blocks the check
-- =============================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Members can view their conferences" ON conferences;

-- Use the security definer function we already created to check membership
-- This bypasses RLS on conference_members during the check

CREATE POLICY "Members can view their conferences"
  ON conferences FOR SELECT
  TO authenticated
  USING (
    public.is_conference_member(id, auth.uid())
  );

-- Also ensure the creator can always see their conference
DROP POLICY IF EXISTS "Creators can view their conferences" ON conferences;
CREATE POLICY "Creators can view their conferences"
  ON conferences FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Fixed conference RLS policies!';
END $$;
