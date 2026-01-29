'use client'

import { useBuilder } from '@/contexts/builder-context'
import {
  Calendar,
  MapPin,
  Users,
  Home,
  Building2,
  MessageCircle,
  Map,
  Bell,
  User,
  ChevronRight,
} from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  Home,
  Calendar,
  Users,
  Building2,
  MessageCircle,
  Map,
  Bell,
  User,
}

export function BuilderPreview() {
  const { state } = useBuilder()
  const { overview, design, navigation } = state
  const { tokens, gradients } = design

  const colors = tokens?.colors || {}
  const typography = tokens?.typography || {}
  const enabledModules = navigation.filter(m => m.enabled).sort((a, b) => a.order - b.order)

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-slate-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-600">Live Preview</h3>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          Mobile
        </span>
      </div>

      {/* Phone Frame */}
      <div className="flex-1 overflow-hidden">
        <div
          className="mx-auto h-full w-[280px] overflow-hidden rounded-[32px] border-[8px] border-slate-800 shadow-2xl"
          style={{ backgroundColor: colors.background || '#ffffff' }}
        >
          {/* Status Bar */}
          <div className="flex h-6 items-center justify-between bg-slate-800 px-4 text-[10px] text-white">
            <span>9:41</span>
            <div className="flex gap-1">
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>

          {/* App Content */}
          <div className="flex h-[calc(100%-6rem)] flex-col overflow-hidden">
            {/* Header with gradient */}
            <div
              className="shrink-0 p-4 pb-6"
              style={{ background: gradients?.hero || colors.primary }}
            >
              <p
                className="text-lg font-bold text-white"
                style={{ fontFamily: typography?.fontFamily?.heading }}
              >
                {overview.name || 'Conference Name'}
              </p>
              <p className="mt-0.5 text-xs text-white/80">
                {overview.tagline || 'Your tagline here'}
              </p>
              <div className="mt-3 flex items-center gap-3 text-[10px] text-white/70">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {overview.startDate ? new Date(overview.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Sep 15'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {overview.venueName || 'Venue'}
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div
              className="flex-1 -mt-3 overflow-y-auto rounded-t-2xl p-3"
              style={{ backgroundColor: colors.background || '#ffffff' }}
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Sessions', value: '48' },
                  { label: 'Speakers', value: '24' },
                  { label: 'Attendees', value: '500+' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-2 text-center"
                    style={{ backgroundColor: colors.surface || '#f8fafc' }}
                  >
                    <p
                      className="text-sm font-bold"
                      style={{ color: colors.primary }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="text-[9px]"
                      style={{ color: colors.textMuted || '#64748b' }}
                    >
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Sample Content */}
              <div className="mt-3 space-y-2">
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: colors.text,
                    fontFamily: typography?.fontFamily?.heading,
                  }}
                >
                  Upcoming Sessions
                </p>
                {[
                  { title: 'Keynote: AI Future', time: '9:00 AM' },
                  { title: 'Panel: Tech Trends', time: '11:00 AM' },
                ].map((session) => (
                  <div
                    key={session.title}
                    className="flex items-center justify-between rounded-lg p-2"
                    style={{
                      backgroundColor: colors.surface || '#f8fafc',
                      borderLeft: `3px solid ${colors.primary}`,
                    }}
                  >
                    <div>
                      <p
                        className="text-[10px] font-medium"
                        style={{ color: colors.text }}
                      >
                        {session.title}
                      </p>
                      <p
                        className="text-[9px]"
                        style={{ color: colors.textMuted }}
                      >
                        {session.time}
                      </p>
                    </div>
                    <ChevronRight
                      className="h-3 w-3"
                      style={{ color: colors.textMuted }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div
            className="flex h-14 items-center justify-around border-t px-2"
            style={{
              backgroundColor: colors.background || '#ffffff',
              borderColor: colors.border || '#e2e8f0',
            }}
          >
            {enabledModules.slice(0, 5).map((module, index) => {
              const Icon = ICON_MAP[module.icon] || Home
              const isActive = index === 0
              return (
                <div
                  key={module.id}
                  className="flex flex-col items-center"
                >
                  <Icon
                    className="h-4 w-4"
                    style={{ color: isActive ? colors.primary : colors.textMuted }}
                  />
                  <span
                    className="mt-0.5 text-[8px]"
                    style={{ color: isActive ? colors.primary : colors.textMuted }}
                  >
                    {module.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
