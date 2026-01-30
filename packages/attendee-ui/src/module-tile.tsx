'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Users,
  Building2,
  Map,
  MessageCircle,
  Bell,
  Ticket,
  type LucideIcon,
} from 'lucide-react'
import { ios } from './tokens'
import { IOSText } from './ios-primitives'
import { useConferenceThemeOptional } from './theme-provider'

// Module configuration
export interface ModuleConfig {
  id: string
  label: string
  icon: LucideIcon
  gradient: [string, string]
  description?: string
}

// Default module configurations
export const moduleConfigs: Record<string, ModuleConfig> = {
  agenda: {
    id: 'agenda',
    label: 'Agenda',
    icon: Calendar,
    gradient: ['#FF6B6B', '#FF8E53'],
    description: 'View sessions & schedule',
  },
  speakers: {
    id: 'speakers',
    label: 'Speakers',
    icon: Users,
    gradient: ['#4FACFE', '#00F2FE'],
    description: 'Meet our speakers',
  },
  sponsors: {
    id: 'sponsors',
    label: 'Sponsors',
    icon: Building2,
    gradient: ['#43E97B', '#38F9D7'],
    description: 'Our partners',
  },
  map: {
    id: 'map',
    label: 'Venue Map',
    icon: Map,
    gradient: ['#FA709A', '#FEE140'],
    description: 'Find your way',
  },
  networking: {
    id: 'networking',
    label: 'Networking',
    icon: MessageCircle,
    gradient: ['#667EEA', '#764BA2'],
    description: 'Connect with attendees',
  },
  announcements: {
    id: 'announcements',
    label: 'Announcements',
    icon: Bell,
    gradient: ['#F093FB', '#F5576C'],
    description: 'Latest updates',
  },
  tickets: {
    id: 'tickets',
    label: 'My Ticket',
    icon: Ticket,
    gradient: ['#5EE7DF', '#B490CA'],
    description: 'Your conference pass',
  },
}

// Module Tile Props
interface ModuleTileProps {
  module: ModuleConfig | string
  onPress?: () => void
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
  className?: string
  style?: React.CSSProperties
}

export function ModuleTile({
  module,
  onPress,
  size = 'md',
  showDescription = false,
  style,
}: ModuleTileProps) {
  const config = typeof module === 'string' ? moduleConfigs[module] : module

  if (!config) {
    console.warn(`Module "${module}" not found in moduleConfigs`)
    return null
  }

  const themeContext = useConferenceThemeOptional()
  const primaryColor = themeContext?.colors.primary || ios.colors.systemBlue

  const Icon = config.icon

  const sizes = {
    sm: {
      width: 72,
      height: 72,
      iconSize: 24,
      padding: 12,
      borderRadius: ios.radius.md,
      fontSize: 11,
      gap: 4,
    },
    md: {
      width: 88,
      height: 88,
      iconSize: 28,
      padding: 14,
      borderRadius: ios.radius.lg,
      fontSize: 12,
      gap: 6,
    },
    lg: {
      width: 100,
      height: 100,
      iconSize: 32,
      padding: 16,
      borderRadius: ios.radius.xl,
      fontSize: 13,
      gap: 8,
    },
  }

  const sizeConfig = sizes[size]

  return (
    <motion.button
      onClick={onPress}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizeConfig.gap,
        width: sizeConfig.width,
        padding: sizeConfig.padding,
        background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
        borderRadius: sizeConfig.borderRadius,
        border: 'none',
        cursor: 'pointer',
        boxShadow: ios.shadow.md,
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      whileHover={{ scale: 1.05, boxShadow: ios.shadow.lg }}
      whileTap={{ scale: 0.95 }}
      transition={ios.animation.spring.snappy}
    >
      <Icon size={sizeConfig.iconSize} color="#FFFFFF" strokeWidth={2} />
      <IOSText
        variant="caption1"
        color="#FFFFFF"
        weight={600}
        align="center"
        style={{
          fontSize: sizeConfig.fontSize,
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        {config.label}
      </IOSText>
    </motion.button>
  )
}

// Module Grid for Home Screen
interface ModuleGridProps {
  modules?: string[]
  onModulePress?: (moduleId: string) => void
  columns?: 2 | 3 | 4
  size?: 'sm' | 'md' | 'lg'
  gap?: number
  style?: React.CSSProperties
}

export function ModuleGrid({
  modules = ['agenda', 'speakers', 'sponsors', 'map', 'networking', 'announcements'],
  onModulePress,
  columns = 3,
  size = 'md',
  gap = 16,
  style,
}: ModuleGridProps) {
  const themeContext = useConferenceThemeOptional()

  // Filter modules based on theme settings if available
  const enabledModules = themeContext
    ? modules.filter((id) => {
        const moduleKey = id as keyof typeof themeContext.theme.modules
        return themeContext.theme.modules[moduleKey] !== false
      })
    : modules

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        justifyItems: 'center',
        ...style,
      }}
    >
      {enabledModules.map((moduleId) => (
        <ModuleTile
          key={moduleId}
          module={moduleId}
          size={size}
          onPress={() => onModulePress?.(moduleId)}
        />
      ))}
    </div>
  )
}

// Compact Module Tile for smaller previews
interface CompactModuleTileProps {
  module: ModuleConfig | string
  onPress?: () => void
  scale?: number
  style?: React.CSSProperties
}

export function CompactModuleTile({
  module,
  onPress,
  scale = 0.7,
  style,
}: CompactModuleTileProps) {
  const config = typeof module === 'string' ? moduleConfigs[module] : module

  if (!config) return null

  const Icon = config.icon

  const baseSize = 72
  const baseIconSize = 24
  const baseFontSize = 10

  return (
    <motion.button
      onClick={onPress}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3 * scale,
        width: baseSize * scale,
        height: baseSize * scale,
        padding: 8 * scale,
        background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
        borderRadius: ios.radius.md * scale,
        border: 'none',
        cursor: 'pointer',
        boxShadow: `0 ${2 * scale}px ${6 * scale}px rgba(0,0,0,0.1)`,
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      whileTap={{ scale: 0.95 }}
      transition={ios.animation.spring.snappy}
    >
      <Icon size={baseIconSize * scale} color="#FFFFFF" strokeWidth={2} />
      <span
        style={{
          fontSize: baseFontSize * scale,
          fontWeight: 600,
          color: '#FFFFFF',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        {config.label}
      </span>
    </motion.button>
  )
}

// Compact Grid for preview
interface CompactModuleGridProps {
  modules?: string[]
  onModulePress?: (moduleId: string) => void
  columns?: 2 | 3
  scale?: number
  gap?: number
  style?: React.CSSProperties
}

export function CompactModuleGrid({
  modules = ['agenda', 'speakers', 'sponsors', 'map', 'networking', 'announcements'],
  onModulePress,
  columns = 3,
  scale = 0.7,
  gap = 8,
  style,
}: CompactModuleGridProps) {
  const themeContext = useConferenceThemeOptional()

  const enabledModules = themeContext
    ? modules.filter((id) => {
        const moduleKey = id as keyof typeof themeContext.theme.modules
        return themeContext.theme.modules[moduleKey] !== false
      })
    : modules

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gap * scale,
        justifyItems: 'center',
        ...style,
      }}
    >
      {enabledModules.map((moduleId) => (
        <CompactModuleTile
          key={moduleId}
          module={moduleId}
          scale={scale}
          onPress={() => onModulePress?.(moduleId)}
        />
      ))}
    </div>
  )
}
