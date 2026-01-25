-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conference_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_profiles ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES
-- =============================================

-- Everyone can view profiles (for networking)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================
-- CONNECTIONS
-- =============================================

-- Users can view connections they're part of
CREATE POLICY "Users can view own connections"
  ON connections FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- Users can create connection requests
CREATE POLICY "Users can create connection requests"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

-- Users can update connections they received (accept/decline)
CREATE POLICY "Users can respond to connection requests"
  ON connections FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Users can delete their own connection requests
CREATE POLICY "Users can delete own connections"
  ON connections FOR DELETE
  TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

-- =============================================
-- CONFERENCES
-- =============================================

-- Public conferences are viewable by everyone
CREATE POLICY "Public conferences are viewable"
  ON conferences FOR SELECT
  USING (is_public = true);

-- Authenticated users can view conferences they're members of
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

-- Organizers can update their conferences
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

-- Authenticated users can create conferences
CREATE POLICY "Authenticated users can create conferences"
  ON conferences FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- =============================================
-- CONFERENCE MEMBERS
-- =============================================

-- Users can view members of conferences they belong to
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

-- Users can join public conferences
CREATE POLICY "Users can join public conferences"
  ON conference_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conferences
      WHERE id = conference_id
      AND is_public = true
      AND registration_open = true
    )
  );

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
  ON conference_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Organizers can manage members
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

-- =============================================
-- TRACKS, ROOMS, SESSIONS
-- =============================================

-- Conference content is viewable by members
CREATE POLICY "Members can view tracks"
  ON tracks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = tracks.conference_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can view rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = rooms.conference_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can view sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = sessions.conference_id
      AND user_id = auth.uid()
    )
  );

-- Organizers can manage content
CREATE POLICY "Organizers can manage tracks"
  ON tracks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = tracks.conference_id
      AND user_id = auth.uid()
      AND role = 'organizer'
    )
  );

CREATE POLICY "Organizers can manage rooms"
  ON rooms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = rooms.conference_id
      AND user_id = auth.uid()
      AND role = 'organizer'
    )
  );

CREATE POLICY "Organizers can manage sessions"
  ON sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = sessions.conference_id
      AND user_id = auth.uid()
      AND role = 'organizer'
    )
  );

-- =============================================
-- SAVED SESSIONS
-- =============================================

CREATE POLICY "Users can manage own saved sessions"
  ON saved_sessions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- CHAT & MESSAGES
-- =============================================

-- Users can view rooms they're members of
CREATE POLICY "Room members can view rooms"
  ON chat_rooms FOR SELECT
  TO authenticated
  USING (
    is_public = true
    OR EXISTS (
      SELECT 1 FROM chat_room_members
      WHERE room_id = chat_rooms.id
      AND user_id = auth.uid()
    )
  );

-- Users can view their room memberships
CREATE POLICY "Users can view own room memberships"
  ON chat_room_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Room members can read messages
CREATE POLICY "Room members can read messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_room_members
      WHERE room_id = messages.room_id
      AND user_id = auth.uid()
    )
  );

-- Room members can send messages
CREATE POLICY "Room members can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_room_members
      WHERE room_id = messages.room_id
      AND user_id = auth.uid()
    )
  );

-- =============================================
-- MEETING REQUESTS
-- =============================================

CREATE POLICY "Users can view own meeting requests"
  ON meeting_requests FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can create meeting requests"
  ON meeting_requests FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can respond to meeting requests"
  ON meeting_requests FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid());

-- =============================================
-- SPONSORS
-- =============================================

CREATE POLICY "Members can view sponsors"
  ON sponsors FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = sponsors.conference_id
      AND user_id = auth.uid()
    )
  );

-- =============================================
-- POLLS & Q&A
-- =============================================

CREATE POLICY "Members can view polls"
  ON polls FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN conference_members cm ON cm.conference_id = s.conference_id
      WHERE s.id = polls.session_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can respond to polls"
  ON poll_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can view Q&A"
  ON qa_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN conference_members cm ON cm.conference_id = s.conference_id
      WHERE s.id = qa_questions.session_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can ask questions"
  ON qa_questions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can upvote questions"
  ON qa_upvotes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- NOTIFICATIONS
-- =============================================

CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own push tokens"
  ON push_tokens FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- ANNOUNCEMENTS
-- =============================================

CREATE POLICY "Members can view announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = announcements.conference_id
      AND user_id = auth.uid()
    )
  );

-- =============================================
-- ANALYTICS
-- =============================================

-- Users can insert their own analytics
CREATE POLICY "Users can insert own analytics"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Organizers can view analytics
CREATE POLICY "Organizers can view analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = analytics_events.conference_id
      AND user_id = auth.uid()
      AND role = 'organizer'
    )
  );

-- =============================================
-- ORDERS & TICKETS
-- =============================================

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can view ticket types"
  ON ticket_types FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conferences
      WHERE id = ticket_types.conference_id
      AND is_public = true
    )
  );

-- =============================================
-- BEACONS & MAPS
-- =============================================

CREATE POLICY "Members can view beacons"
  ON beacons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = beacons.conference_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can view venue maps"
  ON venue_maps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conference_members
      WHERE conference_id = venue_maps.conference_id
      AND user_id = auth.uid()
    )
  );
