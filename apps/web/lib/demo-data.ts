// Demo mode mock data - used when NEXT_PUBLIC_DEMO_MODE=true
// This provides a realistic conference experience without requiring auth

export const DEMO_CONFERENCE_ID = 'demo-conference-2024';

export const DEMO_CONFERENCE = {
  id: DEMO_CONFERENCE_ID,
  slug: 'techsummit-2024',
  name: 'TechSummit 2024',
  tagline: 'Where Innovation Meets Inspiration',
  description: 'Join 5,000+ developers, designers, and tech leaders for three days of cutting-edge sessions, hands-on workshops, and unparalleled networking opportunities.',
  start_date: '2024-09-15',
  end_date: '2024-09-17',
  timezone: 'America/Los_Angeles',
  venue_name: 'Moscone Center',
  venue_address: '747 Howard St, San Francisco, CA 94103',
  venue_lat: 37.7842,
  venue_lng: -122.4016,
  logo_url: null,
  banner_url: null,
  primary_color: '#2563eb',
  secondary_color: '#7c3aed',
  accent_color: '#06b6d4',
  background_color: '#ffffff',
  font_heading: 'Space Grotesk',
  font_body: 'Inter',
  website_url: 'https://techsummit.example.com',
  is_public: true,
  is_hybrid: true,
  max_attendees: 5000,
  registration_open: true,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
};

export const DEMO_DESIGN_TOKENS = {
  colors: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    secondary: '#7c3aed',
    secondaryLight: '#8b5cf6',
    secondaryDark: '#6d28d9',
    accent: '#06b6d4',
    accentLight: '#22d3ee',
    accentDark: '#0891b2',
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceHover: '#f1f5f9',
    text: '#0f172a',
    textMuted: '#64748b',
    textInverse: '#ffffff',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  typography: {
    fontFamily: {
      heading: 'Space Grotesk',
      body: 'Inter',
      mono: 'JetBrains Mono',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
};

export const DEMO_DESIGN_CONCEPT = {
  name: 'Tech Forward',
  tagline: 'Bold innovation meets clean design',
  personality: ['Modern', 'Professional', 'Innovative'],
  inspiration: 'Inspired by leading tech conferences like WWDC and Google I/O, blending sleek minimalism with vibrant accent colors.',
};

export const DEMO_GRADIENTS = {
  hero: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #06b6d4 100%)',
  accent: 'linear-gradient(90deg, #2563eb, #7c3aed)',
  card: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
};

export const DEMO_DARK_MODE = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceHover: '#334155',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  textInverse: '#0f172a',
  border: '#334155',
};

export const DEMO_SESSIONS = [
  {
    id: 'session-1',
    title: 'Keynote: The Future of AI',
    description: 'Explore how artificial intelligence is reshaping industries and what it means for developers.',
    session_type: 'keynote',
    start_time: '2024-09-15T09:00:00-07:00',
    end_time: '2024-09-15T10:30:00-07:00',
    room: 'Main Stage',
    track: 'AI & Machine Learning',
    speakers: ['Demo Speaker'],
  },
  {
    id: 'session-2',
    title: 'Building Scalable React Applications',
    description: 'Best practices for architecting large-scale React applications.',
    session_type: 'talk',
    start_time: '2024-09-15T11:00:00-07:00',
    end_time: '2024-09-15T12:00:00-07:00',
    room: 'Room A',
    track: 'Frontend',
    speakers: ['Demo Speaker'],
  },
  {
    id: 'session-3',
    title: 'Workshop: Hands-on with WebXR',
    description: 'Learn to build immersive AR/VR experiences for the web.',
    session_type: 'workshop',
    start_time: '2024-09-15T14:00:00-07:00',
    end_time: '2024-09-15T17:00:00-07:00',
    room: 'Workshop Hall',
    track: 'Emerging Tech',
    speakers: ['Demo Speaker'],
  },
];

export const DEMO_TRACKS = [
  { id: 'track-1', name: 'AI & Machine Learning', color: '#2563eb' },
  { id: 'track-2', name: 'Frontend', color: '#7c3aed' },
  { id: 'track-3', name: 'Backend', color: '#06b6d4' },
  { id: 'track-4', name: 'Emerging Tech', color: '#10b981' },
  { id: 'track-5', name: 'DevOps', color: '#f59e0b' },
];

export const DEMO_ROOMS = [
  { id: 'room-1', name: 'Main Stage', capacity: 2000 },
  { id: 'room-2', name: 'Room A', capacity: 500 },
  { id: 'room-3', name: 'Room B', capacity: 500 },
  { id: 'room-4', name: 'Workshop Hall', capacity: 100 },
];

// Check if demo mode is enabled
export function isDemoMode(): boolean {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  }
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

// Check if a conference ID is the demo conference
export function isDemoConference(conferenceId: string): boolean {
  return conferenceId === DEMO_CONFERENCE_ID;
}
