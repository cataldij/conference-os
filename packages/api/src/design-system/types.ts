// =============================================
// CONFERENCE OS: Design System Types
// A powerful, flexible design token system
// =============================================

// =============================================
// COLOR TOKENS
// =============================================
export interface ColorTokens {
  // Primary brand color
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary color
  secondary: string;
  secondaryLight?: string;
  secondaryDark?: string;

  // Accent color
  accent: string;
  accentLight?: string;
  accentDark?: string;

  // Backgrounds
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceHover?: string;

  // Text
  text: string;
  textMuted: string;
  textInverse?: string;

  // Borders
  border: string;
  borderFocus?: string;

  // Semantic colors
  error: string;
  errorLight?: string;
  success: string;
  successLight?: string;
  warning: string;
  warningLight?: string;
  info?: string;
  infoLight?: string;

  // Gradient support
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
}

// =============================================
// TYPOGRAPHY TOKENS
// =============================================
export interface FontFamilyTokens {
  heading: string;
  body: string;
  mono: string;
}

export interface FontSizeTokens {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl'?: string;
}

export interface FontWeightTokens {
  light?: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold?: number;
}

export interface LineHeightTokens {
  none?: number;
  tight: number;
  normal: number;
  relaxed: number;
  loose?: number;
}

export interface LetterSpacingTokens {
  tighter?: string;
  tight?: string;
  normal?: string;
  wide?: string;
  wider?: string;
}

export interface TypographyTokens {
  fontFamily: FontFamilyTokens;
  fontSize: FontSizeTokens;
  fontWeight: FontWeightTokens;
  lineHeight: LineHeightTokens;
  letterSpacing?: LetterSpacingTokens;
}

// =============================================
// SPACING TOKENS
// =============================================
export interface SpacingTokens {
  '0'?: string;
  px?: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl'?: string;
  '5xl'?: string;
}

// =============================================
// BORDER RADIUS TOKENS
// =============================================
export interface BorderRadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

// =============================================
// SHADOW TOKENS
// =============================================
export interface ShadowTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl'?: string;
  inner?: string;
}

// =============================================
// ANIMATION TOKENS
// =============================================
export interface AnimationDurationTokens {
  instant?: string;
  fast: string;
  normal: string;
  slow: string;
  slower?: string;
}

export interface AnimationEasingTokens {
  default: string;
  linear?: string;
  in: string;
  out: string;
  inOut?: string;
  bounce: string;
}

export interface AnimationTokens {
  duration: AnimationDurationTokens;
  easing: AnimationEasingTokens;
}

// =============================================
// COMBINED DESIGN TOKENS
// =============================================
export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
  shadows: ShadowTokens;
  animation: AnimationTokens;
}

// =============================================
// COMPONENT VARIANT TYPES
// =============================================
export type ComponentType =
  | 'session_card'
  | 'speaker_card'
  | 'sponsor_card'
  | 'nav_bar'
  | 'hero'
  | 'button'
  | 'countdown'
  | 'schedule_item'
  | 'attendee_card'
  | 'poll'
  | 'qa_question'
  | 'announcement'
  | 'chat_message';

export interface BaseComponentConfig {
  style: string;
  borderRadius?: string;
  shadow?: string;
  padding?: string;
}

export interface SessionCardConfig extends BaseComponentConfig {
  showTime: boolean;
  showTrack: boolean;
  showSpeakerAvatars: boolean;
  showLocation: boolean;
  showDescription?: boolean;
  showImage?: boolean;
  gradient?: boolean;
  blur?: boolean;
  opacity?: number;
}

export interface SpeakerCardConfig extends BaseComponentConfig {
  avatarSize: 'sm' | 'md' | 'lg' | 'xl';
  showTitle: boolean;
  showCompany: boolean;
  showBio: boolean;
  showSocials?: boolean;
  layout: 'vertical' | 'horizontal';
  gradient?: boolean;
}

export interface NavBarConfig extends BaseComponentConfig {
  position: 'top' | 'bottom';
  showLogo: boolean;
  blur: boolean;
  iconOnly?: boolean;
}

