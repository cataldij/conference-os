'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ImageUpload } from '@/components/ui/image-upload'
import { Check } from 'lucide-react'

// Built-in background patterns
const PATTERNS = [
  { id: 'none', name: 'None', css: '' },
  {
    id: 'dots',
    name: 'Dots',
    css: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
    size: '20px 20px',
  },
  {
    id: 'grid',
    name: 'Grid',
    css: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)',
    size: '20px 20px',
  },
  {
    id: 'diagonal',
    name: 'Diagonal Lines',
    css: 'repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)',
    size: '14px 14px',
  },
  {
    id: 'waves',
    name: 'Waves',
    css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23000\' fill-opacity=\'0.03\' d=\'M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")',
    size: 'cover',
  },
  {
    id: 'zigzag',
    name: 'Zigzag',
    css: 'linear-gradient(135deg, currentColor 25%, transparent 25%), linear-gradient(225deg, currentColor 25%, transparent 25%), linear-gradient(45deg, currentColor 25%, transparent 25%), linear-gradient(315deg, currentColor 25%, transparent 25%)',
    size: '20px 20px',
  },
  {
    id: 'hexagons',
    name: 'Hexagons',
    css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'49\' viewBox=\'0 0 28 49\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    size: '28px 49px',
  },
  {
    id: 'circuit',
    name: 'Circuit',
    css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 304 304\' width=\'304\' height=\'304\'%3E%3Cpath fill=\'%23000\' fill-opacity=\'0.02\' d=\'M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V0h-28.1z\'%3E%3C/path%3E%3C/svg%3E")',
    size: '304px 304px',
  },
  {
    id: 'topography',
    name: 'Topography',
    css: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'600\' height=\'600\' viewBox=\'0 0 600 600\'%3E%3Cpath fill=\'%23000\' fill-opacity=\'0.03\' d=\'M600 325.1c-3.5-3.2-6.4-7.1-8.5-11.5-1.5-3.2-2.5-6.6-2.9-10.1-.6-5.4 0-10.9 1.7-16.1 3.6-11.3 12.4-21 24.4-25.3v-2.1c-13.1 4.4-22.7 14.9-26.5 27.3-1.9 6.1-2.4 12.4-1.6 18.6.5 4.2 1.7 8.3 3.5 12.1 2.5 5.2 6 9.9 10.3 13.7 4.9 4.4 10.6 7.9 16.7 10.3v-2.3c-5.7-2.4-10.9-5.7-15.4-9.9-1-.9-1.8-1.8-2.7-2.8zM0 325.1c3.5-3.2 6.4-7.1 8.5-11.5 1.5-3.2 2.5-6.6 2.9-10.1.6-5.4 0-10.9-1.7-16.1-3.6-11.3-12.4-21-24.4-25.3v-2.1c13.1 4.4 22.7 14.9 26.5 27.3 1.9 6.1 2.4 12.4 1.6 18.6-.5 4.2-1.7 8.3-3.5 12.1-2.5 5.2-6 9.9-10.3 13.7-4.9 4.4-10.6 7.9-16.7 10.3v-2.3c5.7-2.4 10.9-5.7 15.4-9.9 1-.9 1.8-1.8 2.7-2.8z\'/%3E%3C/svg%3E")',
    size: '600px 600px',
  },
]

// Gradient presets
const GRADIENTS = [
  { id: 'none', name: 'None', start: '', end: '' },
  { id: 'sunrise', name: 'Sunrise', start: '#f97316', end: '#fbbf24' },
  { id: 'ocean', name: 'Ocean', start: '#0ea5e9', end: '#06b6d4' },
  { id: 'forest', name: 'Forest', start: '#22c55e', end: '#10b981' },
  { id: 'sunset', name: 'Sunset', start: '#f43f5e', end: '#ec4899' },
  { id: 'purple', name: 'Purple', start: '#8b5cf6', end: '#a855f7' },
  { id: 'midnight', name: 'Midnight', start: '#1e3a5f', end: '#0f172a' },
  { id: 'cosmic', name: 'Cosmic', start: '#6366f1', end: '#8b5cf6' },
  { id: 'fire', name: 'Fire', start: '#ef4444', end: '#f97316' },
]

