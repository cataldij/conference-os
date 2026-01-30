'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Users } from 'lucide-react'
import { ios } from './tokens'
import { IOSText, IOSCard } from './ios-primitives'
import { useConferenceThemeOptional, type ConferenceTheme } from './theme-provider'

// Hero Card Props
interface HeroCardProps {
  name?: string
  tagline?: string
  bannerUrl?: string | null
  logoUrl?: string | null
  startDate?: string
  endDate?: string
  venueName?: string
  attendeeCount?: number
  primaryColor?: string
  style?: React.CSSProperties
}

export function HeroCard({
  name,
  tagline,
  bannerUrl,
  logoUrl,
  startDate,
  endDate,
  venueName,
  attendeeCount,
  primaryColor,
  style,
}: HeroCardProps) {
  const themeContext = useConferenceThemeOptional()

  // Use props or fall back to theme context
  const displayName = name || themeContext?.theme.name || 'Your Conference'
  const displayTagline = tagline || themeContext?.theme.tagline || 'An amazing event awaits'
  const displayBanner = bannerUrl ?? themeContext?.theme.bannerUrl
  const displayLogo = logoUrl ?? themeContext?.theme.logoUrl
  const color = primaryColor || themeContext?.colors.primary || ios.colors.systemBlue

  return (
    <motion.div
      style={{
        position: 'relative',
        borderRadius: ios.radius.xl,
        overflow: 'hidden',
        boxShadow: ios.shadow.lg,
        ...style,
      }}
      whileHover={{ scale: 1.01 }}
      transition={ios.animation.spring.gentle}
    >
      {/* Background Image or Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: displayBanner
            ? `url(${displayBanner}) center/cover`
            : `linear-gradient(135deg, ${color}, ${adjustColor(color, -30)})`,
        }}
      />

      {/* Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          padding: 20,
          minHeight: 160,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {/* Logo (if available) */}
        {displayLogo && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 48,
              height: 48,
              borderRadius: ios.radius.md,
              overflow: 'hidden',
              boxShadow: ios.shadow.sm,
            }}
          >
            <img
              src={displayLogo}
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Event Name */}
        <IOSText
          variant="title1"
          color="#FFFFFF"
          as="h1"
          style={{
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            marginBottom: 4,
          }}
        >
          {displayName}
        </IOSText>

        {/* Tagline */}
        <IOSText
          variant="subheadline"
          color="rgba(255,255,255,0.9)"
          style={{
            textShadow: '0 1px 4px rgba(0,0,0,0.2)',
            marginBottom: 12,
          }}
        >
          {displayTagline}
        </IOSText>

        {/* Meta Info Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {startDate && (
            <MetaItem icon={<Calendar size={14} color="rgba(255,255,255,0.9)" />}>
              {formatDateRange(startDate, endDate)}
            </MetaItem>
          )}

          {venueName && (
            <MetaItem icon={<MapPin size={14} color="rgba(255,255,255,0.9)" />}>
              {venueName}
            </MetaItem>
          )}

          {attendeeCount !== undefined && attendeeCount > 0 && (
            <MetaItem icon={<Users size={14} color="rgba(255,255,255,0.9)" />}>
              {attendeeCount.toLocaleString()} attending
            </MetaItem>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Meta Item Component
interface MetaItemProps {
  icon: React.ReactNode
  children: React.ReactNode
}

function MetaItem({ icon, children }: MetaItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 6,
        backdropFilter: 'blur(4px)',
      }}
    >
      {icon}
      <IOSText variant="caption1" color="rgba(255,255,255,0.95)" weight={500}>
        {children}
      </IOSText>
    </div>
  )
}

// Compact Hero Card for preview
interface CompactHeroCardProps extends HeroCardProps {
  scale?: number
}

export function CompactHeroCard({
  name,
  tagline,
  bannerUrl,
  logoUrl,
  startDate,
  endDate,
  venueName,
  attendeeCount,
  primaryColor,
  scale = 0.7,
  style,
}: CompactHeroCardProps) {
  const themeContext = useConferenceThemeOptional()

  const displayName = name || themeContext?.theme.name || 'Your Conference'
  const displayTagline = tagline || themeContext?.theme.tagline || 'An amazing event awaits'
  const displayBanner = bannerUrl ?? themeContext?.theme.bannerUrl
  const displayLogo = logoUrl ?? themeContext?.theme.logoUrl
  const color = primaryColor || themeContext?.colors.primary || ios.colors.systemBlue

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: ios.radius.lg * scale,
        overflow: 'hidden',
        boxShadow: `0 ${4 * scale}px ${12 * scale}px rgba(0,0,0,0.12)`,
        ...style,
      }}
    >
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: displayBanner
            ? `url(${displayBanner}) center/cover`
            : `linear-gradient(135deg, ${color}, ${adjustColor(color, -30)})`,
        }}
      />

      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          padding: 12 * scale,
          minHeight: 100 * scale,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {/* Logo */}
        {displayLogo && (
          <div
            style={{
              position: 'absolute',
              top: 10 * scale,
              right: 10 * scale,
              width: 32 * scale,
              height: 32 * scale,
              borderRadius: ios.radius.sm * scale,
              overflow: 'hidden',
              boxShadow: ios.shadow.sm,
            }}
          >
            <img
              src={displayLogo}
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Name */}
        <span
          style={{
            fontSize: 16 * scale,
            fontWeight: 700,
            color: '#FFFFFF',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
            textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            marginBottom: 2 * scale,
          }}
        >
          {displayName}
        </span>

        {/* Tagline */}
        <span
          style={{
            fontSize: 11 * scale,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.9)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        >
          {displayTagline}
        </span>
      </div>
    </div>
  )
}

// Helper: Adjust color brightness
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, Math.max(0, (num >> 16) + amt))
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt))
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt))
  return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)
}

// Helper: Format date range
function formatDateRange(start: string, end?: string): string {
  const startDate = new Date(start)
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }

  if (!end || start === end) {
    return startDate.toLocaleDateString('en-US', options)
  }

  const endDate = new Date(end)
  const startMonth = startDate.getMonth()
  const endMonth = endDate.getMonth()

  if (startMonth === endMonth) {
    return `${startDate.toLocaleDateString('en-US', { month: 'short' })} ${startDate.getDate()}-${endDate.getDate()}`
  }

  return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`
}
