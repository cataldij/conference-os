'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { DEMO_CONFERENCE, DEMO_DESIGN_TOKENS, DEMO_GRADIENTS } from '@/lib/demo-data'

// =============================================
// TYPES
// =============================================

interface ConferenceOverview {
  name: string
  tagline: string
  description: string
  startDate: string
  endDate: string
  venueName: string
  venueAddress: string
  logoUrl: string | null
  bannerUrl: string | null
}

interface DesignTokens {
  colors: Record<string, string>
  typography: {
    fontFamily: {
      heading: string
      body: string
      mono: string
    }
    fontSize: Record<string, string>
    fontWeight: Record<string, number>
    lineHeight: Record<string, number>
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  shadows: Record<string, string>
  animation: {
    duration: Record<string, string>
    easing: Record<string, string>
  }
}

interface NavigationModule {
  id: string
  name: string
  icon: string
  enabled: boolean
  order: number
}

interface BuilderState {
  step: number
  overview: ConferenceOverview
  design: {
    tokens: DesignTokens
    gradients: {
      hero: string
      accent: string
      card: string
    }
    darkMode: Record<string, string> | null
    cardStyle: {
      variant: 'white' | 'tinted' | 'glass'
      border: 'none' | 'primary' | 'secondary' | 'accent'
      iconStyle: 'solid' | 'outline' | 'pill'
    }
  }
  navigation: NavigationModule[]
  publish: {
    eventCode: string
    attendeeUrl: string
    isPublished: boolean
  }
}

interface BuilderContextValue {
  state: BuilderState
  // Step navigation
  currentStep: number
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  canGoNext: boolean
  canGoPrev: boolean
  // Overview
  updateOverview: (updates: Partial<ConferenceOverview>) => void
  // Design
  updateDesignTokens: (tokens: DesignTokens) => void
  updateGradients: (gradients: BuilderState['design']['gradients']) => void
  updateCardStyle: (cardStyle: BuilderState['design']['cardStyle']) => void
  // Navigation
  toggleModule: (moduleId: string) => void
  reorderModules: (modules: NavigationModule[]) => void
  // Publish
  generateEventCode: () => void
}

// =============================================
// DEFAULT STATE
// =============================================

const DEFAULT_MODULES: NavigationModule[] = [
  { id: 'home', name: 'Home', icon: 'Home', enabled: true, order: 0 },
  { id: 'schedule', name: 'Schedule', icon: 'Calendar', enabled: true, order: 1 },
  { id: 'speakers', name: 'Speakers', icon: 'Users', enabled: true, order: 2 },
  { id: 'sponsors', name: 'Sponsors', icon: 'Building2', enabled: true, order: 3 },
  { id: 'networking', name: 'Networking', icon: 'MessageCircle', enabled: true, order: 4 },
  { id: 'map', name: 'Venue Map', icon: 'Map', enabled: true, order: 5 },
  { id: 'notifications', name: 'Notifications', icon: 'Bell', enabled: true, order: 6 },
  { id: 'profile', name: 'My Profile', icon: 'User', enabled: true, order: 7 },
]

const DEFAULT_STATE: BuilderState = {
  step: 0,
  overview: {
    name: DEMO_CONFERENCE.name,
    tagline: DEMO_CONFERENCE.tagline || '',
    description: DEMO_CONFERENCE.description || '',
    startDate: DEMO_CONFERENCE.start_date,
    endDate: DEMO_CONFERENCE.end_date,
    venueName: DEMO_CONFERENCE.venue_name || '',
    venueAddress: DEMO_CONFERENCE.venue_address || '',
    logoUrl: null,
    bannerUrl: null,
  },
  design: {
    tokens: DEMO_DESIGN_TOKENS as unknown as DesignTokens,
    gradients: DEMO_GRADIENTS,
    darkMode: null,
    cardStyle: {
      variant: 'white',
      border: 'primary',
      iconStyle: 'solid',
    },
  },
  navigation: DEFAULT_MODULES,
  publish: {
    eventCode: '',
    attendeeUrl: '',
    isPublished: false,
  },
}

// =============================================
// CONTEXT
// =============================================

const BuilderContext = createContext<BuilderContextValue | null>(null)

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BuilderState>(DEFAULT_STATE)

  const setStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, step: Math.max(0, Math.min(3, step)) }))
  }, [])

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.min(3, prev.step + 1) }))
  }, [])

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1) }))
  }, [])

  const updateOverview = useCallback((updates: Partial<ConferenceOverview>) => {
    setState(prev => ({
      ...prev,
      overview: { ...prev.overview, ...updates },
    }))
  }, [])

  const updateDesignTokens = useCallback((tokens: DesignTokens) => {
    setState(prev => ({
      ...prev,
      design: { ...prev.design, tokens },
    }))
  }, [])

  const updateGradients = useCallback((gradients: BuilderState['design']['gradients']) => {
    setState(prev => ({
      ...prev,
      design: { ...prev.design, gradients },
    }))
  }, [])

  const updateCardStyle = useCallback((cardStyle: BuilderState['design']['cardStyle']) => {
    setState(prev => ({
      ...prev,
      design: { ...prev.design, cardStyle },
    }))
  }, [])

  const toggleModule = useCallback((moduleId: string) => {
    setState(prev => ({
      ...prev,
      navigation: prev.navigation.map(m =>
        m.id === moduleId ? { ...m, enabled: !m.enabled } : m
      ),
    }))
  }, [])

  const reorderModules = useCallback((modules: NavigationModule[]) => {
    setState(prev => ({
      ...prev,
      navigation: modules.map((m, i) => ({ ...m, order: i })),
    }))
  }, [])

  const generateEventCode = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setState(prev => ({
      ...prev,
      publish: {
        eventCode: code,
        attendeeUrl: `https://conference-os.vercel.app/c/${code.toLowerCase()}`,
        isPublished: true,
      },
    }))
  }, [])

  const value: BuilderContextValue = {
    state,
    currentStep: state.step,
    setStep,
    nextStep,
    prevStep,
    canGoNext: state.step < 3,
    canGoPrev: state.step > 0,
    updateOverview,
    updateDesignTokens,
    updateGradients,
    updateCardStyle,
    toggleModule,
    reorderModules,
    generateEventCode,
  }

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  )
}

export function useBuilder() {
  const context = useContext(BuilderContext)
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider')
  }
  return context
}
