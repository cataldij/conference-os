import { createTamagui, createTokens } from '@tamagui/core'
import { createInterFont } from '@tamagui/font-inter'
import { shorthands } from '@tamagui/shorthands'
import { themes as defaultThemes, tokens as defaultTokens } from '@tamagui/themes'
import { createAnimations } from '@tamagui/animations-react-native'

// Premium Apple-like spacing scale (8pt grid)
const size = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  true: 16,
}

const space = {
  ...size,
  '-0.5': -2,
  '-1': -4,
  '-1.5': -6,
  '-2': -8,
  '-2.5': -10,
  '-3': -12,
  '-3.5': -14,
  '-4': -16,
  '-5': -20,
  '-6': -24,
  '-7': -28,
  '-8': -32,
}

const radius = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 48,
  10: 64,
  true: 16,
}

const zIndex = {
  0: 0,
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
}

// Premium color palette - Apple Keynote Minimal
const lightColors = {
  // Base
  background: '#FFFFFF',
  backgroundHover: '#F9FAFB',
  backgroundPress: '#F3F4F6',
  backgroundFocus: '#F3F4F6',
  backgroundStrong: '#F9FAFB',
  backgroundTransparent: 'rgba(255, 255, 255, 0)',

  // Surface (cards, modals)
  surface: '#FFFFFF',
  surfaceHover: '#FAFAFA',
  surfacePress: '#F5F5F5',

  // Text
  color: '#111827',
  colorHover: '#1F2937',
  colorPress: '#374151',
  colorFocus: '#1F2937',
  colorTransparent: 'rgba(17, 24, 39, 0)',

  // Secondary text
  colorSecondary: '#6B7280',
  colorTertiary: '#9CA3AF',
  colorMuted: '#D1D5DB',

  // Borders
  borderColor: '#E5E7EB',
  borderColorHover: '#D1D5DB',
  borderColorPress: '#9CA3AF',
  borderColorFocus: '#2563EB',

  // Accent (Conference primary - can be overridden per channel)
  accentColor: '#2563EB',
  accentColorHover: '#1D4ED8',
  accentColorPress: '#1E40AF',
  accentBackground: '#EFF6FF',

  // Semantic
  success: '#10B981',
  successBackground: '#ECFDF5',
  warning: '#F59E0B',
  warningBackground: '#FFFBEB',
  error: '#EF4444',
  errorBackground: '#FEF2F2',
  info: '#3B82F6',
  infoBackground: '#EFF6FF',

  // Shadows
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  shadowColorStrong: 'rgba(0, 0, 0, 0.15)',
}

const darkColors = {
  // Base
  background: '#111827',
  backgroundHover: '#1F2937',
  backgroundPress: '#374151',
  backgroundFocus: '#374151',
  backgroundStrong: '#1F2937',
  backgroundTransparent: 'rgba(17, 24, 39, 0)',

  // Surface
  surface: '#1F2937',
  surfaceHover: '#374151',
  surfacePress: '#4B5563',

  // Text
  color: '#F9FAFB',
  colorHover: '#F3F4F6',
  colorPress: '#E5E7EB',
  colorFocus: '#F3F4F6',
  colorTransparent: 'rgba(249, 250, 251, 0)',

  // Secondary text
  colorSecondary: '#9CA3AF',
  colorTertiary: '#6B7280',
  colorMuted: '#4B5563',

  // Borders
  borderColor: '#374151',
  borderColorHover: '#4B5563',
  borderColorPress: '#6B7280',
  borderColorFocus: '#3B82F6',

  // Accent
  accentColor: '#3B82F6',
  accentColorHover: '#2563EB',
  accentColorPress: '#1D4ED8',
  accentBackground: '#1E3A5F',

  // Semantic
  success: '#34D399',
  successBackground: '#064E3B',
  warning: '#FBBF24',
  warningBackground: '#78350F',
  error: '#F87171',
  errorBackground: '#7F1D1D',
  info: '#60A5FA',
  infoBackground: '#1E3A5F',

  // Shadows
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  shadowColorStrong: 'rgba(0, 0, 0, 0.5)',
}

// Create tokens
const tokens = createTokens({
  size,
  space,
  radius,
  zIndex,
  color: {
    ...lightColors,
    // Include common colors for both themes
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
})

// Premium Inter font configuration
const interFont = createInterFont({
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 15,
    6: 16,
    7: 18,
    8: 20,
    9: 24,
    10: 28,
    11: 32,
    12: 40,
    13: 48,
    14: 56,
    15: 64,
    16: 72,
    true: 16,
  },
  weight: {
    1: '400',
    2: '400',
    3: '400',
    4: '400',
    5: '500',
    6: '500',
    7: '600',
    8: '600',
    9: '700',
    10: '700',
  },
  letterSpacing: {
    1: 0,
    2: 0,
    3: 0,
    4: -0.25,
    5: -0.25,
    6: -0.5,
    7: -0.5,
    8: -0.75,
    9: -1,
    10: -1.5,
  },
})

// Smooth, subtle animations
const animations = createAnimations({
  fast: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 15,
    mass: 1,
    stiffness: 200,
  },
  slow: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 120,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    mass: 1.5,
    stiffness: 60,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1,
    stiffness: 400,
  },
})

// Create themes
const lightTheme = {
  ...lightColors,
}

const darkTheme = {
  ...darkColors,
}

// Tamagui configuration
export const tamaguiConfig = createTamagui({
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
    // Conference channel themes can be added dynamically
  },
  fonts: {
    heading: interFont,
    body: interFont,
    mono: interFont,
  },
  animations,
  shorthands,
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
  settings: {
    allowedStyleValues: 'somewhat-strict-web',
    autocompleteSpecificTokens: 'except-special',
  },
})

export default tamaguiConfig

// Type exports
export type TamaguiConfig = typeof tamaguiConfig

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends TamaguiConfig {}
}
