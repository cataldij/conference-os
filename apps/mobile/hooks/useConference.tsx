import { createContext, useContext, useState, useMemo, ReactNode } from 'react'
import { Conference, ConferenceMember } from '@conference-os/api'

// Conference theme derived from customization settings
interface ConferenceTheme {
  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  headingColor: string
  navBackgroundColor: string
  navTextColor: string
  buttonColor: string
  buttonTextColor: string

  // Mobile-specific
  splashColor: string
  iconBackgroundColor: string
  statusBarStyle: 'light' | 'dark'
  tabBarColor: string
  tabBarActiveColor: string

  // Background
  backgroundImageUrl: string | null
  backgroundPattern: string | null
  backgroundPatternColor: string | null
  backgroundGradientStart: string | null
  backgroundGradientEnd: string | null

  // Typography
  fontHeading: string
  fontBody: string

  // Feature flags
  networkingEnabled: boolean
  attendeeDirectoryEnabled: boolean
  sessionQaEnabled: boolean
  livePollsEnabled: boolean
  chatEnabled: boolean
  sessionRatingsEnabled: boolean
  virtualBadgesEnabled: boolean
  meetingRequestsEnabled: boolean
  sponsorBoothsEnabled: boolean
  liveStreamEnabled: boolean
  recordingsEnabled: boolean
  certificatesEnabled: boolean
}

interface ConferenceContextType {
  // Current active conference (the "channel" user is viewing)
  activeConference: Conference | null
  setActiveConference: (conference: Conference | null) => void

  // User's membership in the active conference
  membership: ConferenceMember | null
  setMembership: (membership: ConferenceMember | null) => void

  // Conference theme (for channel branding)
  theme: ConferenceTheme

  // Legacy - for backwards compatibility
  accentColor: string
}

const defaultTheme: ConferenceTheme = {
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  headingColor: '#111827',
  navBackgroundColor: '#ffffff',
  navTextColor: '#374151',
  buttonColor: '#2563eb',
  buttonTextColor: '#ffffff',
  splashColor: '#2563eb',
  iconBackgroundColor: '#2563eb',
  statusBarStyle: 'light',
  tabBarColor: '#ffffff',
  tabBarActiveColor: '#2563eb',
  backgroundImageUrl: null,
  backgroundPattern: null,
  backgroundPatternColor: null,
  backgroundGradientStart: null,
  backgroundGradientEnd: null,
  fontHeading: 'Inter',
  fontBody: 'Inter',
  networkingEnabled: true,
  attendeeDirectoryEnabled: true,
  sessionQaEnabled: true,
  livePollsEnabled: true,
  chatEnabled: true,
  sessionRatingsEnabled: true,
  virtualBadgesEnabled: true,
  meetingRequestsEnabled: true,
  sponsorBoothsEnabled: true,
  liveStreamEnabled: false,
  recordingsEnabled: true,
  certificatesEnabled: false,
}

const ConferenceContext = createContext<ConferenceContextType | undefined>(undefined)

export function ConferenceProvider({ children }: { children: ReactNode }) {
  const [activeConference, setActiveConference] = useState<Conference | null>(null)
  const [membership, setMembership] = useState<ConferenceMember | null>(null)

  // Build theme from conference customizations
  const theme = useMemo<ConferenceTheme>(() => {
    if (!activeConference) return defaultTheme

    const c = activeConference as any // Type assertion for all the new fields

    return {
      // Colors
      primaryColor: c.primary_color || defaultTheme.primaryColor,
      secondaryColor: c.secondary_color || defaultTheme.secondaryColor,
      accentColor: c.accent_color || defaultTheme.accentColor,
      backgroundColor: c.background_color || defaultTheme.backgroundColor,
      textColor: c.text_color || defaultTheme.textColor,
      headingColor: c.heading_color || defaultTheme.headingColor,
      navBackgroundColor: c.nav_background_color || defaultTheme.navBackgroundColor,
      navTextColor: c.nav_text_color || defaultTheme.navTextColor,
      buttonColor: c.button_color || c.primary_color || defaultTheme.buttonColor,
      buttonTextColor: c.button_text_color || defaultTheme.buttonTextColor,

      // Mobile-specific
      splashColor: c.mobile_splash_color || c.primary_color || defaultTheme.splashColor,
      iconBackgroundColor: c.mobile_icon_background_color || c.primary_color || defaultTheme.iconBackgroundColor,
      statusBarStyle: c.mobile_status_bar_style || defaultTheme.statusBarStyle,
      tabBarColor: c.mobile_tab_bar_color || defaultTheme.tabBarColor,
      tabBarActiveColor: c.mobile_tab_bar_active_color || c.primary_color || defaultTheme.tabBarActiveColor,

      // Background
      backgroundImageUrl: c.background_image_url || null,
      backgroundPattern: c.background_pattern || null,
      backgroundPatternColor: c.background_pattern_color || null,
      backgroundGradientStart: c.background_gradient_start || null,
      backgroundGradientEnd: c.background_gradient_end || null,

      // Typography
      fontHeading: c.font_heading || defaultTheme.fontHeading,
      fontBody: c.font_body || defaultTheme.fontBody,

      // Feature flags
      networkingEnabled: c.feature_networking !== false,
      attendeeDirectoryEnabled: c.feature_attendee_directory !== false,
      sessionQaEnabled: c.feature_session_qa !== false,
      livePollsEnabled: c.feature_live_polls !== false,
      chatEnabled: c.feature_chat !== false,
      sessionRatingsEnabled: c.feature_session_ratings !== false,
      virtualBadgesEnabled: c.feature_virtual_badges !== false,
      meetingRequestsEnabled: c.feature_meeting_requests !== false,
      sponsorBoothsEnabled: c.feature_sponsor_booths !== false,
      liveStreamEnabled: c.feature_live_stream === true,
      recordingsEnabled: c.feature_recordings !== false,
      certificatesEnabled: c.feature_certificates === true,
    }
  }, [activeConference])

  // Legacy - for backwards compatibility
  const accentColor = theme.primaryColor

  const value: ConferenceContextType = {
    activeConference,
    setActiveConference,
    membership,
    setMembership,
    theme,
    accentColor,
  }

  return (
    <ConferenceContext.Provider value={value}>
      {children}
    </ConferenceContext.Provider>
  )
}

export function useConference() {
  const context = useContext(ConferenceContext)
  if (context === undefined) {
    throw new Error('useConference must be used within a ConferenceProvider')
  }
  return context
}
