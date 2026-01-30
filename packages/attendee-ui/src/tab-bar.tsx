'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  Calendar,
  Users,
  Map,
  User,
  type LucideIcon,
} from 'lucide-react'
import { ios } from './tokens'
import { IOSBlurView, IOSText } from './ios-primitives'
import { useConferenceThemeOptional } from './theme-provider'

// Tab configuration
export interface TabItem {
  id: string
  label: string
  icon: LucideIcon
}

// Default tabs
export const defaultTabs: TabItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'speakers', label: 'Speakers', icon: Users },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'profile', label: 'Profile', icon: User },
]

interface TabBarProps {
  tabs?: TabItem[]
  activeTab: string
  onTabChange?: (tabId: string) => void
  accentColor?: string
  showLabels?: boolean
  className?: string
  style?: React.CSSProperties
}

export function TabBar({
  tabs = defaultTabs,
  activeTab,
  onTabChange,
  accentColor,
  showLabels = true,
  style,
}: TabBarProps) {
  const themeContext = useConferenceThemeOptional()
  const primaryColor = accentColor || themeContext?.colors.primary || ios.colors.systemBlue

  return (
    <IOSBlurView
      intensity="prominent"
      tint="light"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: ios.spacing.tabBarHeight,
        borderTop: `0.5px solid ${ios.colors.separator}`,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-around',
          height: '100%',
          paddingTop: 6,
          paddingBottom: ios.spacing.safeAreaBottom,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          const color = isActive ? primaryColor : ios.colors.systemGray

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '4px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
              whileTap={{ scale: 0.9 }}
              transition={ios.animation.spring.snappy}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={ios.animation.spring.snappy}
              >
                <Icon
                  size={24}
                  color={color}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>

              {showLabels && (
                <IOSText
                  variant="caption2"
                  color={color}
                  weight={isActive ? 600 : 400}
                  style={{
                    marginTop: 1,
                  }}
                >
                  {tab.label}
                </IOSText>
              )}
            </motion.button>
          )
        })}
      </div>
    </IOSBlurView>
  )
}

// Compact variant for smaller preview
interface CompactTabBarProps extends Omit<TabBarProps, 'showLabels'> {
  scale?: number
}

export function CompactTabBar({
  tabs = defaultTabs,
  activeTab,
  onTabChange,
  accentColor,
  scale = 1,
  style,
}: CompactTabBarProps) {
  const themeContext = useConferenceThemeOptional()
  const primaryColor = accentColor || themeContext?.colors.primary || ios.colors.systemBlue

  const scaledHeight = ios.spacing.tabBarHeight * scale
  const scaledSafeArea = ios.spacing.safeAreaBottom * scale

  return (
    <IOSBlurView
      intensity="prominent"
      tint="light"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: scaledHeight,
        borderTop: `0.5px solid ${ios.colors.separator}`,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-around',
          height: '100%',
          paddingTop: 4 * scale,
          paddingBottom: scaledSafeArea,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          const color = isActive ? primaryColor : ios.colors.systemGray

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1 * scale,
                padding: `${2 * scale}px ${8 * scale}px`,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
              whileTap={{ scale: 0.9 }}
              transition={ios.animation.spring.snappy}
            >
              <Icon
                size={20 * scale}
                color={color}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                style={{
                  fontSize: 9 * scale,
                  fontWeight: isActive ? 600 : 400,
                  color,
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </IOSBlurView>
  )
}
