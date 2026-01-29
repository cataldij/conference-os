'use client'

import { ReactNode, useState } from 'react'
import {
  Home,
  Calendar,
  Users,
  Map,
  Info,
  type LucideIcon,
} from 'lucide-react'

const TAB_ICONS: Record<string, LucideIcon> = {
  Home,
  Agenda: Calendar,
  People: Users,
  Map,
  Info,
}

interface Tab {
  id: string
  label: string
  icon: string
}

interface AppColors {
  primary: string
  background: string
  surface: string
  text: string
  textMuted: string
  border: string
}

interface AttendeeAppShellProps {
  tabs: Tab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  colors: AppColors
  children: ReactNode
}

export function AttendeeAppShell({
  tabs,
  activeTabId,
  onTabChange,
  colors,
  children,
}: AttendeeAppShellProps) {
  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: colors.background }}
    >
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* iOS-style Tab Bar with blur */}
      <div
        className="relative shrink-0"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Hairline divider */}
        <div
          className="absolute top-0 left-0 right-0 h-[0.5px]"
          style={{ backgroundColor: colors.border }}
        />

        {/* Blur background */}
        <div
          className="flex h-[52px] items-center justify-around px-2"
          style={{
            backgroundColor: `${colors.background}e6`, // 90% opacity
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          {tabs.map((tab) => {
            const Icon = TAB_ICONS[tab.icon] || TAB_ICONS[tab.label] || Home
            const isActive = tab.id === activeTabId

            return (
              <button
                key={tab.id}
                className="flex flex-col items-center justify-center px-4 py-1 transition-opacity focus:outline-none active:opacity-70"
                onClick={() => onTabChange(tab.id)}
              >
                <Icon
                  className="h-[22px] w-[22px] transition-colors"
                  style={{
                    color: isActive ? colors.primary : colors.textMuted,
                  }}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span
                  className="mt-0.5 text-[10px] font-medium transition-colors"
                  style={{
                    color: isActive ? colors.primary : colors.textMuted,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
