-- =============================================
-- SEED DATA FOR CONFERENCE OS
-- =============================================

-- Create demo users (passwords are 'password123')
-- Note: In production, use proper password hashing
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'organizer@conferenceoscmd.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'speaker@demo.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'attendee1@demo.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'attendee2@demo.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('55555555-5555-5555-5555-555555555555', 'attendee3@demo.com', crypt('password123', gen_salt('bf')), now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create profiles (these will be auto-created by trigger, but we can update them)
UPDATE profiles SET
  full_name = 'Conference Organizer',
  company = 'Tech Events Inc',
  job_title = 'Event Director',
  bio = 'Passionate about bringing people together through amazing conferences',
  interests = ARRAY['Event Planning', 'Technology', 'Networking']
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE profiles SET
  full_name = 'Dr. Sarah Chen',
  company = 'AI Research Lab',
  job_title = 'Chief AI Officer',
  bio = 'Leading AI researcher with 15+ years of experience in machine learning and neural networks',
  interests = ARRAY['AI', 'Machine Learning', 'Research']
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE profiles SET
  full_name = 'Alex Johnson',
  company = 'Startup Inc',
  job_title = 'Product Manager',
  bio = 'Building products that users love. Passionate about UX and growth.',
  interests = ARRAY['Product', 'Growth', 'Analytics']
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE profiles SET
  full_name = 'Maria Garcia',
  company = 'Design Studio',
  job_title = 'UX Designer',
  bio = 'Creating beautiful and accessible user experiences',
  interests = ARRAY['Design', 'Accessibility', 'User Research']
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE profiles SET
  full_name = 'James Wilson',
  company = 'BigTech Corp',
  job_title = 'Software Engineer',
  bio = 'Full-stack developer specializing in React and Node.js',
  interests = ARRAY['React', 'TypeScript', 'Performance']
WHERE id = '55555555-5555-5555-5555-555555555555';

-- Create demo conferences
INSERT INTO conferences (id, slug, name, tagline, description, start_date, end_date, venue_name, venue_address, primary_color, is_public, is_hybrid, max_attendees, created_by)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'tech-summit-2024',
    'Tech Summit 2024',
    'The Future of Technology',
    'Join us for three days of inspiring talks, hands-on workshops, and networking with industry leaders. Tech Summit 2024 brings together innovators, developers, and entrepreneurs to explore the latest trends in technology.',
    '2024-06-15',
    '2024-06-17',
    'San Francisco Convention Center',
    '747 Howard St, San Francisco, CA 94103',
    '#2563eb',
    true,
    true,
    5000,
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'ai-conference-2024',
    'AI Conference 2024',
    'Advancing Artificial Intelligence',
    'Explore the cutting edge of artificial intelligence with leading researchers and practitioners. Learn about the latest breakthroughs in machine learning, natural language processing, and computer vision.',
    '2024-09-20',
    '2024-09-22',
    'Boston Convention Center',
    '415 Summer St, Boston, MA 02210',
    '#8B5CF6',
    true,
    true,
    3000,
    '11111111-1111-1111-1111-111111111111'
  )
ON CONFLICT (id) DO NOTHING;

-- Add conference memberships
INSERT INTO conference_members (conference_id, user_id, role, ticket_type, ticket_code, checked_in)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'organizer', 'admin', 'ORGANIZER-001', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'speaker', 'speaker', 'SPEAKER-001', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'attendee', 'general', 'TICKET-001', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'attendee', 'vip', 'TICKET-002', false),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'attendee', 'general', 'TICKET-003', false)
ON CONFLICT (conference_id, user_id) DO NOTHING;

-- Create tracks
INSERT INTO tracks (id, conference_id, name, color, sort_order)
VALUES
  ('track-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Keynote', '#2563EB', 0),
  ('track-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'AI & Machine Learning', '#8B5CF6', 1),
  ('track-003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Web Development', '#10B981', 2),
  ('track-004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Design & UX', '#F59E0B', 3),
  ('track-005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cloud & Infrastructure', '#EF4444', 4)
ON CONFLICT (id) DO NOTHING;

-- Create rooms
INSERT INTO rooms (id, conference_id, name, capacity, floor, has_livestream, sort_order)
VALUES
  ('room-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Main Hall', 2000, '1st Floor', true, 0),
  ('room-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Room 101', 300, '1st Floor', true, 1),
  ('room-003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Room 102', 300, '1st Floor', true, 2),
  ('room-004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Room 201', 200, '2nd Floor', false, 3),
  ('room-005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Workshop A', 100, '2nd Floor', false, 4)
ON CONFLICT (id) DO NOTHING;

-- Create sessions for Day 1 (June 15, 2024)
INSERT INTO sessions (id, conference_id, track_id, room_id, title, description, session_type, start_time, end_time, is_featured)
VALUES
  (
    'session-001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'track-001',
    'room-001',
    'Opening Keynote: The Future is Now',
    'Join our CEO as she unveils the vision for the next decade of technology innovation. This inspiring keynote will set the stage for three days of groundbreaking content.',
    'keynote',
    '2024-06-15 09:00:00-07',
    '2024-06-15 10:00:00-07',
    true
  ),
  (
    'session-002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'track-002',
    'room-002',
    'Building Scalable ML Models in Production',
    'Learn best practices for deploying and scaling machine learning models in production environments. We''ll cover monitoring, versioning, and continuous integration for ML pipelines.',
    'talk',
    '2024-06-15 10:30:00-07',
    '2024-06-15 11:30:00-07',
    false
  ),
  (
    'session-003',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'track-003',
    'room-003',
    'Modern React Patterns',
    'Explore advanced React patterns including hooks, context, suspense, and concurrent features. Real-world examples and performance optimization techniques included.',
    'talk',
    '2024-06-15 10:30:00-07',
    '2024-06-15 11:30:00-07',
    false
  ),
  (
    'session-004',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'track-004',
    'room-004',
    'Design Systems at Scale',
    'How to build and maintain design systems that work across multiple teams and products. Learn from real case studies and avoid common pitfalls.',
    'talk',
    '2024-06-15 11:45:00-07',
    '2024-06-15 12:45:00-07',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- Link speakers to sessions
INSERT INTO session_speakers (session_id, speaker_id, role)
VALUES
  ('session-001', '22222222-2222-2222-2222-222222222222', 'speaker'),
  ('session-002', '22222222-2222-2222-2222-222222222222', 'speaker')
ON CONFLICT (session_id, speaker_id) DO NOTHING;

-- Create speaker profiles
INSERT INTO speaker_profiles (conference_id, user_id, bio, company, title, topics, is_featured)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Leading AI researcher with 15+ years of experience in machine learning and neural networks. Published over 50 papers and holds multiple patents in AI.',
    'AI Research Lab',
    'Chief AI Officer',
    ARRAY['AI', 'Machine Learning', 'Neural Networks', 'Research'],
    true
  )
ON CONFLICT (conference_id, user_id) DO NOTHING;

-- Create sponsors
INSERT INTO sponsors (conference_id, name, tier, description, website_url, booth_number, lead_capture_enabled)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'TechCorp International',
    'platinum',
    'Leading provider of cloud infrastructure and developer tools',
    'https://techcorp.example.com',
    'A1',
    true
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'AI Solutions Inc',
    'gold',
    'Enterprise AI and machine learning platform',
    'https://aisolutions.example.com',
    'B5',
    true
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'DevTools Pro',
    'silver',
    'Professional development tools for modern teams',
    'https://devtools.example.com',
    'C12',
    true
  )
