'use client'

import { useState, useEffect } from 'react'
import { useBuilder } from '@/contexts/builder-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Palette,
  Type,
  Sparkles,
  Wand2,
  Loader2,
  Moon,
  Sun,
  Zap,
  Sliders,
  Users,
} from 'lucide-react'

const EXAMPLE_PROMPTS = [
  { label: 'Tech Conference', prompt: 'Modern tech conference, sleek and innovative. Blues and purples.' },
  { label: 'Medical Summit', prompt: 'Healthcare summit, professional and trustworthy. Blues and greens.' },
  { label: 'Creative Festival', prompt: 'Design festival, bold and artistic. Vibrant colors.' },
  { label: 'Finance Forum', prompt: 'Finance forum, premium and sophisticated. Dark with gold accents.' },
]

const REFINEMENTS = [
  { id: 'darker', label: 'Darker', icon: Moon },
  { id: 'lighter', label: 'Lighter', icon: Sun },
  { id: 'bold', label: 'Bolder', icon: Zap },
  { id: 'minimal', label: 'Minimal', icon: Sliders },
  { id: 'playful', label: 'Playful', icon: Sparkles },
  { id: 'professional', label: 'Professional', icon: Users },
]

// Font options (subset)
const FONTS = [
  'Inter', 'Poppins', 'Space Grotesk', 'DM Sans', 'Outfit',
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Raleway',
  'Playfair Display', 'Merriweather', 'Bebas Neue', 'Oswald',
]

export function BrandingStep() {
  const { state, updateDesignTokens, updateGradients } = useBuilder()
  const { design } = state

  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('ai')

  // Dynamic font loading
  useEffect(() => {
    const fonts = design.tokens.typography?.fontFamily
    if (!fonts) return

    const fontFamilies = [fonts.heading, fonts.body].filter(Boolean)
    const uniqueFonts = [...new Set(fontFamilies)]

    document.querySelectorAll('link[data-dynamic-font]').forEach(el => el.remove())

    uniqueFonts.forEach(font => {
      const fontName = font.replace(/ /g, '+')
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800&display=swap`
      link.rel = 'stylesheet'
      link.setAttribute('data-dynamic-font', font)
      document.head.appendChild(link)
    })
  }, [design.tokens.typography?.fontFamily])

  const handleGenerate = async (promptText: string, refinement?: string) => {
    setIsGenerating(true)
    try {
      const fullPrompt = refinement
        ? `${promptText}. Make it ${refinement}.`
        : promptText

      const response = await fetch('/api/ai/design-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      })

      if (!response.ok) throw new Error('Generation failed')

      const data = await response.json()

      if (data.tokens) {
        updateDesignTokens(data.tokens)
      }
      if (data.gradients) {
        updateGradients(data.gradients)
      }
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateColor = (key: string, value: string) => {
    updateDesignTokens({
      ...design.tokens,
      colors: { ...design.tokens.colors, [key]: value },
    })
  }

  const updateFont = (type: 'heading' | 'body', value: string) => {
    updateDesignTokens({
      ...design.tokens,
      typography: {
        ...design.tokens.typography,
        fontFamily: { ...design.tokens.typography.fontFamily, [type]: value },
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Palette className="h-5 w-5 text-primary" />
          Branding & Design
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate a unique design system with AI or customize manually.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="ai" className="flex-1 gap-1.5">
            <Sparkles className="h-4 w-4" />
            AI Generate
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex-1 gap-1.5">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex-1 gap-1.5">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-4 space-y-4">
          {/* Gradient Preview */}
          {design.gradients && (
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <div className="h-10 rounded-lg" style={{ background: design.gradients.hero }} />
                <p className="text-center text-xs text-muted-foreground">Hero</p>
              </div>
              <div className="space-y-1">
                <div className="h-10 rounded-lg" style={{ background: design.gradients.accent }} />
                <p className="text-center text-xs text-muted-foreground">Accent</p>
              </div>
              <div className="space-y-1">
                <div className="h-10 rounded-lg border" style={{ background: design.gradients.card }} />
                <p className="text-center text-xs text-muted-foreground">Card</p>
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Describe your conference and desired style..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <Button
              className="w-full gap-2"
              onClick={() => handleGenerate(prompt)}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Generate Design
            </Button>
          </div>

          {/* Quick Refinements */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Refinements</label>
            <div className="grid grid-cols-3 gap-2">
              {REFINEMENTS.map((ref) => (
                <Button
                  key={ref.id}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleGenerate(prompt || 'Current design', ref.id)}
                  disabled={isGenerating}
                >
                  <ref.icon className="h-3 w-3" />
                  {ref.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Try an Example</label>
            <div className="grid grid-cols-2 gap-2">
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example.label}
                  onClick={() => {
                    setPrompt(example.prompt)
                    handleGenerate(example.prompt)
                  }}
                  className="rounded-lg border p-2 text-left text-sm transition-colors hover:bg-muted"
                  disabled={isGenerating}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {['primary', 'secondary', 'accent', 'background', 'text', 'textMuted'].map((key) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium capitalize">{key}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={design.tokens.colors[key] || '#000000'}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border"
                  />
                  <Input
                    value={design.tokens.colors[key] || ''}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="h-9 font-mono text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="typography" className="mt-4 space-y-4">
          <div className="grid gap-4">
            {(['heading', 'body'] as const).map((type) => (
              <div key={type} className="space-y-2">
                <label className="text-sm font-semibold capitalize">{type} Font</label>
                <select
                  value={design.tokens.typography?.fontFamily?.[type] || 'Inter'}
                  onChange={(e) => updateFont(type, e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2"
                >
                  {FONTS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
                <div
                  className="rounded-lg border p-3"
                  style={{ fontFamily: design.tokens.typography?.fontFamily?.[type] }}
                >
                  <p className="text-lg font-bold">Aa Bb Cc 123</p>
                  <p className="text-sm text-muted-foreground">The quick brown fox jumps</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
