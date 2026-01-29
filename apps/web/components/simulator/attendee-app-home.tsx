'use client'

import { Calendar, MapPin, ChevronRight } from 'lucide-react'
import { ModuleTile } from './module-tile'

interface AppColors {
  primary: string
  background: string
  surface: string
  text: string
  textMuted: string
  border: string
}

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
  venueName?: string
  colors: AppColors
  fontFamily?: string
  gradientHero?: string
  modules: NavigationModule[]
  onModuleTap?: (moduleId: string) => void
}

export function AttendeeAppHome({
  eventName,
  tagline,
  startDate,
  venueName,
  colors,
  fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
  gradientHero,
  modules,
  onModuleTap,
}: AttendeeAppHomeProps) {
  const enabledModules = modules.filter(m => m.enabled).sort((a, b) => a.order - b.order)

  // Format date to look iOS-native
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Today'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div
      className="flex h-full flex-col"
      style={{
        backgroundColor: colors.background,
        fontFamily,
      }}
    >
      {/* iOS-style overscroll bounce */}
      <div
        className="flex-1 overflow-y-auto overscroll-y-contain"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Header with gradient */}
        <div
          className="relative px-5 pb-8 pt-4"
          style={{
            background: gradientHero || colors.primary,
          }}
        >
          {/* Profile circle (fake) */}
          <div className="flex justify-end mb-3">
            <div
              className="h-8 w-8 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            />
          </div>

          {/* Event name */}
          <h1
            className="text-[22px] font-bold text-white leading-tight"
            style={{ fontFamily }}
          >
            {eventName || 'Conference Name'}
          </h1>

          {tagline && (
            <p className="mt-1 text-[13px] text-white/80 leading-snug">
              {tagline}
            </p>
          )}

          {/* Date and location pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
              <Calendar className="h-3.5 w-3.5 text-white/90" />
              <span className="text-[12px] font-medium text-white">
                {formatDate(startDate)}
              </span>
            </div>
            {venueName && (
              <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5 text-white/90" />
                <span className="text-[12px] font-medium text-white">
                  {venueName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content area - overlaps header slightly for iOS feel */}
        <div
          className="relative -mt-4 min-h-0 rounded-t-[24px] px-4 pt-5 pb-4"
          style={{
            backgroundColor: colors.background,
          }}
        >
          {/* "Next Up" card - iOS grouped style */}
          <div className="mb-5">
            <p
              className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide"
              style={{ color: colors.textMuted }}
            >
              Next Up
            </p>
            <div
              className="rounded-[20px] p-4"
              style={{
                backgroundColor: colors.surface,
                boxShadow: `
                  0 1px 3px rgba(0,0,0,0.04),
                  0 4px 12px rgba(0,0,0,0.04)
                `,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: colors.primary }}
                  >
                    9:00 AM • Main Stage
                  </p>
                  <p
                    className="mt-1 text-[15px] font-semibold leading-snug"
                    style={{ color: colors.text }}
                  >
                    Opening Keynote
                  </p>
                  <p
                    className="mt-0.5 text-[13px]"
                    style={{ color: colors.textMuted }}
                  >
                    Dr. Sarah Chen
                  </p>
                </div>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <ChevronRight
                    className="h-5 w-5"
                    style={{ color: colors.primary }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Module tiles grid */}
          <div>
            <p
              className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide"
              style={{ color: colors.textMuted }}
            >
              Explore
            </p>
            <div className="grid grid-cols-2 gap-3">
              {enabledModules.slice(0, 6).map((module) => (
                <ModuleTile
                  key={module.id}
                  name={module.name}
                  icon={module.icon}
                  primaryColor={colors.primary}
                  surfaceColor={colors.surface}
                  textColor={colors.text}
                  borderColor={colors.border}
                  onTap={() => onModuleTap?.(module.id)}
                />
              ))}
            </div>
          </div>

          {/* Quick stats - iOS grouped section */}
          <div className="mt-5">
            <p
              className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide"
              style={{ color: colors.textMuted }}
            >
              At a Glance
            </p>
            <div
              className="rounded-[20px] overflow-hidden"
              style={{
                backgroundColor: colors.surface,
                boxShadow: `
                  0 1px 3px rgba(0,0,0,0.04),
                  0 4px 12px rgba(0,0,0,0.04)
                `,
                border: `1px solid ${colors.border}`,
              }}
            >
              {[
                { label: 'Sessions', value: '48', icon: '📅' },
                { label: 'Speakers', value: '24', icon: '🎤' },
                { label: 'Attendees', value: '500+', icon: '👥' },
              ].map((stat, index, arr) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    borderBottom: index < arr.length - 1 ? `1px solid ${colors.border}` : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[18px]">{stat.icon}</span>
                    <span
                      className="text-[15px]"
                      style={{ color: colors.text }}
                    >
                      {stat.label}
                    </span>
                  </div>
                  <span
                    className="text-[15px] font-semibold"
                    style={{ color: colors.primary }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