ON CONFLICT DO NOTHING;

-- Create some saved sessions
INSERT INTO saved_sessions (user_id, session_id, notes)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'session-001', 'Must attend! Looking forward to the keynote'),
  ('33333333-3333-3333-3333-333333333333', 'session-002', 'Interested in ML deployment strategies'),
  ('44444444-4444-4444-4444-444444444444', 'session-001', NULL),
  ('55555555-5555-5555-5555-555555555555', 'session-003', 'Want to learn more about React patterns')
ON CONFLICT (user_id, session_id) DO NOTHING;

-- Create conference chat room
INSERT INTO chat_rooms (id, conference_id, name, room_type, is_public)
VALUES
  ('chat-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tech Summit 2024 General', 'conference', true),
  ('chat-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'AI & ML Track', 'group', true)
ON CONFLICT (id) DO NOTHING;

-- Add members to chat rooms
INSERT INTO chat_room_members (room_id, user_id)
VALUES
  ('chat-001', '33333333-3333-3333-3333-333333333333'),
  ('chat-001', '44444444-4444-4444-4444-444444444444'),
  ('chat-001', '55555555-5555-5555-5555-555555555555'),
  ('chat-002', '22222222-2222-2222-2222-222222222222'),
  ('chat-002', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (room_id, user_id) DO NOTHING;

-- Create some messages
INSERT INTO messages (room_id, sender_id, content, created_at)
VALUES
  ('chat-001', '33333333-3333-3333-3333-333333333333', 'Excited for the conference!', now() - interval '2 hours'),
  ('chat-001', '44444444-4444-4444-4444-444444444444', 'Me too! Can''t wait for the keynote.', now() - interval '1 hour'),
  ('chat-001', '55555555-5555-5555-5555-555555555555', 'Anyone know where the registration desk is?', now() - interval '30 minutes'),
  ('chat-002', '22222222-2222-2222-2222-222222222222', 'Welcome to the AI & ML track! Feel free to ask questions.', now() - interval '3 hours')
ON CONFLICT DO NOTHING;

-- Create connections between users
INSERT INTO connections (requester_id, recipient_id, status, met_at_conference_id, notes)
VALUES
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'accepted', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Met at the opening keynote'),
  ('33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 'accepted', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Discussed React patterns'),
  ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'pending', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL)
ON CONFLICT (requester_id, recipient_id) DO NOTHING;

-- Create ticket types
INSERT INTO ticket_types (conference_id, name, description, price_cents, currency, max_quantity, sold_count, stripe_price_id)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Early Bird', 'Early bird special pricing', 29900, 'usd', 500, 347, 'price_early_bird'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'General Admission', 'Standard conference pass', 49900, 'usd', 3000, 1852, 'price_general'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'VIP Pass', 'VIP access with exclusive perks', 99900, 'usd', 200, 127, 'price_vip'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Workshop Add-on', 'Access to hands-on workshops', 14900, 'usd', 500, 203, 'price_workshop')
ON CONFLICT DO NOTHING;

-- Create announcements
INSERT INTO announcements (conference_id, title, message, priority, created_by)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Welcome to Tech Summit 2024!',
    'We''re thrilled to have you here. Don''t forget to download the mobile app and check the schedule for today''s sessions.',
    'normal',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Room Change: ML Workshop',
    'The ML workshop has been moved to Room 201 due to high attendance. Please update your schedule.',
    'high',
    '11111111-1111-1111-1111-111111111111'
  )
ON CONFLICT DO NOTHING;

-- Create analytics events (sample data)
INSERT INTO analytics_events (conference_id, user_id, event_type, event_data)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'session_saved', '{"session_id": "session-001"}'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'check_in', '{"location": "main_entrance"}'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'session_view', '{"session_id": "session-002"}'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'sponsor_visit', '{"sponsor_id": "TechCorp"}')
ON CONFLICT DO NOTHING;
