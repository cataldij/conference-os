'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { ios } from './tokens'

// Conference theme that can be customized in the builder
export interface ConferenceTheme {
  // Brand colors
  primaryColor: string
  secondaryColor: string
  accentColor: string

  // Branding assets
  logoUrl: string | null
  bannerUrl: string | null
  iconUrl: string | null

  // Event info
  name: string
  tagline: string

  // Module visibility
  modules: {
    agenda: boolean
    speakers: boolean
    sponsors: boolean
    map: boolean
    networking: boolean
    announcements: boolean
  }
}

// Default theme
export const defaultTheme: ConferenceTheme = {
  primaryColor: ios.colors.systemBlue,
  secondaryColor: ios.colors.systemIndigo,
  accentColor: ios.colors.systemPink,
  logoUrl: null,
  bannerUrl: null,
  iconUrl: null,
  name: 'Your Conference',
  tagline: 'An amazing event awaits',
  modules: {
    agenda: true,
    speakers: true,
    sponsors: true,
    map: true,
    networking: true,
    announcements: true,
  },
}

// Context value type
interface ConferenceThemeContextValue {
  theme: ConferenceTheme
  setTheme: (updates: Partial<ConferenceTheme>) => void
  setModuleEnabled: (module: keyof ConferenceTheme['modules'], enabled: boolean) => void
  resetTheme: () => void

  // Computed color values
  colors: {
    primary: string
    primaryLight: string
    primaryDark: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
  }
}

const ConferenceThemeContext = createContext<ConferenceThemeContextValue | null>(null)

interface ConferenceThemeProviderProps {
  children: React.ReactNode
  initialTheme?: Partial<ConferenceTheme>
  onThemeChange?: (theme: ConferenceTheme) => void
}

export function ConferenceThemeProvider({
  children,
  initialTheme,
  onThemeChange,
}: ConferenceThemeProviderProps) {
  const [theme, setThemeState] = useState<ConferenceTheme>({
    ...defaultTheme,
    ...initialTheme,
  })

  const setTheme = useCallback(
    (updates: Partial<ConferenceTheme>) => {
      setThemeState((prev) => {
        const next = { ...prev, ...updates }
        onThemeChange?.(next)
        return next
      })
    },
    [onThemeChange]
  )

  const setModuleEnabled = useCallback(
    (module: keyof ConferenceTheme['modules'], enabled: boolean) => {
      setThemeState((prev) => {
        const next = {
          ...prev,
          modules: { ...prev.modules, [module]: enabled },
        }
        onThemeChange?.(next)
        return next
      })
    },
    [onThemeChange]
  )

  const resetTheme = useCallback(() => {
    setThemeState(defaultTheme)
    onThemeChange?.(defaultTheme)
  }, [onThemeChange])

  // Compute derived colors from primary
  const colors = useMemo(() => {
    const primary = theme.primaryColor

    // Simple lightening/darkening
    const adjustColor = (hex: string, percent: number): string => {
      const num = parseInt(hex.replace('#', ''), 16)
      const amt = Math.round(2.55 * percent)
      const R = (num >> 16) + amt
      const G = ((num >> 8) & 0x00ff) + amt
      const B = (num & 0x0000ff) + amt
      return (
        '#' +
        (
          0x1000000 +
          (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
          (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
          (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
          .toString(16)
          .slice(1)
      )
    }

    return {
      primary: primary,
      primaryLight: adjustColor(primary, 20),
      primaryDark: adjustColor(primary, -20),
      secondary: theme.secondaryColor,
      accent: theme.accentColor,
      background: ios.colors.systemBackground,
      surface: ios.colors.secondarySystemBackground,
      text: ios.colors.label,
      textSecondary: ios.colors.secondaryLabel,
    }
  }, [theme.primaryColor, theme.secondaryColor, theme.accentColor])

  const value: ConferenceThemeContextValue = {
    theme,
    setTheme,
    setModuleEnabled,
    resetTheme,
    colors,
  }

  return (
    <ConferenceThemeContext.Provider value={value}>
      {children}
    </ConferenceThemeContext.Provider>
  )
}

// Hook to use the theme
export function useConferenceTheme() {
  const context = useContext(ConferenceThemeContext)
  if (!context) {
    throw new Error('useConferenceTheme must be used within ConferenceThemeProvider')
  }
  return context
}

// Optional: hook that doesn't throw (for components that might be outside provider)
export function useConferenceThemeOptional() {
  return useContext(ConferenceThemeContext)
}
