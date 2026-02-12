import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConferenceEditorClient } from './client'

async function getConference(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: conference } = await supabase
    .from('conferences')
    .select('*')
    .eq('id', id)
    .single()

  if (!conference) {
    redirect('/conferences')
  }

  const { data: designTokens } = await supabase
    .from('design_tokens')
    .select('tokens')
    .eq('conference_id', id)
    .eq('is_active', true)
    .maybeSingle()

  return { conference, designTokens: designTokens?.tokens || null, userId: user.id }
}

export default async function ConferenceEditPage({
  params,
}: {
  params: { id: string }
}) {
  const { conference, designTokens } = await getConference(params.id)
  const appTokens = designTokens?.app || {}

  // Map database conference to editor format
  const initialConference = {
    id: conference.id,
    slug: conference.slug,
    // Basic Info
    name: conference.name,
    tagline: conference.tagline || '',
    description: conference.description || '',
    startDate: conference.start_date?.split('T')[0] || '',
    endDate: conference.end_date?.split('T')[0] || '',
    timezone: conference.timezone || 'America/New_York',
    venueName: conference.venue_name || '',
    venueAddress: conference.venue_address || '',
    websiteUrl: conference.website_url || '',
    // Branding Assets
    logoUrl: conference.logo_url || null,
    bannerUrl: conference.banner_url || null,
    // Colors
    primaryColor: conference.primary_color || '#2563eb',
    secondaryColor: conference.secondary_color || '#8b5cf6',
    accentColor: conference.accent_color || '#f59e0b',
    backgroundColor: conference.background_color || '#ffffff',
    textColor: conference.text_color || '#1f2937',
    headingColor: conference.heading_color || '#111827',
    // Navigation Colors
    navBackgroundColor: conference.nav_background_color || '#ffffff',
    navTextColor: conference.nav_text_color || '#374151',
    // Button Colors
    buttonColor: conference.button_color || conference.primary_color || '#2563eb',
    buttonTextColor: conference.button_text_color || '#ffffff',
    registrationButtonText: conference.registration_button_text || 'Register Now',
    // App Button Styles
    appButtonStyle: appTokens.appButtonStyle || 'solid',
    appButtonColor: appTokens.appButtonColor || conference.primary_color || '#2563eb',
    appButtonTextColor: appTokens.appButtonTextColor || '#ffffff',
    // Typography
    fontHeading: conference.font_heading || 'Inter',
    fontBody: conference.font_body || 'Inter',
    // Hero Settings
    heroHeight: conference.hero_height || 'medium',
    heroStyle: conference.hero_style || 'gradient',
    heroBackgroundUrl: conference.hero_background_url || null,
    heroVideoUrl: conference.hero_video_url || null,
    heroOverlayOpacity: conference.hero_overlay_opacity ?? 0.3,
    // Background Settings
    backgroundPattern: conference.background_pattern || 'none',
    backgroundPatternColor: conference.background_pattern_color || '#00000010',
    backgroundGradientStart: conference.background_gradient_start || '',
    backgroundGradientEnd: conference.background_gradient_end || '',
    backgroundImageUrl: conference.background_image_url || null,
    backgroundImageOverlay: conference.background_image_overlay ?? 0.5,
    // App Background Settings
    appBackgroundPattern: appTokens.backgroundPattern || null,
    appBackgroundPatternColor: appTokens.backgroundPatternColor || '#00000010',
    appBackgroundGradientStart: appTokens.backgroundGradientStart || '',
    appBackgroundGradientEnd: appTokens.backgroundGradientEnd || '',
    appBackgroundImageUrl: appTokens.backgroundImageUrl || null,
    appBackgroundImageOverlay: appTokens.backgroundImageOverlay ?? 0.5,
    // App Icon Theme
    appIconTheme: appTokens.iconTheme || 'solid',
    // Footer & Legal
    footerText: conference.footer_text || '',
    privacyPolicyUrl: conference.privacy_policy_url || '',
    termsUrl: conference.terms_url || '',
    codeOfConductUrl: conference.code_of_conduct_url || '',
    // Social Links
    twitterUrl: conference.twitter_url || '',
    linkedinUrl: conference.linkedin_url || '',
    instagramUrl: conference.instagram_url || '',
    youtubeUrl: conference.youtube_url || '',
    // Settings
    isPublic: conference.is_public ?? true,
    isHybrid: conference.is_hybrid ?? false,
    registrationOpen: conference.registration_open ?? true,
    maxAttendees: conference.max_attendees || null,
    // Custom
    customCss: conference.custom_css || '',
  }

  return (
    <ConferenceEditorClient
      conferenceId={params.id}
      initialConference={initialConference}
    />
  )
}
