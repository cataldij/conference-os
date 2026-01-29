'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DemoDesignSystemProvider, useDemoDesignSystem } from '@/contexts/demo-design-system-context';
import { ComponentShowcase } from '@/components/design-system/component-showcase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  DEMO_DESIGN_TOKENS,
  DEMO_DESIGN_CONCEPT,
  DEMO_GRADIENTS,
  DEMO_DARK_MODE,
  DEMO_CONFERENCE,
} from '@/lib/demo-data';
import {
  Palette,
  Type,
  Sparkles,
  Undo2,
  Redo2,
  Loader2,
  Wand2,
  Smartphone,
  Monitor,
  Tablet,
  Moon,
  Sun,
  Zap,
  RefreshCcw,
  Quote,
  Lightbulb,
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  Play,
  Layers,
  Layout,
  Copy,
  Check,
  Sliders,
  ArrowLeft,
} from 'lucide-react';

// =============================================
// EXAMPLE PROMPTS
// =============================================

const EXAMPLE_PROMPTS = [
  { label: 'Tech Conference', prompt: 'Modern tech conference in San Francisco, 2000 developers. Think Apple keynote meets startup energy. Sleek, innovative, inspiring.' },
  { label: 'Medical Summit', prompt: 'Healthcare leadership summit, 500 executives. Professional, trustworthy, clean. Blues and greens, calming but authoritative.' },
  { label: 'Creative Festival', prompt: 'Design and creativity festival, artists and designers. Bold, artistic, expressive. Vibrant colors, playful typography.' },
  { label: 'Finance Forum', prompt: 'Global finance and investment forum. Premium, sophisticated, established. Dark mode with gold accents.' },
  { label: 'Sustainability Summit', prompt: 'Environmental sustainability conference. Natural, organic, hopeful. Earth tones with fresh green accents.' },
];

const REFINEMENTS = [
  { id: 'darker', label: 'Darker', icon: Moon },
  { id: 'lighter', label: 'Lighter', icon: Sun },
  { id: 'bold', label: 'Bolder', icon: Zap },
  { id: 'minimal', label: 'Minimal', icon: Sliders },
  { id: 'playful', label: 'Playful', icon: Sparkles },
  { id: 'professional', label: 'Professional', icon: Users },
];

// =============================================
// DEMO DESIGN EDITOR
// =============================================

