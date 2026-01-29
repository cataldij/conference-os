-- =============================================
-- FIX: Conference creation RLS issue
-- The problem is that inserting into conferences triggers
-- a check that causes recursion in conference_members policies
-- =============================================

-- First, drop ALL existing policies on conference_members to start fresh
DROP POLICY IF EXISTS "Users can view own memberships" ON conference_members;
DROP POLICY IF EXISTS "Users see own memberships" ON conference_members;
DROP POLICY IF EXISTS "Members can view conference members" ON conference_members;
DROP POLICY IF EXISTS "Members see other members" ON conference_members;
DROP POLICY IF EXISTS "Creators can add self as organizer" ON conference_members;
DROP POLICY IF EXISTS "Add self as member" ON conference_members;
DROP POLICY IF EXISTS "Organizers can add members" ON conference_members;
DROP POLICY IF EXISTS "Organizers add others" ON conference_members;
DROP POLICY IF EXISTS "Organizers can update members" ON conference_members;
DROP POLICY IF EXISTS "Organizers update members" ON conference_members;
DROP POLICY IF EXISTS "Organizers can delete members" ON conference_members;
DROP POLICY IF EXISTS "Organizers delete members" ON conference_members;
DROP POLICY IF EXISTS "Members can view other members" ON conference_members;
DROP POLICY IF EXISTS "Users can join as organizer for new conferences" ON conference_members;

-- Also drop any problematic policies on conferences
DROP POLICY IF EXISTS "Members can view their conferences" ON conferences;
DROP POLICY IF EXISTS "Members view conferences" ON conferences;

-- Recreate the helper function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.is_conference_member(conf_id UUID, usr_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conference_members
    WHERE conference_id = conf_id AND user_id = usr_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_conference_organizer(conf_id UUID, usr_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conference_members
    WHERE conference_id = conf_id
    AND user_id = usr_id
    AND role = 'organizer'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_conference_creator(conf_id UUID, usr_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conferences
    WHERE id = conf_id AND created_by = usr_id
  );
$$;

-- =============================================
-- CONFERENCE_MEMBERS POLICIES (simplified, no recursion)
-- =============================================

-- SELECT: Users can always see their own memberships
CREATE POLICY "Users see own memberships"
  ON conference_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- SELECT: Members can see other members (uses SECURITY DEFINER function)
CREATE POLICY "Members see other members"
  ON conference_members FOR SELECT
  TO authenticated
  USING (public.is_conference_member(conference_id, auth.uid()));

-- INSERT: Anyone authenticated can insert if they're adding themselves
-- AND (they're the conference creator OR an existing organizer)
CREATE POLICY "Add self as member"
  ON conference_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      public.is_conference_creator(conference_id, auth.uid())
      OR public.is_conference_organizer(conference_id, auth.uid())
    )
  );

-- INSERT: Organizers can add other users
CREATE POLICY "Organizers add others"
  ON conference_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id != auth.uid()
    AND public.is_conference_organizer(conference_id, auth.uid())
  );

-- UPDATE: Organizers can update members
CREATE POLICY "Organizers update members"
  ON conference_members FOR UPDATE
  TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- DELETE: Organizers can delete members
CREATE POLICY "Organizers delete members"
  ON conference_members FOR DELETE
  TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- =============================================
-- CONFERENCES POLICIES (simplified)
-- =============================================

-- SELECT: Public conferences visible to all
-- (Keep existing policy if it works)

-- SELECT: Members can view their conferences (uses SECURITY DEFINER)
CREATE POLICY "Members view conferences"
  ON conferences FOR SELECT
  TO authenticated
  USING (public.is_conference_member(id, auth.uid()));

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Fixed conference creation RLS policies!';
END $$;
