'use client'

import { useBuilder } from '@/contexts/builder-context'
import { AppPreview } from '@/components/simulator/app-preview'

export function BuilderPreview() {
  const { state } = useBuilder()
  const { overview, design, navigation } = state
  const { tokens, gradients } = design

  // Build the config object for the preview
  const previewConfig = {
    eventName: overview.name || 'Conference Name',
    tagline: overview.tagline || 'Your tagline here',
    startDate: overview.startDate,
    venueName: overview.venueName,
    colors: {
      primary: tokens?.colors?.primary || '#2563eb',
      background: tokens?.colors?.background || '#ffffff',
      surface: tokens?.colors?.surface || '#f8fafc',
      text: tokens?.colors?.text || '#0f172a',
      textMuted: tokens?.colors?.textMuted || '#64748b',
      border: tokens?.colors?.border || '#e2e8f0',
    },
    fontFamily: tokens?.typography?.fontFamily?.heading,
    gradientHero: gradients?.hero,
    modules: navigation,
  }

  return (
    <div className="h-full rounded-2xl border bg-white p-4 shadow-sm">
      <AppPreview config={previewConfig} className="h-full" />
    </div>
  )
}
