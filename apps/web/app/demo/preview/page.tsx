'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DEMO_CONFERENCE,
  DEMO_SESSIONS,
  DEMO_TRACKS,
  DEMO_ROOMS,
  DEMO_DESIGN_TOKENS,
  DEMO_GRADIENTS,
} from '@/lib/demo-data';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  ArrowRight,
  Star,
  Play,
  Download,
  Share2,
  Heart,
  Bookmark,
  MessageCircle,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';

export default function DemoPreviewPage() {
  const [deviceSize, setDeviceSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const tokens = DEMO_DESIGN_TOKENS;
  const gradients = DEMO_GRADIENTS;

  const sizes = {
    mobile: { width: 375, scale: 0.9 },
    tablet: { width: 768, scale: 0.7 },
    desktop: { width: 1280, scale: 0.55 },
  };

  const { width, scale } = sizes[deviceSize];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Conference Preview</h1>
          <p className="text-muted-foreground">
            See how your conference site looks to attendees
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border bg-muted p-1">
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
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Open Full Preview
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="overflow-hidden rounded-2xl border-4 border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 p-6">
        <div className="flex justify-center">
          <div
            className="origin-top overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-500"
            style={{
              width: width,
              minWidth: width,
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
            }}
          >
            {/* Conference Site Preview */}
            <div style={{ backgroundColor: tokens.colors.background }}>
              {/* Nav */}
              <nav
                className="sticky top-0 z-50 flex items-center justify-between border-b px-6 py-4"
                style={{
                  backgroundColor: tokens.colors.background,
                  borderColor: tokens.colors.border,
                }}
              >
                <div
                  className="text-xl font-bold"
                  style={{
                    color: tokens.colors.text,
                    fontFamily: tokens.typography.fontFamily.heading,
                  }}
                >
                  {DEMO_CONFERENCE.name}
                </div>
                <div className="flex items-center gap-6">
                  {['Schedule', 'Speakers', 'Sponsors', 'Venue'].map((item) => (
                    <span
                      key={item}
                      className="cursor-pointer text-sm font-medium transition-colors hover:opacity-80"
                      style={{
                        color: tokens.colors.textMuted,
                        fontFamily: tokens.typography.fontFamily.body,
                      }}
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
              <div
                className="relative overflow-hidden px-8 py-20 text-center"
                style={{ background: gradients.hero }}
              >
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative z-10">
                  <div className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium text-white">
                    September 15-17, 2024
                  </div>
                  <h1
                    className="text-5xl font-bold text-white"
                    style={{ fontFamily: tokens.typography.fontFamily.heading }}
                  >
                    {DEMO_CONFERENCE.name}
                  </h1>
                  <p
                    className="mx-auto mt-4 max-w-2xl text-xl text-white/90"
                    style={{ fontFamily: tokens.typography.fontFamily.body }}
                  >
                    {DEMO_CONFERENCE.tagline}
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-4 text-white/80">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {DEMO_CONFERENCE.venue_name}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      5,000+ Attendees
                    </span>
                  </div>
                  <div className="mt-8 flex justify-center gap-4">
                    <button
                      className="flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105"
                      style={{ backgroundColor: tokens.colors.accent }}
                    >
                      Get Your Ticket
                      <ArrowRight className="h-5 w-5" />
                    </button>
                    <button className="flex items-center gap-2 rounded-full border-2 border-white/40 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur transition-colors hover:bg-white/20">
                      <Play className="h-5 w-5" />
                      Watch Trailer
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div
                className="grid grid-cols-4 border-b"
                style={{
                  backgroundColor: tokens.colors.surface,
                  borderColor: tokens.colors.border,
                }}
              >
                {[
                  { label: 'Sessions', value: '120+' },
                  { label: 'Speakers', value: '48' },
                  { label: 'Workshops', value: '24' },
                  { label: 'Tracks', value: '5' },
                ].map((stat) => (
                  <div key={stat.label} className="px-6 py-8 text-center">
                    <div
                      className="text-4xl font-bold"
                      style={{
                        color: tokens.colors.primary,
                        fontFamily: tokens.typography.fontFamily.heading,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="mt-1 text-sm"
                      style={{
                        color: tokens.colors.textMuted,
                        fontFamily: tokens.typography.fontFamily.body,
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tracks */}
              <div className="px-8 py-12">
                <h2
                  className="mb-6 text-2xl font-bold"
                  style={{
                    color: tokens.colors.text,
                    fontFamily: tokens.typography.fontFamily.heading,
                  }}
                >
                  Conference Tracks
                </h2>
                <div className="grid grid-cols-5 gap-4">
                  {DEMO_TRACKS.map((track) => (
                    <div
                      key={track.id}
                      className="cursor-pointer rounded-xl p-4 text-center transition-transform hover:scale-105"
                      style={{
                        backgroundColor: track.color + '15',
                        border: `2px solid ${track.color}30`,
                      }}
                    >
                      <div
                        className="mb-2 inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: track.color }}
                      />
                      <div
                        className="font-semibold"
                        style={{
                          color: track.color,
                          fontFamily: tokens.typography.fontFamily.heading,
                        }}
                      >
                        {track.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Sessions */}
              <div
                className="px-8 py-12"
                style={{ backgroundColor: tokens.colors.surface }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2
                    className="text-2xl font-bold"
                    style={{
                      color: tokens.colors.text,
                      fontFamily: tokens.typography.fontFamily.heading,
                    }}
                  >
                    Featured Sessions
                  </h2>
                  <button
                    className="flex items-center gap-1 font-medium"
                    style={{ color: tokens.colors.primary }}
                  >
                    View All <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {DEMO_SESSIONS.map((session) => (
                    <div
                      key={session.id}
                      className="group cursor-pointer overflow-hidden rounded-xl transition-shadow hover:shadow-lg"
                      style={{
                        backgroundColor: tokens.colors.background,
                        border: `1px solid ${tokens.colors.border}`,
                      }}
                    >
                      <div
                        className="h-32"
                        style={{ background: gradients.accent }}
                      />
                      <div className="p-5">
                        <span
                          className="inline-block rounded-full px-3 py-1 text-xs font-medium text-white"
                          style={{ backgroundColor: tokens.colors.primary }}
                        >
                          {session.track}
                        </span>
                        <h3
                          className="mt-3 text-lg font-bold group-hover:underline"
                          style={{
                            color: tokens.colors.text,
                            fontFamily: tokens.typography.fontFamily.heading,
                          }}
                        >
                          {session.title}
                        </h3>
                        <p
                          className="mt-2 line-clamp-2 text-sm"
                          style={{
                            color: tokens.colors.textMuted,
                            fontFamily: tokens.typography.fontFamily.body,
                          }}
                        >
                          {session.description}
                        </p>
                        <div
                          className="mt-4 flex items-center gap-4 text-sm"
                          style={{ color: tokens.colors.textMuted }}
                        >
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

              {/* CTA */}
              <div
                className="px-8 py-16 text-center"
                style={{ background: gradients.hero }}
              >
                <h2
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: tokens.typography.fontFamily.heading }}
                >
                  Ready to Join Us?
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-white/80">
                  Secure your spot at the most anticipated tech event of the year.
                </p>
                <button
                  className="mt-6 rounded-full px-8 py-4 text-lg font-semibold transition-transform hover:scale-105"
                  style={{
                    backgroundColor: tokens.colors.accent,
                    color: 'white',
                  }}
                >
                  Register Now — Starting at $299
                </button>
              </div>

              {/* Footer */}
              <footer
                className="border-t px-8 py-8"
                style={{
                  backgroundColor: tokens.colors.surface,
                  borderColor: tokens.colors.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="font-bold"
                    style={{
                      color: tokens.colors.text,
                      fontFamily: tokens.typography.fontFamily.heading,
                    }}
                  >
                    {DEMO_CONFERENCE.name}
                  </div>
                  <div
                    className="flex gap-6 text-sm"
                    style={{ color: tokens.colors.textMuted }}
                  >
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                    <span>Contact</span>
                  </div>
                </div>
                <div
                  className="mt-4 text-center text-sm"
                  style={{ color: tokens.colors.textMuted }}
                >
                  © 2024 {DEMO_CONFERENCE.name}. Powered by Conference OS
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Callouts */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-primary" />
              Smart Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Attendees can build personalized schedules, get reminders, and never miss a session.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-primary" />
              Networking
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Built-in chat, meeting requests, and attendee directory for meaningful connections.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Play className="h-5 w-5 text-primary" />
              Live & Replay
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Live streaming, real-time Q&A, and on-demand replays for hybrid events.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