function DemoDesignEditorContent() {
  const {
    tokens,
    isGenerating,
    canUndo,
    canRedo,
    setTokens,
    undo,
    redo,
  } = useDemoDesignSystem();

  const [activeTab, setActiveTab] = useState('ai');
  const [deviceSize, setDeviceSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [previewMode, setPreviewMode] = useState<'page' | 'components'>('page');
  const [isDarkPreview, setIsDarkPreview] = useState(false);
  const [copiedCSS, setCopiedCSS] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLocalGenerating, setIsLocalGenerating] = useState(false);

  // Design metadata (from AI generation)
  const [designConcept, setDesignConcept] = useState(DEMO_DESIGN_CONCEPT);
  const [gradients, setGradients] = useState(DEMO_GRADIENTS);
  const [darkModeTokens, setDarkModeTokens] = useState(DEMO_DARK_MODE);
  const [designRationale, setDesignRationale] = useState<string | null>(
    'A bold tech-forward design inspired by leading conferences like WWDC and Google I/O.'
  );

  // Dynamically load Google Fonts
  useEffect(() => {
    const fonts = tokens.typography?.fontFamily;
    if (!fonts) return;

    const fontFamilies = [fonts.heading, fonts.body, fonts.mono].filter(Boolean);
    const uniqueFonts = [...new Set(fontFamilies)];

    document.querySelectorAll('link[data-dynamic-font]').forEach(el => el.remove());

    uniqueFonts.forEach(font => {
      const fontName = font.replace(/ /g, '+');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700;800&display=swap`;
      link.rel = 'stylesheet';
      link.setAttribute('data-dynamic-font', font);
      document.head.appendChild(link);
    });
  }, [tokens.typography?.fontFamily]);

  const handleGenerate = async (promptText: string, refinement?: string) => {
    setIsLocalGenerating(true);
    try {
      const fullPrompt = refinement
        ? `${promptText}. Make it ${refinement}.`
        : promptText;

      const response = await fetch('/api/ai/design-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();

      if (data.tokens) {
        setTokens(data.tokens);
        if (data.designConcept) setDesignConcept(data.designConcept);
        if (data.designRationale) setDesignRationale(data.designRationale);
        if (data.gradients) setGradients(data.gradients);
        if (data.darkMode) setDarkModeTokens(data.darkMode);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsLocalGenerating(false);
    }
  };

  const handleCopyCSS = async () => {
    const cssVars = Object.entries(tokens.colors || {})
      .map(([key, value]) => `  --color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
      .join('\n');

    const css = `:root {\n${cssVars}\n}`;
    await navigator.clipboard.writeText(css);
    setCopiedCSS(true);
    setTimeout(() => setCopiedCSS(false), 2000);
  };

  const displayTokens = isDarkPreview && darkModeTokens
    ? { ...tokens, colors: { ...tokens.colors, ...darkModeTokens } }
    : tokens;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left Panel - Controls */}
      <div className="w-96 shrink-0 overflow-y-auto rounded-xl border bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Design Studio</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo}>
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo}>
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
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
          </TabsList>

          <TabsContent value="ai" className="mt-4 space-y-4">
            {/* Design Concept Display */}
            {designConcept && (
              <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-accent/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold">{designConcept.name}</h3>
                    <p className="text-sm text-muted-foreground">{designConcept.tagline}</p>
                  </div>
                  <div className="flex gap-1">
                    {designConcept.personality?.slice(0, 3).map((trait) => (
                      <span
                        key={trait}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
                {designRationale && (
                  <p className="mt-2 text-xs italic text-muted-foreground">{designRationale}</p>
                )}
              </div>
            )}

            {/* Gradient Preview */}
            {gradients && (
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <div className="h-8 rounded" style={{ background: gradients.hero }} />
                  <p className="text-center text-xs text-muted-foreground">Hero</p>
                </div>
                <div className="space-y-1">
                  <div className="h-8 rounded" style={{ background: gradients.accent }} />
                  <p className="text-center text-xs text-muted-foreground">Accent</p>
                </div>
                <div className="space-y-1">
                  <div className="h-8 rounded border" style={{ background: gradients.card }} />
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
                className="min-h-[100px] resize-none"
              />
              <Button
                className="w-full gap-2"
                onClick={() => handleGenerate(prompt)}
                disabled={!prompt.trim() || isLocalGenerating}
              >
                {isLocalGenerating ? (
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
                    disabled={isLocalGenerating}
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
              <div className="space-y-1">
                {EXAMPLE_PROMPTS.map((example) => (
                  <button
                    key={example.label}
                    onClick={() => {
                      setPrompt(example.prompt);
                      handleGenerate(example.prompt);
                    }}
                    className="w-full rounded-lg border p-2 text-left text-sm transition-colors hover:bg-muted"
                    disabled={isLocalGenerating}
                  >
                    {example.label}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(tokens.colors || {}).slice(0, 10).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-medium capitalize">{key}</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => {
                        setTokens({
                          ...tokens,
                          colors: { ...tokens.colors, [key]: e.target.value },
                        });
                      }}
                      className="h-8 w-12 cursor-pointer rounded border"
                    />
                    <Input
                      value={value}
                      onChange={(e) => {
                        setTokens({
                          ...tokens,
                          colors: { ...tokens.colors, [key]: e.target.value },
                        });
                      }}
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Panel */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-muted/30">
        {/* Preview Toolbar */}
        <div className="flex items-center justify-between border-b bg-background p-3">
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-muted p-1">
              <button
                onClick={() => setPreviewMode('page')}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  previewMode === 'page' && "bg-background shadow-sm"
                )}
              >
                <Layout className="h-4 w-4" />
                Page
              </button>
              <button
                onClick={() => setPreviewMode('components')}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  previewMode === 'components' && "bg-background shadow-sm"
                )}
              >
                <Layers className="h-4 w-4" />
                Components
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {darkModeTokens && (
              <Button
                variant={isDarkPreview ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setIsDarkPreview(!isDarkPreview)}
                className="gap-1.5"
              >
                {isDarkPreview ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {isDarkPreview ? 'Dark' : 'Light'}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCSS}
              className="gap-1.5"
            >
              {copiedCSS ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedCSS ? 'Copied!' : 'Copy CSS'}
            </Button>

            {previewMode === 'page' && (
              <div className="flex gap-1 border-l pl-2">
                {(['mobile', 'tablet', 'desktop'] as const).map((size) => (
                  <Button
                    key={size}
                    variant={deviceSize === size ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setDeviceSize(size)}
                  >
                    {size === 'mobile' && <Smartphone className="h-4 w-4" />}
                    {size === 'tablet' && <Tablet className="h-4 w-4" />}
                    {size === 'desktop' && <Monitor className="h-4 w-4" />}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          {previewMode === 'page' ? (
            <DemoPagePreview
              tokens={displayTokens}
              gradients={gradients}
              deviceSize={deviceSize}
            />
          ) : (
            <div className="h-full overflow-auto">
              <ComponentShowcase tokens={displayTokens} gradients={gradients} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================
// PAGE PREVIEW
// =============================================

function DemoPagePreview({
  tokens,
  gradients,
  deviceSize,
}: {
  tokens: any;
  gradients: any;
  deviceSize: 'mobile' | 'tablet' | 'desktop';
}) {
  const colors = tokens?.colors || {};
  const typography = tokens?.typography || {};

  const heroGradient = gradients?.hero || `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark || colors.primary})`;

  const sizes = {
    mobile: { width: 375, scale: 0.9 },
    tablet: { width: 768, scale: 0.55 },
    desktop: { width: 1280, scale: 0.35 },
  };

  const { width, scale } = sizes[deviceSize];

  return (
    <div className="flex h-full items-start justify-center overflow-auto bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div
        className="origin-top rounded-2xl shadow-2xl transition-all duration-500"
        style={{
          width: width,
          minWidth: width,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          backgroundColor: colors.background || '#fff',
        }}
      >
        {/* Navigation */}
        <nav
          className="flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: colors.background }}
        >
          <div
            className="text-xl font-bold"
            style={{
              fontFamily: typography.fontFamily?.heading,
              color: colors.text,
            }}
          >
            {DEMO_CONFERENCE.name}
          </div>
          <div className="flex gap-4">
            {['Schedule', 'Speakers', 'Sponsors'].map((item) => (
              <span
                key={item}
                className="text-sm"
                style={{
                  fontFamily: typography.fontFamily?.body,
                  color: colors.textMuted,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="p-8 text-center" style={{ background: heroGradient }}>
          <div
            className="text-4xl font-bold text-white"
            style={{ fontFamily: typography.fontFamily?.heading }}
          >
            {DEMO_CONFERENCE.name}
          </div>
          <div
            className="mt-2 text-lg text-white/90"
            style={{ fontFamily: typography.fontFamily?.body }}
          >
            {DEMO_CONFERENCE.tagline}
          </div>
          <div className="mt-4 flex justify-center gap-3 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Sep 15-17, 2024
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {DEMO_CONFERENCE.venue_name}
            </span>
          </div>
          <button
            className="mt-6 rounded-full px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              backgroundColor: colors.accent,
              fontFamily: typography.fontFamily?.body,
            }}
          >
            Register Now
          </button>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-3 gap-4 p-6"
          style={{ backgroundColor: colors.surface }}
        >
          {[
            { label: 'Attendees', value: '5,000+' },
            { label: 'Sessions', value: '120+' },
            { label: 'Speakers', value: '48' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-2xl font-bold"
                style={{
                  color: colors.primary,
                  fontFamily: typography.fontFamily?.heading,
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-sm"
                style={{
                  color: colors.textMuted,
                  fontFamily: typography.fontFamily?.body,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Featured Sessions */}
        <div className="p-6" style={{ backgroundColor: colors.background }}>
          <h2
            className="mb-4 text-xl font-bold"
            style={{
              color: colors.text,
              fontFamily: typography.fontFamily?.heading,
            }}
          >
            Featured Sessions
          </h2>
          <div className="space-y-3">
            {[
              { title: 'The Future of AI', time: '9:00 AM', track: 'Keynote' },
              { title: 'Building at Scale', time: '11:00 AM', track: 'Engineering' },
              { title: 'Design Systems', time: '2:00 PM', track: 'Design' },
            ].map((session) => (
              <div
                key={session.title}
                className="rounded-lg p-4"
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  className="font-semibold"
                  style={{
                    color: colors.text,
                    fontFamily: typography.fontFamily?.heading,
                  }}
                >
                  {session.title}
                </div>
                <div
                  className="mt-1 flex gap-3 text-sm"
                  style={{
                    color: colors.textMuted,
                    fontFamily: typography.fontFamily?.body,
                  }}
                >
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.time}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {session.track}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-6 text-center text-sm"
          style={{
            backgroundColor: colors.surface,
            color: colors.textMuted,
            fontFamily: typography.fontFamily?.body,
          }}
        >
          © 2024 {DEMO_CONFERENCE.name}. All rights reserved.
        </div>
      </div>
    </div>
  );
}

// =============================================
// MAIN PAGE EXPORT
// =============================================

export default function DemoDesignPage() {
  return (
    <DemoDesignSystemProvider>
      <DemoDesignEditorContent />
    </DemoDesignSystemProvider>
  );
}