export interface HeroConfig extends BaseComponentConfig {
  height: string;
  overlay: boolean;
  overlayOpacity?: number;
  textAlign: 'left' | 'center' | 'right';
  showCountdown: boolean;
  showCta: boolean;
  imagePosition?: 'left' | 'right';
  autoplay?: boolean;
  muted?: boolean;
}

export interface ButtonConfig extends BaseComponentConfig {
  borderWidth?: number;
}

export interface SponsorCardConfig extends BaseComponentConfig {
  showName: boolean;
  showDescription: boolean;
  showCta?: boolean;
  grayscale?: boolean;
  hoverColor?: boolean;
  gradient?: boolean;
}

export type ComponentConfig =
  | SessionCardConfig
  | SpeakerCardConfig
  | NavBarConfig
  | HeroConfig
  | ButtonConfig
  | SponsorCardConfig
  | BaseComponentConfig;

export interface ComponentVariant {
  id: string;
  componentType: ComponentType;
  variantName: string;
  isSystem: boolean;
  conferenceId: string | null;
  config: ComponentConfig;
  previewImageUrl: string | null;
}

// =============================================
// PAGE SECTION TYPES
// =============================================
export type PageType =
  | 'home'
  | 'agenda'
  | 'speakers'
  | 'sponsors'
  | 'networking'
  | 'profile'
  | 'session_detail'
  | 'speaker_detail';

export type SectionType =
  | 'hero'
  | 'countdown'
  | 'featured_sessions'
  | 'upcoming_sessions'
  | 'session_list'
  | 'speaker_grid'
  | 'speaker_carousel'
  | 'sponsor_grid'
  | 'sponsor_ticker'
  | 'announcements'
  | 'live_poll'
  | 'networking_cta'
  | 'tracks_overview'
  | 'venue_map'
  | 'custom_html'
  | 'divider'
  | 'spacer';

export interface PageSection {
  id: string;
  conferenceId: string;
  pageType: PageType;
  sectionType: SectionType;
  sectionOrder: number;
  config: Record<string, unknown>;
  variantId: string | null;
  isVisible: boolean;
  visibleFrom: string | null;
  visibleUntil: string | null;
}

// =============================================
// DESIGN PRESET TYPE
// =============================================
export interface DesignPreset {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  tokens: DesignTokens;
  defaultSections: PageSection[];
  defaultVariants: Record<ComponentType, string>;
  previewImageUrl: string | null;
  previewColors: string[];
  isPublic: boolean;
  isFeatured: boolean;
  tags: string[];
}

// =============================================
// AI STYLE GENERATION TYPES
// =============================================
export interface AIStylePrompt {
  prompt: string;
  referenceUrl?: string;
  brandAssets?: {
    logoUrl?: string;
    colors?: string[];
    fonts?: string[];
    mood?: string[];
  };
}

export interface AIStyleGeneration {
  id: string;
  conferenceId: string | null;
  prompt: string;
  referenceUrl: string | null;
  brandAssets: AIStylePrompt['brandAssets'] | null;
  generatedTokens: DesignTokens;
  generationModel: string;
  wasAccepted: boolean | null;
  userRating: number | null;
  createdAt: string;
  createdBy: string;
}

// =============================================
// HELPER TYPES
// =============================================
export interface DesignTokensRecord {
  id: string;
  conferenceId: string;
  version: number;
  isActive: boolean;
  tokens: DesignTokens;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

// CSS Variable generation
export type CSSVariables = Record<string, string>;

// Default tokens for fallback
export const DEFAULT_TOKENS: DesignTokens = {
  colors: {
    primary: '#0066FF',
    primaryLight: '#3385FF',
    primaryDark: '#0052CC',
    secondary: '#6B7280',
    accent: '#10B981',
    background: '#FFFFFF',
    backgroundAlt: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  typography: {
    fontFamily: {
      heading: 'Inter',
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
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
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
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.15)',
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
