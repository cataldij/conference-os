import { createContext, useContext, useState, ReactNode } from 'react'
import { Conference, ConferenceMember } from '@conference-os/api'

interface ConferenceContextType {
  // Current active conference (the "channel" user is viewing)
  activeConference: Conference | null
  setActiveConference: (conference: Conference | null) => void

  // User's membership in the active conference
  membership: ConferenceMember | null
  setMembership: (membership: ConferenceMember | null) => void

  // Conference theme (for channel branding)
  accentColor: string
}

const ConferenceContext = createContext<ConferenceContextType | undefined>(undefined)

export function ConferenceProvider({ children }: { children: ReactNode }) {
  const [activeConference, setActiveConference] = useState<Conference | null>(null)
  const [membership, setMembership] = useState<ConferenceMember | null>(null)

  // Get accent color from conference or use default
  const accentColor = activeConference?.primary_color || '#2563eb'

  const value: ConferenceContextType = {
    activeConference,
    setActiveConference,
    membership,
    setMembership,
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
