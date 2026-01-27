-- =============================================
-- CONFERENCE OS - Complete Database Schema
-- All remaining tables for full functionality
-- =============================================

-- =============================================
-- GLOBAL TABLES
-- =============================================

-- Global connections (persist across conferences)
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  met_at_conference_id UUID REFERENCES conferences(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, recipient_id)
);

-- =============================================
-- CONFERENCE STRUCTURE TABLES
-- =============================================

-- Tracks (session categories)
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#2563eb',
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rooms/Locations
CREATE TABLE IF NOT EXISTS public.rooms (
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
  livestream_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions
CREATE TABLE IF NOT EXISTS public.sessions (
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

-- =============================================
-- SPEAKER TABLES
-- =============================================

-- Speaker profiles (extended info for speakers at a conference)
CREATE TABLE IF NOT EXISTS public.speaker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  headshot_url TEXT,
  company TEXT,
  title TEXT,
  topics TEXT[],
  social_links JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conference_id, user_id)
);

-- Session speakers (many-to-many)
CREATE TABLE IF NOT EXISTS public.session_speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  speaker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'speaker',
  sort_order INT DEFAULT 0,
  UNIQUE(session_id, speaker_id)
);

-- =============================================
-- ATTENDEE ENGAGEMENT TABLES
-- =============================================

-- User saved sessions (personal agenda)
CREATE TABLE IF NOT EXISTS public.saved_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- Session attendance (check-in to sessions)
CREATE TABLE IF NOT EXISTS public.session_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  source TEXT DEFAULT 'manual',
  UNIQUE(session_id, user_id)
);

-- =============================================
-- MESSAGING TABLES
-- =============================================

-- Chat rooms
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT,
  room_type TEXT CHECK (room_type IN ('conference', 'session', 'direct', 'group')) DEFAULT 'conference',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat room members
CREATE TABLE IF NOT EXISTS public.chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(room_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Meeting requests (networking)
CREATE TABLE IF NOT EXISTS public.meeting_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  proposed_time TIMESTAMPTZ,
  proposed_location TEXT,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- =============================================
-- SPONSOR TABLES
-- =============================================

-- Sponsors
CREATE TABLE IF NOT EXISTS public.sponsors (
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
  contact_email TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sponsor leads (scanned badges)
CREATE TABLE IF NOT EXISTS public.sponsor_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE CASCADE,
  attendee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scanned_by UUID REFERENCES auth.users(id),
  notes TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(sponsor_id, attendee_id)
);

-- =============================================
-- LIVE INTERACTION TABLES
-- =============================================

-- Polls
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  show_results BOOLEAN DEFAULT false,
  allow_multiple BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Poll responses
CREATE TABLE IF NOT EXISTS public.poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(poll_id, user_id, option_id)
);

-- Q&A questions
CREATE TABLE IF NOT EXISTS public.qa_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  upvotes INT DEFAULT 0,
  is_answered BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Q&A upvotes
CREATE TABLE IF NOT EXISTS public.qa_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES qa_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- =============================================
-- NOTIFICATION TABLES
-- =============================================

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  target_role TEXT,
  send_push BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  notification_type TEXT,
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- TICKETING & PAYMENTS
-- =============================================

-- Ticket types
CREATE TABLE IF NOT EXISTS public.ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  max_quantity INT,
  sold_count INT DEFAULT 0,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  benefits JSONB DEFAULT '[]',
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  ticket_type_id UUID REFERENCES ticket_types(id),
  quantity INT DEFAULT 1,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- =============================================
-- LOCATION & BEACONS
-- =============================================

-- Beacons
CREATE TABLE IF NOT EXISTS public.beacons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  uuid TEXT NOT NULL,
  major INT NOT NULL,
  minor INT NOT NULL,
  name TEXT,
  location_type TEXT,
  room_id UUID REFERENCES rooms(id),
  sponsor_id UUID REFERENCES sponsors(id),
  map_x DECIMAL,
  map_y DECIMAL,
  floor TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ANALYTICS
-- =============================================

