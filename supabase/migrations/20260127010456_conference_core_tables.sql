-- =============================================
-- CONFERENCE OS - Core Tables for Conference Creation
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (if not already exists from KanDu)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  job_title TEXT,
  bio TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Conferences table
CREATE TABLE IF NOT EXISTS public.conferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  venue_name TEXT,
  venue_address TEXT,
  venue_lat DECIMAL(10, 8),
  venue_lng DECIMAL(11, 8),
  logo_url TEXT,
  banner_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  secondary_color TEXT,
  website_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_hybrid BOOLEAN DEFAULT false,
  max_attendees INT,
  registration_open BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conference members table
CREATE TABLE IF NOT EXISTS public.conference_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('attendee', 'speaker', 'sponsor', 'organizer', 'staff')) DEFAULT 'attendee',
  ticket_type TEXT,
  ticket_code TEXT UNIQUE,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES auth.users(id),
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conference_id, user_id)
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conference_members ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Conference policies
DROP POLICY IF EXISTS "Public conferences are viewable" ON conferences;
CREATE POLICY "Public conferences are viewable"
  ON conferences FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS "Members can view their conferences" ON conferences;
CREATE POLICY "Members can view their conferences"
  ON conferences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = conferences.id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Organizers can update conferences" ON conferences;
CREATE POLICY "Organizers can update conferences"
  ON conferences FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = conferences.id
      AND user_id = auth.uid()
      AND role = 'organizer'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create conferences" ON conferences;
CREATE POLICY "Authenticated users can create conferences"
  ON conferences FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Organizers can delete conferences" ON conferences;
CREATE POLICY "Organizers can delete conferences"
  ON conferences FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Conference members policies
DROP POLICY IF EXISTS "Members can view other members" ON conference_members;
CREATE POLICY "Members can view other members"
  ON conference_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members cm
      WHERE cm.conference_id = conference_members.conference_id
      AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view own memberships" ON conference_members;
CREATE POLICY "Users can view own memberships"
  ON conference_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Organizers can manage members" ON conference_members;
CREATE POLICY "Organizers can manage members"
  ON conference_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members cm
      WHERE cm.conference_id = conference_members.conference_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'organizer'
    )
  );

DROP POLICY IF EXISTS "Users can join as organizer for new conferences" ON conference_members;
CREATE POLICY "Users can join as organizer for new conferences"
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conference_members_user ON conference_members(user_id);
CREATE INDEX IF NOT EXISTS idx_conference_members_conference ON conference_members(conference_id);
CREATE INDEX IF NOT EXISTS idx_conferences_created_by ON conferences(created_by);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Conference OS core tables created successfully!';
END $$;
