'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { IPhoneMockup, IPhoneStatusBar } from '@/components/ui/iphone-mockup'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ArrowRight,
  Play,
  Smartphone,
  Monitor,
  Tablet,
  Palette,
  Layers,
  Eye,
  Settings,
  Sparkles,
  Check,
  RotateCcw,
  Download,
  Share2,
  Zap,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react'

type DeviceType = 'iphone' | 'tablet' | 'desktop'
type ThemeMode = 'light' | 'dark'

interface Conference {
  id: string
  name: string
  tagline?: string
}

interface Session {
  id: string
  title: string
  description?: string
  room?: string
  track?: string
}

interface Track {
  id: string
  name: string
  color: string
}

interface DesignTokens {
  colors: {
    primary: string
    background: string
    surface: string
    text: string
    textMuted: string
    border: string
    accent: string
  }
}

const DEFAULT_TOKENS: DesignTokens = {
  colors: {
    primary: '#6366f1',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    accent: '#10b981',
  },
}

const DEFAULT_GRADIENTS = {
  hero: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  accent: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
}

export default function PreviewPage() {
  const [device, setDevice] = useState<DeviceType>('iphone')
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [activePanel, setActivePanel] = useState<'design' | 'content' | 'settings'>('design')
  const [isAnimating, setIsAnimating] = useState(false)
  const [loading, setLoading] = useState(true)

  const [conference, setConference] = useState<Conference | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [tokens, setTokens] = useState<DesignTokens>(DEFAULT_TOKENS)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Load first conference
        const { data: conferences } = await supabase
          .from('conferences')
          .select('id, name, tagline')
          .order('created_at', { ascending: false })
          .limit(1)

        if (conferences && conferences.length > 0) {
          const conf = conferences[0]
          setConference(conf)

          // Load sessions
          const { data: sessionsData } = await supabase
            .from('sessions')
            .select('id, title, description, room, track_id')
            .eq('conference_id', conf.id)
            .limit(6)

          if (sessionsData) {
            setSessions(sessionsData.map(s => ({
              id: s.id,
              title: s.title,
              description: s.description,
              room: s.room || 'Main Hall',
              track: 'General',
            })))
          }

          // Load tracks
          const { data: tracksData } = await supabase
            .from('tracks')
            .select('id, name, color')
            .eq('conference_id', conf.id)

          if (tracksData) {
            setTracks(tracksData)
          }

          // Load design tokens
          const { data: designData } = await supabase
            .from('design_tokens')
            .select('tokens')
            .eq('conference_id', conf.id)
            .eq('is_active', true)
            .single()

          if (designData?.tokens) {
            setTokens(designData.tokens as DesignTokens)
          }
        }
      } catch (error) {
        console.error('Error loading preview data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  const handleDeviceChange = (newDevice: DeviceType) => {
    if (newDevice !== device) {
      setIsAnimating(true)
      setTimeout(() => {
        setDevice(newDevice)
        setIsAnimating(false)
      }, 150)
    }
  }

  const deviceConfig = {
    iphone: { width: 375, height: 812, scale: 0.85 },
    tablet: { width: 768, height: 1024, scale: 0.55 },
    desktop: { width: 1280, height: 800, scale: 0.45 },
  }

  const { width, height, scale } = deviceConfig[device]
  const gradients = DEFAULT_GRADIENTS

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading Preview...</p>
        </div>
      </div>
    )
  }

  if (!conference) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <Eye className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No Conference Found</h2>
        <p className="text-muted-foreground">Create a conference first to preview it.</p>
        <Button asChild>
          <a href="/conferences/new">Create Conference</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Left Sidebar - Design Controls */}
      <aside className="w-72 border-r border-slate-200/80 bg-white/80 backdrop-blur-xl flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">App Designer</h2>
              <p className="text-xs text-slate-500">Build your conference app</p>
            </div>
          </div>
        </div>

        {/* Panel Tabs */}
        <div className="flex border-b border-slate-200/60">
          {[
            { id: 'design', icon: Palette, label: 'Design' },
            { id: 'content', icon: Layers, label: 'Content' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePanel(tab.id as typeof activePanel)}
              className={`flex-1 py-3 px-2 text-xs font-medium transition-all relative ${
                activePanel === tab.id
                  ? 'text-violet-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </div>
              {activePanel === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-violet-600 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <AnimatePresence mode="wait">
            {activePanel === 'design' && (
              <motion.div
                key="design"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Theme Toggle */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-2 block">Theme Mode</label>
                  <div className="flex rounded-lg bg-slate-100 p-1">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                        theme === 'light'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                        theme === 'dark'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </button>
                  </div>
                </div>

                {/* Current Colors */}
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-2 block">Current Colors</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div
                        className="h-10 w-10 mx-auto rounded-lg border border-slate-200"
                        style={{ backgroundColor: tokens.colors.primary }}
                      />
                      <span className="text-[10px] text-slate-500">Primary</span>
                    </div>
                    <div className="text-center">
                      <div
                        className="h-10 w-10 mx-auto rounded-lg border border-slate-200"
                        style={{ backgroundColor: tokens.colors.accent }}
                      />
                      <span className="text-[10px] text-slate-500">Accent</span>
                    </div>
                    <div className="text-center">
                      <div
                        className="h-10 w-10 mx-auto rounded-lg border border-slate-200"
                        style={{ backgroundColor: tokens.colors.background }}
                      />
                      <span className="text-[10px] text-slate-500">Background</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                    <a href="/design">Edit in Design Studio</a>
                  </Button>
                </div>
              </motion.div>
            )}

            {activePanel === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Sessions</span>
                    <span className="text-xs text-slate-500">{sessions.length}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {sessions.length > 0 ? `${sessions.length} sessions loaded` : 'No sessions yet'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Tracks</span>
                    <span className="text-xs text-slate-500">{tracks.length}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {tracks.length > 0 ? `${tracks.length} tracks defined` : 'No tracks yet'}
                  </p>
                </div>
              </motion.div>
            )}

            {activePanel === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="text-sm font-medium text-slate-700 block mb-2">Conference Name</label>
                  <input
                    type="text"
                    value={conference.name}
                    readOnly
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="text-sm font-medium text-slate-700 block mb-2">Tagline</label>
                  <input
                    type="text"
                    value={conference.tagline || ''}
                    readOnly
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/60 bg-slate-50/50">
          <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
            <Zap className="h-4 w-4 mr-2" />
            Publish App
          </Button>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 border-b border-slate-200/60 bg-white/60 backdrop-blur-xl flex items-center justify-between px-6">
          {/* Device Selector */}
          <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1">
            {[
              { id: 'iphone', icon: Smartphone, label: 'iPhone' },
              { id: 'tablet', icon: Tablet, label: 'iPad' },
              { id: 'desktop', icon: Monitor, label: 'Desktop' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => handleDeviceChange(d.id as DeviceType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  device === d.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <d.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            ))}
          </div>

          {/* Preview Title */}
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Live Preview</span>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: isAnimating ? 0.5 : 1,
              scale: isAnimating ? 0.98 : 1
            }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            {device === 'iphone' ? (
              <IPhoneMockup scale={scale} frameColor="black">
                <IPhoneStatusBar dark={theme === 'dark'} />
                <MobileAppPreview
                  conference={conference}
                  sessions={sessions}
                  tracks={tracks}
                  tokens={tokens}
                  gradients={gradients}
                  theme={theme}
                />
              </IPhoneMockup>
            ) : (
              <div
                className={`rounded-2xl overflow-hidden shadow-2xl border-8 ${
                  device === 'tablet' ? 'border-slate-800' : 'border-slate-300'
                }`}
                style={{
                  width: width * scale,
                  height: height * scale,
                  backgroundColor: theme === 'dark' ? '#0f172a' : tokens.colors.background,
                }}
              >
                <div
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width,
                    height,
                    overflow: 'auto',
                  }}
                >
                  <DesktopAppPreview
                    conference={conference}
                    sessions={sessions}
                    tracks={tracks}
                    tokens={tokens}
                    gradients={gradients}
                    theme={theme}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Status Bar */}
        <div className="h-10 border-t border-slate-200/60 bg-white/60 backdrop-blur-xl flex items-center justify-between px-6 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>Width: {width}px</span>
            <span>Height: {height}px</span>
            <span>Scale: {Math.round(scale * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Connected to database</span>
          </div>
        </div>
      </main>
    </div>
  )
}

// Mobile App Preview
function MobileAppPreview({
  conference,
  sessions,
  tracks,
  tokens,
  gradients,
  theme
}: {
  conference: Conference
  sessions: Session[]
  tracks: Track[]
  tokens: DesignTokens
  gradients: typeof DEFAULT_GRADIENTS
  theme: ThemeMode
}) {
  const bgColor = theme === 'dark' ? '#0f172a' : tokens.colors.background
  const textColor = theme === 'dark' ? '#f8fafc' : tokens.colors.text
  const mutedColor = theme === 'dark' ? '#94a3b8' : tokens.colors.textMuted
  const surfaceColor = theme === 'dark' ? '#1e293b' : tokens.colors.surface

  return (
    <div style={{ backgroundColor: bgColor, minHeight: '100%' }}>
      {/* Hero */}
      <div
        className="relative px-4 py-8 text-center"
        style={{ background: gradients.hero }}
      >
        <div className="inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-medium text-white mb-2">
          Coming Soon
        </div>
        <h1 className="text-lg font-bold text-white leading-tight">
          {conference.name}
        </h1>
        <p className="text-[11px] text-white/80 mt-1">
          {conference.tagline || 'Your amazing conference'}
        </p>
        <button
          className="mt-4 inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold text-white"
          style={{ backgroundColor: tokens.colors.accent }}
        >
          Register Now
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-4 py-3 border-b"
        style={{
          backgroundColor: surfaceColor,
          borderColor: theme === 'dark' ? '#334155' : tokens.colors.border
        }}
      >
        {[
          { label: 'Sessions', value: sessions.length || '0' },
          { label: 'Speakers', value: '0' },
          { label: 'Tracks', value: tracks.length || '0' },
          { label: 'Days', value: '1' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-sm font-bold" style={{ color: tokens.colors.primary }}>
              {stat.value}
            </div>
            <div className="text-[9px]" style={{ color: mutedColor }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tracks */}
      {tracks.length > 0 && (
        <div className="px-4 py-4">
          <h2 className="text-sm font-bold mb-3" style={{ color: textColor }}>
            Tracks
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex-shrink-0 rounded-xl px-3 py-2 text-center"
                style={{
                  backgroundColor: track.color + '15',
                  border: `1px solid ${track.color}30`,
                }}
              >
                <div
                  className="h-2 w-2 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: track.color }}
                />
                <div
                  className="text-[10px] font-semibold whitespace-nowrap"
                  style={{ color: track.color }}
                >
                  {track.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions */}
      {sessions.length > 0 && (
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold" style={{ color: textColor }}>
              Sessions
            </h2>
            <span className="text-[10px] font-medium" style={{ color: tokens.colors.primary }}>
              View All
            </span>
          </div>
          <div className="space-y-3">
            {sessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: surfaceColor,
                  border: `1px solid ${theme === 'dark' ? '#334155' : tokens.colors.border}`
                }}
              >
                <div className="p-3">
                  <h3
                    className="text-xs font-bold line-clamp-2"
                    style={{ color: textColor }}
                  >
                    {session.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-[10px]" style={{ color: mutedColor }}>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      60 min
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {session.room}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Desktop Preview
function DesktopAppPreview({
  conference,
  sessions,
  tracks,
  tokens,
  gradients,
  theme,
}: {
  conference: Conference
  sessions: Session[]
  tracks: Track[]
  tokens: DesignTokens
  gradients: typeof DEFAULT_GRADIENTS
  theme: ThemeMode
}) {
  const bgColor = theme === 'dark' ? '#0f172a' : tokens.colors.background
  const textColor = theme === 'dark' ? '#f8fafc' : tokens.colors.text
  const mutedColor = theme === 'dark' ? '#94a3b8' : tokens.colors.textMuted
  const surfaceColor = theme === 'dark' ? '#1e293b' : tokens.colors.surface
  const borderColor = theme === 'dark' ? '#334155' : tokens.colors.border

  return (
    <div style={{ backgroundColor: bgColor }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ backgroundColor: bgColor, borderColor }}
      >
        <div className="text-lg font-bold" style={{ color: textColor }}>
          {conference.name}
        </div>
        <div className="flex items-center gap-6">
          {['Schedule', 'Speakers', 'Sponsors'].map((item) => (
            <span
              key={item}
              className="text-sm font-medium cursor-pointer"
              style={{ color: mutedColor }}
            >
              {item}
            </span>
          ))}
          <button
            className="rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: tokens.colors.primary }}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative px-8 py-16 text-center" style={{ background: gradients.hero }}>
        <h1 className="text-4xl font-bold text-white">{conference.name}</h1>
        <p className="mt-4 text-lg text-white/90">{conference.tagline || 'Your amazing conference'}</p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg"
            style={{ backgroundColor: tokens.colors.accent }}
          >
            Get Your Ticket
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 border-b" style={{ backgroundColor: surfaceColor, borderColor }}>
        {[
          { label: 'Sessions', value: sessions.length || '0' },
          { label: 'Speakers', value: '0' },
          { label: 'Tracks', value: tracks.length || '0' },
          { label: 'Days', value: '1' },
        ].map((stat) => (
          <div key={stat.label} className="px-6 py-6 text-center">
            <div className="text-3xl font-bold" style={{ color: tokens.colors.primary }}>
              {stat.value}
            </div>
            <div className="mt-1 text-sm" style={{ color: mutedColor }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tracks */}
      {tracks.length > 0 && (
        <div className="px-8 py-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: textColor }}>
            Conference Tracks
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="rounded-xl p-4 text-center"
                style={{
                  backgroundColor: track.color + '15',
                  border: `2px solid ${track.color}30`,
                }}
              >
                <div
                  className="h-3 w-3 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: track.color }}
                />
                <div className="font-semibold text-sm" style={{ color: track.color }}>
                  {track.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions */}
      {sessions.length > 0 && (
        <div className="px-8 py-10" style={{ backgroundColor: surfaceColor }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: textColor }}>
              Sessions
            </h2>
            <button className="flex items-center gap-1 text-sm font-medium" style={{ color: tokens.colors.primary }}>
              View All <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {sessions.slice(0, 6).map((session) => (
              <div
                key={session.id}
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
              >
                <div className="p-4">
                  <h3 className="text-base font-bold" style={{ color: textColor }}>
                    {session.title}
                  </h3>
                  {session.description && (
                    <p className="mt-2 text-sm line-clamp-2" style={{ color: mutedColor }}>
                      {session.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-sm" style={{ color: mutedColor }}>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      60 min
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {session.room}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