-- Analytics events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_sessions_conference ON sessions(conference_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_track ON sessions(track_id);
CREATE INDEX IF NOT EXISTS idx_sessions_room ON sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_tracks_conference ON tracks(conference_id);
CREATE INDEX IF NOT EXISTS idx_rooms_conference ON rooms(conference_id);
CREATE INDEX IF NOT EXISTS idx_speaker_profiles_conference ON speaker_profiles(conference_id);
CREATE INDEX IF NOT EXISTS idx_speaker_profiles_user ON speaker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_session_speakers_session ON session_speakers(session_id);
CREATE INDEX IF NOT EXISTS idx_saved_sessions_user ON saved_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_sessions_session ON saved_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_conference ON chat_rooms(conference_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_conference ON sponsors(conference_id);
CREATE INDEX IF NOT EXISTS idx_polls_session ON polls(session_id);
CREATE INDEX IF NOT EXISTS idx_polls_conference ON polls(conference_id);
CREATE INDEX IF NOT EXISTS idx_qa_questions_session ON qa_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_announcements_conference ON announcements(conference_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_conference ON ticket_types(conference_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_conference ON orders(conference_id);
CREATE INDEX IF NOT EXISTS idx_analytics_conference ON analytics_events(conference_id, event_type);
CREATE INDEX IF NOT EXISTS idx_beacons_conference ON beacons(conference_id);
CREATE INDEX IF NOT EXISTS idx_connections_users ON connections(requester_id, recipient_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Connections: Users can view their own connections
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create connection requests" ON connections
  FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update own connections" ON connections
  FOR UPDATE TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- Tracks: Conference members can view, organizers can manage
CREATE POLICY "Members can view tracks" ON tracks
  FOR SELECT TO authenticated
  USING (public.is_conference_member(conference_id, auth.uid()));

CREATE POLICY "Organizers can manage tracks" ON tracks
  FOR ALL TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- Rooms: Conference members can view, organizers can manage
CREATE POLICY "Members can view rooms" ON rooms
  FOR SELECT TO authenticated
  USING (public.is_conference_member(conference_id, auth.uid()));

CREATE POLICY "Organizers can manage rooms" ON rooms
  FOR ALL TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- Sessions: Conference members can view, organizers can manage
CREATE POLICY "Members can view sessions" ON sessions
  FOR SELECT TO authenticated
  USING (public.is_conference_member(conference_id, auth.uid()));

CREATE POLICY "Organizers can manage sessions" ON sessions
  FOR ALL TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- Speaker profiles: Everyone can view, user can update own
CREATE POLICY "Anyone can view speaker profiles" ON speaker_profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own speaker profile" ON speaker_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organizers can manage speaker profiles" ON speaker_profiles
  FOR ALL TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- Session speakers: Members can view
CREATE POLICY "Members can view session speakers" ON session_speakers
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.id = session_id
    AND public.is_conference_member(s.conference_id, auth.uid())
  ));

CREATE POLICY "Organizers can manage session speakers" ON session_speakers
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.id = session_id
    AND public.is_conference_organizer(s.conference_id, auth.uid())
  ));

-- Saved sessions: Users manage their own
CREATE POLICY "Users can manage own saved sessions" ON saved_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Session attendance: Users can view own, organizers can view all
CREATE POLICY "Users can view own attendance" ON session_attendance
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can check in" ON session_attendance
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organizers can view all attendance" ON session_attendance
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.id = session_id
    AND public.is_conference_organizer(s.conference_id, auth.uid())
  ));

-- Chat rooms: Members can view
CREATE POLICY "Members can view chat rooms" ON chat_rooms
  FOR SELECT TO authenticated
  USING (public.is_conference_member(conference_id, auth.uid()));

CREATE POLICY "Organizers can manage chat rooms" ON chat_rooms
  FOR ALL TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- Chat room members
CREATE POLICY "Users can view room members" ON chat_room_members
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM chat_room_members crm
    WHERE crm.room_id = chat_room_members.room_id
    AND crm.user_id = auth.uid()
  ));

CREATE POLICY "Users can join rooms" ON chat_room_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Messages: Room members can view and send
CREATE POLICY "Room members can view messages" ON messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE room_id = messages.room_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Room members can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_room_members
      WHERE room_id = messages.room_id
      AND user_id = auth.uid()
    )
  );