interface BackgroundPickerProps {
  backgroundUrl: string | null
  backgroundPattern: string | null
  gradientStart: string | null
  gradientEnd: string | null
  patternColor: string | null
  onBackgroundUrlChange: (url: string | null) => void
  onPatternChange: (pattern: string | null) => void
  onGradientChange: (start: string | null, end: string | null) => void
  onPatternColorChange: (color: string) => void
  conferenceId: string
}

export function BackgroundPicker({
  backgroundUrl,
  backgroundPattern,
  gradientStart,
  gradientEnd,
  patternColor,
  onBackgroundUrlChange,
  onPatternChange,
  onGradientChange,
  onPatternColorChange,
  conferenceId,
}: BackgroundPickerProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'pattern' | 'gradient'>('image')

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'image'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Custom Image
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pattern')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'pattern'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Patterns
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gradient')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'gradient'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Gradients
        </button>
      </div>

      {/* Image upload */}
      {activeTab === 'image' && (
        <ImageUpload
          value={backgroundUrl}
          onChange={onBackgroundUrlChange}
          bucket="conference-assets"
          folder={conferenceId}
          label="Background Image"
          aspectRatio="banner"
          maxSizeMB={10}
        />
      )}

      {/* Pattern selector */}
      {activeTab === 'pattern' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                type="button"
                onClick={() => onPatternChange(pattern.id === 'none' ? null : pattern.id)}
                className={cn(
                  'relative aspect-video rounded-lg border-2 overflow-hidden transition-all',
                  backgroundPattern === pattern.id || (pattern.id === 'none' && !backgroundPattern)
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: '#f8fafc',
                    backgroundImage: pattern.css,
                    backgroundSize: pattern.size,
                    color: patternColor || '#94a3b8',
                  }}
                />
                <span className="absolute bottom-1 left-1 right-1 text-xs font-medium text-center bg-white/80 rounded px-1 py-0.5">
                  {pattern.name}
                </span>
                {(backgroundPattern === pattern.id || (pattern.id === 'none' && !backgroundPattern)) && (
                  <div className="absolute top-1 right-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {backgroundPattern && backgroundPattern !== 'none' && (
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Pattern Color</label>
              <input
                type="color"
                value={patternColor || '#94a3b8'}
                onChange={(e) => onPatternColorChange(e.target.value)}
                className="h-8 w-16 rounded border cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Gradient selector */}
      {activeTab === 'gradient' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {GRADIENTS.map((gradient) => (
              <button
                key={gradient.id}
                type="button"
                onClick={() =>
                  onGradientChange(
                    gradient.id === 'none' ? null : gradient.start,
                    gradient.id === 'none' ? null : gradient.end
                  )
                }
                className={cn(
                  'relative aspect-video rounded-lg border-2 overflow-hidden transition-all',
                  (gradientStart === gradient.start && gradientEnd === gradient.end) ||
                    (gradient.id === 'none' && !gradientStart)
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      gradient.id === 'none'
                        ? '#f8fafc'
                        : `linear-gradient(135deg, ${gradient.start}, ${gradient.end})`,
                  }}
                />
                <span className="absolute bottom-1 left-1 right-1 text-xs font-medium text-center bg-white/80 rounded px-1 py-0.5">
                  {gradient.name}
                </span>
                {((gradientStart === gradient.start && gradientEnd === gradient.end) ||
                  (gradient.id === 'none' && !gradientStart)) && (
                  <div className="absolute top-1 right-1">
                    <Check className="h-4 w-4 text-white drop-shadow" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {gradientStart && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Start</label>
                <input
                  type="color"
                  value={gradientStart}
                  onChange={(e) => onGradientChange(e.target.value, gradientEnd)}
                  className="h-8 w-16 rounded border cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">End</label>
                <input
                  type="color"
                  value={gradientEnd || gradientStart}
                  onChange={(e) => onGradientChange(gradientStart, e.target.value)}
                  className="h-8 w-16 rounded border cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
