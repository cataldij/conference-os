-- =============================================
-- FIX: RLS Policy Recursion Issue
-- The previous policies caused infinite recursion by self-referencing
-- =============================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Members can view other members" ON conference_members;
DROP POLICY IF EXISTS "Organizers can manage members" ON conference_members;
DROP POLICY IF EXISTS "Users can join as organizer for new conferences" ON conference_members;
DROP POLICY IF EXISTS "Users can view own memberships" ON conference_members;

-- Create a security definer function to check membership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_conference_member(conf_id UUID, usr_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conference_members
    WHERE conference_id = conf_id AND user_id = usr_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a security definer function to check if user is organizer
CREATE OR REPLACE FUNCTION public.is_conference_organizer(conf_id UUID, usr_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conference_members
    WHERE conference_id = conf_id
    AND user_id = usr_id
    AND role = 'organizer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Simple policy: Users can always view their own memberships
CREATE POLICY "Users can view own memberships"
  ON conference_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Members can view other members in conferences they belong to
CREATE POLICY "Members can view conference members"
  ON conference_members FOR SELECT
  TO authenticated
  USING (public.is_conference_member(conference_id, auth.uid()));

-- Conference creators can add themselves as organizer
CREATE POLICY "Creators can add self as organizer"
  ON conference_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conferences
      WHERE id = conference_id
      AND created_by = auth.uid()
    )
  );

-- Organizers can insert new members
CREATE POLICY "Organizers can add members"
  ON conference_members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_conference_organizer(conference_id, auth.uid())
  );

-- Organizers can update members
CREATE POLICY "Organizers can update members"
  ON conference_members FOR UPDATE
  TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- Organizers can delete members
CREATE POLICY "Organizers can delete members"
  ON conference_members FOR DELETE
  TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Fixed RLS recursion issue for conference_members!';
END $$;