-- Meeting requests
CREATE POLICY "Users can view own meeting requests" ON meeting_requests
  FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create meeting requests" ON meeting_requests
  FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update own meeting requests" ON meeting_requests
  FOR UPDATE TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- Sponsors: Members can view, organizers can manage
CREATE POLICY "Members can view sponsors" ON sponsors
  FOR SELECT TO authenticated
  USING (public.is_conference_member(conference_id, auth.uid()));

CREATE POLICY "Organizers can manage sponsors" ON sponsors
  FOR ALL TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- Sponsor leads: Sponsor reps can view their leads
CREATE POLICY "Sponsor reps can view leads" ON sponsor_leads
  FOR SELECT TO authenticated
  USING (scanned_by = auth.uid() OR EXISTS (
    SELECT 1 FROM sponsors s
    WHERE s.id = sponsor_id
    AND public.is_conference_organizer(s.conference_id, auth.uid())
  ));

CREATE POLICY "Users can capture leads" ON sponsor_leads
  FOR INSERT TO authenticated
  WITH CHECK (scanned_by = auth.uid());

-- Polls: Members can view and vote
CREATE POLICY "Members can view polls" ON polls
  FOR SELECT TO authenticated
  USING (public.is_conference_member(conference_id, auth.uid()));

CREATE POLICY "Organizers can manage polls" ON polls
  FOR ALL TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

CREATE POLICY "Users can respond to polls" ON poll_responses
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own responses" ON poll_responses
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Q&A: Members can view and ask
CREATE POLICY "Members can view questions" ON qa_questions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.id = session_id
    AND public.is_conference_member(s.conference_id, auth.uid())
  ));

CREATE POLICY "Members can ask questions" ON qa_questions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can upvote" ON qa_upvotes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view upvotes" ON qa_upvotes
  FOR SELECT TO authenticated
  USING (true);

-- Announcements: Members can view
CREATE POLICY "Members can view announcements" ON announcements
  FOR SELECT TO authenticated
  USING (public.is_conference_member(conference_id, auth.uid()));

CREATE POLICY "Organizers can manage announcements" ON announcements
  FOR ALL TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- User notifications: Users view own
CREATE POLICY "Users can view own notifications" ON user_notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON user_notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Ticket types: Public for viewing
CREATE POLICY "Anyone can view active ticket types" ON ticket_types
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Organizers can manage ticket types" ON ticket_types
  FOR ALL TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- Orders: Users view own
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organizers can view conference orders" ON orders
  FOR SELECT TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- Beacons: Members can view
CREATE POLICY "Members can view beacons" ON beacons
  FOR SELECT TO authenticated
  USING (public.is_conference_member(conference_id, auth.uid()));

CREATE POLICY "Organizers can manage beacons" ON beacons
  FOR ALL TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

-- Analytics: Organizers only
CREATE POLICY "Organizers can view analytics" ON analytics_events
  FOR SELECT TO authenticated
  USING (public.is_conference_organizer(conference_id, auth.uid()));

CREATE POLICY "System can insert analytics" ON analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get session count for a conference
CREATE OR REPLACE FUNCTION public.get_session_count(conf_id UUID)
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM sessions WHERE conference_id = conf_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to get attendee count for a conference
CREATE OR REPLACE FUNCTION public.get_attendee_count(conf_id UUID)
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM conference_members WHERE conference_id = conf_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================
-- SUCCESS
-- =============================================

DO $$
BEGIN
  RAISE NOTICE 'Complete Conference OS schema created successfully!';
  RAISE NOTICE 'Tables created: connections, tracks, rooms, sessions, speaker_profiles,';
  RAISE NOTICE 'session_speakers, saved_sessions, session_attendance, chat_rooms,';
  RAISE NOTICE 'chat_room_members, messages, meeting_requests, sponsors, sponsor_leads,';
  RAISE NOTICE 'polls, poll_responses, qa_questions, qa_upvotes, announcements,';
  RAISE NOTICE 'user_notifications, ticket_types, orders, beacons, analytics_events';
END $$;
