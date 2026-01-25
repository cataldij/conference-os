-- =============================================
-- CONFERENCE OS - Initial Database Schema
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- GLOBAL TABLES (User Identity Layer)
-- =============================================

-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  job_title TEXT,
  bio TEXT,
  interests TEXT[],
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  networking_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  reputation_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Global connections (persist across conferences)
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  met_at_conference_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

-- =============================================
-- CONFERENCE/TENANT TABLES
-- =============================================

-- Conferences (tenants/channels)
CREATE TABLE public.conferences (
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
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key for connections.met_at_conference_id after conferences table exists
ALTER TABLE public.connections
  ADD CONSTRAINT fk_connections_conference
  FOREIGN KEY (met_at_conference_id)
  REFERENCES conferences(id) ON DELETE SET NULL;

-- Conference memberships (who belongs to which conference)
CREATE TABLE public.conference_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('attendee', 'speaker', 'sponsor', 'organizer', 'staff')) DEFAULT 'attendee',
  ticket_type TEXT,
  ticket_code TEXT UNIQUE,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES profiles(id),
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conference_id, user_id)
);

-- Tracks (session categories)
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  description TEXT,
  sort_order INT DEFAULT 0
);

-- Rooms/Locations
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  capacity INT,
  floor TEXT,
  building TEXT,
  map_x DECIMAL,
  map_y DECIMAL,
  has_livestream BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);

-- Sessions
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT CHECK (session_type IN ('keynote', 'talk', 'panel', 'workshop', 'networking', 'break', 'other')) DEFAULT 'talk',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_attendees INT,
  requires_registration BOOLEAN DEFAULT false,
  livestream_url TEXT,
  replay_url TEXT,
  slides_url TEXT,
  transcript TEXT,
  summary TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Session speakers (many-to-many)
CREATE TABLE public.session_speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  speaker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'speaker',
  UNIQUE(session_id, speaker_id)
);

-- Speaker profiles (extended info for speakers at a conference)
CREATE TABLE public.speaker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  headshot_url TEXT,
  company TEXT,
  title TEXT,
  topics TEXT[],
  social_links JSONB,
  is_featured BOOLEAN DEFAULT false,
  UNIQUE(conference_id, user_id)
);

-- User saved sessions (personal agenda)
CREATE TABLE public.saved_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- Session attendance (check-in to sessions)
CREATE TABLE public.session_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'manual',
  UNIQUE(session_id, user_id)
);

-- =============================================
-- NETWORKING & MESSAGING
-- =============================================

-- Chat rooms (per conference or session)
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT,
  room_type TEXT CHECK (room_type IN ('conference', 'session', 'direct', 'group')) DEFAULT 'conference',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat room members
CREATE TABLE public.chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(room_id, user_id)
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Meeting requests (networking)
CREATE TABLE public.meeting_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  proposed_time TIMESTAMPTZ,
  proposed_location TEXT,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- =============================================
-- SPONSORS & EXHIBITORS
-- =============================================

CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze', 'exhibitor')) DEFAULT 'exhibitor',
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  booth_number TEXT,
  booth_location_x DECIMAL,
  booth_location_y DECIMAL,
  lead_capture_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sponsor leads (scanned badges)
CREATE TABLE public.sponsor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE,
  attendee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scanned_by UUID REFERENCES profiles(id),
  notes TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(sponsor_id, attendee_id)
);

-- =============================================
-- LIVE FEATURES
-- =============================================

-- Polls
CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  show_results BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Poll responses
CREATE TABLE public.poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Q&A questions
CREATE TABLE public.qa_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  upvotes INT DEFAULT 0,
  is_answered BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Q&A upvotes
CREATE TABLE public.qa_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES qa_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- =============================================
-- NOTIFICATIONS & ANNOUNCEMENTS
-- =============================================

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  target_role TEXT,
  send_push BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  notification_type TEXT,
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Push tokens
CREATE TABLE public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, token)
);

-- =============================================
-- LOCATION & BEACONS
-- =============================================

CREATE TABLE public.beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  uuid TEXT NOT NULL,
  major INT NOT NULL,
  minor INT NOT NULL,
  name TEXT,
  location_type TEXT,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL,
  map_x DECIMAL,
  map_y DECIMAL,
  floor TEXT
);

-- Venue maps
CREATE TABLE public.venue_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  floor TEXT,
  image_url TEXT NOT NULL,
  width INT,
  height INT,
  sort_order INT DEFAULT 0
);

-- =============================================
-- ANALYTICS & TELEMETRY
-- =============================================

CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PAYMENTS
-- =============================================

CREATE TABLE public.ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',
  max_quantity INT,
  sold_count INT DEFAULT 0,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  benefits JSONB,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  ticket_type_id UUID REFERENCES ticket_types(id),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_sessions_conference ON sessions(conference_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_sessions_track ON sessions(track_id);
CREATE INDEX idx_sessions_room ON sessions(room_id);
CREATE INDEX idx_conference_members_user ON conference_members(user_id);
CREATE INDEX idx_conference_members_conference ON conference_members(conference_id);
CREATE INDEX idx_conference_members_ticket ON conference_members(ticket_code);
CREATE INDEX idx_messages_room ON messages(room_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_recipient ON connections(recipient_id);
CREATE INDEX idx_saved_sessions_user ON saved_sessions(user_id);
CREATE INDEX idx_saved_sessions_session ON saved_sessions(session_id);
CREATE INDEX idx_analytics_conference ON analytics_events(conference_id, event_type);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_beacons_conference ON beacons(conference_id);
CREATE INDEX idx_beacons_uuid ON beacons(uuid, major, minor);
CREATE INDEX idx_announcements_conference ON announcements(conference_id);
CREATE INDEX idx_user_notifications_user ON user_notifications(user_id, is_read);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conferences_updated_at
  BEFORE UPDATE ON conferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
  BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment Q&A upvotes
CREATE OR REPLACE FUNCTION public.increment_qa_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE qa_questions
  SET upvotes = upvotes + 1
  WHERE id = NEW.question_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_qa_upvote
  AFTER INSERT ON qa_upvotes
  FOR EACH ROW EXECUTE FUNCTION increment_qa_upvotes();

-- Function to decrement Q&A upvotes
CREATE OR REPLACE FUNCTION public.decrement_qa_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE qa_questions
  SET upvotes = GREATEST(0, upvotes - 1)
  WHERE id = OLD.question_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_qa_upvote_delete
  AFTER DELETE ON qa_upvotes
  FOR EACH ROW EXECUTE FUNCTION decrement_qa_upvotes();
