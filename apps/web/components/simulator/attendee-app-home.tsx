'use client'

import { ChevronRight } from 'lucide-react'
import {
  ios,
  CompactHeroCard,
  CompactModuleGrid,
} from '@conference-os/attendee-ui'

interface NavigationModule {
  id: string
  name: string
  icon: string
  enabled: boolean
  order: number
}

interface AttendeeAppHomeProps {
  eventName: string
  tagline?: string
  startDate?: string
  endDate?: string
  venueName?: string
  bannerUrl?: string | null
  logoUrl?: string | null
  primaryColor?: string
  modules: NavigationModule[]
  onModuleTap?: (moduleId: string) => void
  scale?: number
}

/**
 * Home screen for the attendee app
 * Uses shared components from @conference-os/attendee-ui
 */
export function AttendeeAppHome({
  eventName,
  tagline,
  startDate,
  endDate,
  venueName,
  bannerUrl,
  logoUrl,
  primaryColor = ios.colors.systemBlue,
  modules,
  onModuleTap,
  scale = 0.7,
}: AttendeeAppHomeProps) {
  // Map module IDs to the shared module config IDs
  const moduleIdMap: Record<string, string> = {
    schedule: 'agenda',
    agenda: 'agenda',
    speakers: 'speakers',
    exhibitors: 'sponsors',
    sponsors: 'sponsors',
    maps: 'map',
    map: 'map',
    networking: 'networking',
    chat: 'networking',
    announcements: 'announcements',
    notifications: 'announcements',
  }

  const enabledModules = modules
    .filter(m => m.enabled)
    .sort((a, b) => a.order - b.order)
    .map(m => moduleIdMap[m.id] || m.id)
    .filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates
    .slice(0, 6)

  return (
    <div
      className="flex h-full flex-col"
      style={{
        backgroundColor: ios.colors.secondarySystemBackground,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      }}
    >
      {/* iOS-style overscroll bounce */}
      <div
        className="flex-1 overflow-y-auto overscroll-y-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Hero Section */}
        <div style={{ padding: 12 * scale, paddingTop: 8 * scale }}>
          <CompactHeroCard
            name={eventName}
            tagline={tagline}
            bannerUrl={bannerUrl}
            logoUrl={logoUrl}
            startDate={startDate}
            endDate={endDate}
            venueName={venueName}
            primaryColor={primaryColor}
            scale={scale}
          />
        </div>

        {/* Content Area */}
        <div
          style={{
            padding: `0 ${12 * scale}px ${16 * scale}px`,
          }}
        >
          {/* Next Up Card */}
          <SectionHeader label="Next Up" scale={scale} />
          <NextUpCard primaryColor={primaryColor} scale={scale} />

          {/* Module Grid */}
          <SectionHeader label="Explore" scale={scale} style={{ marginTop: 16 * scale }} />
          <CompactModuleGrid
            modules={enabledModules}
            onModulePress={onModuleTap}
            columns={3}
            scale={scale * 0.85}
            gap={8}
          />

          {/* Quick Stats */}
          <SectionHeader label="At a Glance" scale={scale} style={{ marginTop: 16 * scale }} />
          <QuickStatsCard primaryColor={primaryColor} scale={scale} />
        </div>
      </div>
    </div>
  )
}

// Section Header Component
function SectionHeader({
  label,
  scale = 0.7,
  style,
}: {
  label: string
  scale?: number
  style?: React.CSSProperties
}) {
  return (
    <p
      style={{
        fontSize: 11 * scale,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.5 * scale,
        color: ios.colors.secondaryLabel,
        marginBottom: 8 * scale,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        ...style,
      }}
    >
      {label}
    </p>
  )
}

// Next Up Card Component
function NextUpCard({
  primaryColor,
  scale = 0.7,
}: {
  primaryColor: string
  scale?: number
}) {
  return (
    <div
      style={{
        backgroundColor: ios.colors.systemBackground,
        borderRadius: ios.radius.lg * scale,
        padding: 12 * scale,
        boxShadow: ios.shadow.card,
      }}
    >
      <div className="flex items-center justify-between">
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 9 * scale,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.3 * scale,
              color: primaryColor,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
          >
            9:00 AM • Main Stage
          </p>
          <p
            style={{
              fontSize: 13 * scale,
              fontWeight: 600,
              color: ios.colors.label,
              marginTop: 2 * scale,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
          >
            Opening Keynote
          </p>
          <p
            style={{
              fontSize: 11 * scale,
              color: ios.colors.secondaryLabel,
              marginTop: 1 * scale,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
          >
            Dr. Sarah Chen
          </p>
        </div>
        <div
          style={{
            width: 32 * scale,
            height: 32 * scale,
            borderRadius: 16 * scale,
            backgroundColor: `${primaryColor}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight
            size={16 * scale}
            color={primaryColor}
            strokeWidth={2.5}
          />
        </div>
      </div>
    </div>
  )
}

// Quick Stats Card Component
function QuickStatsCard({
  primaryColor,
  scale = 0.7,
}: {
  primaryColor: string
  scale?: number
}) {
  const stats = [
    { label: 'Sessions', value: '48', emoji: '📅' },
    { label: 'Speakers', value: '24', emoji: '🎤' },
    { label: 'Attendees', value: '500+', emoji: '👥' },
  ]

  return (
    <div
      style={{
        backgroundColor: ios.colors.systemBackground,
        borderRadius: ios.radius.lg * scale,
        overflow: 'hidden',
        boxShadow: ios.shadow.card,
      }}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${10 * scale}px ${12 * scale}px`,
            borderBottom: index < stats.length - 1
              ? `0.5px solid ${ios.colors.separator}`
              : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 * scale }}>
            <span style={{ fontSize: 14 * scale }}>{stat.emoji}</span>
            <span
              style={{
                fontSize: 12 * scale,
                color: ios.colors.label,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              {stat.label}
            </span>
          </div>
          <span
            style={{
              fontSize: 12 * scale,
              fontWeight: 600,
              color: primaryColor,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  )
}
