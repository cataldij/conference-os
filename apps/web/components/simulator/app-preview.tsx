'use client'

import { useState } from 'react'
import { Smartphone, Monitor, RotateCcw } from 'lucide-react'
import { IphoneSimulator } from './iphone-simulator'
import { AttendeeAppShell } from './attendee-app-shell'
import { AttendeeAppHome } from './attendee-app-home'

interface NavigationModule {
  id: string
  name: string
  icon: string
  enabled: boolean
  order: number
}

interface PreviewConfig {
  eventName: string
  tagline?: string
  startDate?: string
  venueName?: string
  colors: {
    primary: string
    background: string
    surface: string
    text: string
    textMuted: string
    border: string
  }
  fontFamily?: string
  gradientHero?: string
  modules: NavigationModule[]
}

interface AppPreviewProps {
  config: PreviewConfig
  className?: string
}

type DeviceType = 'iphone' | 'desktop'
type TabId = 'home' | 'agenda' | 'people' | 'map' | 'info'

const DEFAULT_TABS = [
  { id: 'home', label: 'Home', icon: 'Home' },
  { id: 'agenda', label: 'Agenda', icon: 'Agenda' },
  { id: 'people', label: 'People', icon: 'People' },
  { id: 'map', label: 'Map', icon: 'Map' },
  { id: 'info', label: 'Info', icon: 'Info' },
]

export function AppPreview({ config, className = '' }: AppPreviewProps) {
  const [device, setDevice] = useState<DeviceType>('iphone')
  const [activeTab, setActiveTab] = useState<TabId>('home')

  const renderAppContent = () => {
    // For now, all tabs show home - can extend later
    return (
      <AttendeeAppHome
        eventName={config.eventName}
        tagline={config.tagline}
        startDate={config.startDate}
        venueName={config.venueName}
        colors={config.colors}
        fontFamily={config.fontFamily}
        gradientHero={config.gradientHero}
        modules={config.modules}
        onModuleTap={(moduleId) => console.log('Module tapped:', moduleId)}
      />
    )
  }

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Live App Preview
          </h3>
          <p className="text-xs text-slate-500">
            Real attendee UI • Updates instantly
          </p>
        </div>

        {/* Device toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
              device === 'iphone'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setDevice('iphone')}
          >
            <Smartphone className="h-3.5 w-3.5" />
            iPhone
          </button>
          <button
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
              device === 'desktop'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setDevice('desktop')}
          >
            <Monitor className="h-3.5 w-3.5" />
            Desktop
          </button>
        </div>
      </div>

      {/* Preview container */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-4">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Device preview */}
        <div className="relative flex h-full items-center justify-center">
          {device === 'iphone' ? (
            <IphoneSimulator>
              <AttendeeAppShell
                tabs={DEFAULT_TABS}
                activeTabId={activeTab}
                onTabChange={(id) => setActiveTab(id as TabId)}
                colors={config.colors}
              >
                {renderAppContent()}
              </AttendeeAppShell>
            </IphoneSimulator>
          ) : (
            <DesktopPreview config={config} activeTab={activeTab} onTabChange={setActiveTab} />
          )}
        </div>

        {/* Refresh hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] text-slate-500 shadow-sm backdrop-blur-sm">
          <RotateCcw className="h-3 w-3" />
          Auto-refresh
        </div>
      </div>
    </div>
  )
}

// Desktop preview component
function DesktopPreview({
  config,
  activeTab,
  onTabChange,
}: {
  config: PreviewConfig
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  return (
    <div className="w-full max-w-[520px]">
      {/* Browser chrome */}
      <div
        className="rounded-t-xl p-2"
        style={{
          background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
          borderBottom: '1px solid #dee2e6',
        }}
      >
        <div className="flex items-center gap-2">
          {/* Traffic lights */}
          <div className="flex gap-1.5 px-1">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <div className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>

          {/* URL bar */}
          <div className="flex-1">
            <div className="flex items-center gap-2 rounded-md bg-white/80 px-3 py-1.5">
              <svg className="h-3 w-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-[11px] text-slate-500">
                {config.eventName.toLowerCase().replace(/\s+/g, '')}.confapp.io
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Browser content */}
      <div
        className="overflow-hidden rounded-b-xl shadow-2xl"
        style={{
          height: '360px',
          backgroundColor: config.colors.background,
        }}
      >
        {/* Desktop navigation bar */}
        <div
          className="flex items-center justify-between border-b px-6 py-3"
          style={{
            backgroundColor: config.colors.surface,
            borderColor: config.colors.border,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold"
              style={{ backgroundColor: config.colors.primary }}
            >
              {config.eventName.charAt(0)}
            </div>
            <span
              className="text-sm font-semibold"
              style={{ color: config.colors.text }}
            >
              {config.eventName}
            </span>
          </div>

          {/* Desktop tabs */}
          <div className="flex items-center gap-1">
            {DEFAULT_TABS.slice(0, 4).map((tab) => (
              <button
                key={tab.id}
                className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === tab.id ? `${config.colors.primary}15` : 'transparent',
                  color: activeTab === tab.id ? config.colors.primary : config.colors.textMuted,
                }}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* User avatar */}
          <div
            className="h-7 w-7 rounded-full"
            style={{ backgroundColor: `${config.colors.primary}20` }}
          />
        </div>

        {/* Desktop content */}
        <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 56px)' }}>
          {/* Hero banner */}
          <div
            className="rounded-xl p-4 mb-4"
            style={{
              background: config.gradientHero || config.colors.primary,
            }}
          >
            <h2 className="text-lg font-bold text-white">
              {config.eventName}
            </h2>
            {config.tagline && (
              <p className="mt-1 text-xs text-white/80">{config.tagline}</p>
            )}
          </div>

          {/* Module grid */}
          <div className="grid grid-cols-3 gap-3">
            {config.modules
              .filter((m) => m.enabled)
              .slice(0, 6)
              .map((module) => (
                <div
                  key={module.id}
                  className="rounded-xl p-3 cursor-pointer transition-shadow hover:shadow-md"
                  style={{
                    backgroundColor: config.colors.surface,
                    border: `1px solid ${config.colors.border}`,
                  }}
                >
                  <div
                    className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${config.colors.primary}15` }}
                  >
                    <span style={{ color: config.colors.primary }}>●</span>
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: config.colors.text }}
                  >
                    {module.name}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
