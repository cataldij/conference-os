'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Heart,
  Bookmark,
  Share2,
  ChevronRight,
  Check,
  X,
  Bell,
  Search,
  User,
  Mail,
  Lock,
  Calendar,
  Clock,
  MapPin,
  Star,
  Sparkles,
  ArrowRight,
  Play,
  Download,
  ExternalLink,
  Menu,
  Plus,
  Minus,
  Settings,
  Home,
  Users,
  Mic,
  Send,
} from 'lucide-react';

interface ComponentShowcaseProps {
  tokens: any;
  gradients?: {
    hero: string;
    accent: string;
    card: string;
  } | null;
  componentStyle?: {
    buttons?: { style: string; hover: string };
    cards?: { style: string; elevation: string };
    inputs?: { style: string };
  } | null;
}

export function ComponentShowcase({ tokens, gradients, componentStyle }: ComponentShowcaseProps) {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const colors = tokens?.colors || {};
  const typography = tokens?.typography || {};
  const borderRadius = tokens?.borderRadius || {};
  const shadows = tokens?.shadows || {};

  const heroGradient = gradients?.hero || `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark || colors.primary})`;

  // Button hover state simulation
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  return (
    <div className="space-y-8 p-6" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Section: Buttons */}
      <section>
        <h3
          className="mb-4 text-lg font-bold"
          style={{ fontFamily: typography.fontFamily?.heading }}
        >
          Buttons
        </h3>
        <div className="flex flex-wrap gap-3">
          {/* Primary Button */}
          <button
            onMouseEnter={() => setHoveredButton('primary')}
            onMouseLeave={() => setHoveredButton(null)}
            className="flex items-center gap-2 px-5 py-2.5 font-semibold text-white transition-all duration-200"
            style={{
              background: hoveredButton === 'primary' ? colors.primaryDark : colors.primary,
              borderRadius: borderRadius.lg,
              boxShadow: hoveredButton === 'primary' ? shadows.lg : shadows.md,
              transform: hoveredButton === 'primary' ? 'translateY(-2px)' : 'none',
            }}
          >
            <Sparkles className="h-4 w-4" />
            Primary Action
          </button>

          {/* Secondary Button */}
          <button
            onMouseEnter={() => setHoveredButton('secondary')}
            onMouseLeave={() => setHoveredButton(null)}
            className="flex items-center gap-2 border-2 px-5 py-2.5 font-semibold transition-all duration-200"
            style={{
              borderColor: colors.primary,
              color: hoveredButton === 'secondary' ? '#fff' : colors.primary,
              backgroundColor: hoveredButton === 'secondary' ? colors.primary : 'transparent',
              borderRadius: borderRadius.lg,
            }}
          >
            Secondary
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Ghost Button */}
          <button
            onMouseEnter={() => setHoveredButton('ghost')}
            onMouseLeave={() => setHoveredButton(null)}
            className="flex items-center gap-2 px-5 py-2.5 font-medium transition-all duration-200"
            style={{
              color: colors.textMuted,
              backgroundColor: hoveredButton === 'ghost' ? colors.backgroundAlt : 'transparent',
              borderRadius: borderRadius.lg,
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Learn More
          </button>

          {/* Accent Button */}
          <button
            onMouseEnter={() => setHoveredButton('accent')}
            onMouseLeave={() => setHoveredButton(null)}
            className="flex items-center gap-2 px-5 py-2.5 font-semibold text-white transition-all duration-200"
            style={{
              backgroundColor: colors.accent,
              borderRadius: borderRadius.lg,
              boxShadow: shadows.md,
              transform: hoveredButton === 'accent' ? 'scale(1.02)' : 'none',
            }}
          >
            <Play className="h-4 w-4" />
            Watch Demo
          </button>

          {/* Icon Button */}
          <button
            onMouseEnter={() => setHoveredButton('icon')}
            onMouseLeave={() => setHoveredButton(null)}
            className="flex h-10 w-10 items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: hoveredButton === 'icon' ? colors.primary : colors.backgroundAlt,
              color: hoveredButton === 'icon' ? '#fff' : colors.textMuted,
              borderRadius: borderRadius.full,
            }}
          >
            <Heart className="h-5 w-5" />
          </button>

          {/* Pill Button */}
          <button
            className="px-4 py-1.5 text-sm font-medium"
            style={{
              background: `${colors.primary}15`,
              color: colors.primary,
              borderRadius: borderRadius.full,
            }}
          >
            + Add to Schedule
          </button>
        </div>
      </section>

      {/* Section: Cards */}
      <section>
        <h3
          className="mb-4 text-lg font-bold"
          style={{ fontFamily: typography.fontFamily?.heading }}
        >
          Cards
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {/* Session Card */}
          <div
            className="overflow-hidden"
            style={{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.xl,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.md,
            }}
          >
            <div className="h-24" style={{ background: heroGradient }} />
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: colors.accent, color: '#fff' }}
                >
                  Keynote
                </span>
                <span className="text-xs" style={{ color: colors.textMuted }}>
                  <Clock className="mr-1 inline h-3 w-3" />
                  9:00 AM
                </span>
              </div>
              <h4
                className="mb-1 font-semibold"
                style={{ fontFamily: typography.fontFamily?.heading }}
              >
                The Future of AI
              </h4>
              <p className="mb-3 text-sm" style={{ color: colors.textMuted }}>
                Exploring next-gen capabilities
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span className="text-sm" style={{ color: colors.textMuted }}>
                    John Doe
                  </span>
                </div>
                <button
                  className="px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: colors.primary,
                    color: '#fff',
                    borderRadius: borderRadius.md,
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Speaker Card */}
          <div
            className="p-4 text-center"
            style={{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.xl,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.sm,
            }}
          >
            <div
              className="mx-auto mb-3 h-16 w-16 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              }}
            />
            <h4
              className="font-semibold"
              style={{ fontFamily: typography.fontFamily?.heading }}
            >
              Sarah Johnson
            </h4>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              CEO at TechCorp
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <button
                className="px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: `${colors.primary}15`,
                  color: colors.primary,
                  borderRadius: borderRadius.full,
                }}
              >
                Follow
              </button>
              <button
                className="p-1"
                style={{
                  backgroundColor: colors.backgroundAlt,
                  borderRadius: borderRadius.full,
                }}
              >
                <Share2 className="h-4 w-4" style={{ color: colors.textMuted }} />
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div
            className="p-4"
            style={{
              background: heroGradient,
              borderRadius: borderRadius.xl,
              boxShadow: shadows.lg,
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white/80">Attendees</span>
              <Users className="h-5 w-5 text-white/60" />
            </div>
            <p
              className="text-3xl font-bold text-white"
              style={{ fontFamily: typography.fontFamily?.heading }}
            >
              2,547
            </p>
            <p className="mt-1 text-sm text-white/60">+12% from last year</p>
          </div>
        </div>
      </section>

      {/* Section: Form Elements */}
      <section>
        <h3
          className="mb-4 text-lg font-bold"
          style={{ fontFamily: typography.fontFamily?.heading }}
        >
          Form Elements
        </h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {/* Text Input */}
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{ color: colors.text }}
            >
              Email Address
            </label>
            <div
              className="flex items-center gap-2 border px-3 py-2"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
              }}
            >
              <Mail className="h-4 w-4" style={{ color: colors.textMuted }} />
              <input
                type="text"
                placeholder="you@example.com"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: colors.text }}
              />
            </div>
          </div>

          {/* Search Input */}
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{ color: colors.text }}
            >
              Search Sessions
            </label>
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{
                backgroundColor: colors.backgroundAlt,
                borderRadius: borderRadius.lg,
              }}
            >
              <Search className="h-4 w-4" style={{ color: colors.textMuted }} />
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: colors.text }}
              />
            </div>
          </div>

          {/* Select */}
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{ color: colors.text }}
            >
              Track
            </label>
            <select
              className="w-full border px-3 py-2 text-sm"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                color: colors.text,
              }}
            >
              <option>All Tracks</option>
              <option>Design</option>
              <option>Engineering</option>
              <option>Product</option>
            </select>
          </div>
        </div>

        {/* Toggle & Checkbox Row */}
        <div className="mt-4 flex flex-wrap items-center gap-6">
          {/* Toggle */}
          <label className="flex cursor-pointer items-center gap-2">
            <div
              className="relative h-6 w-11"
              style={{
                backgroundColor: colors.primary,
                borderRadius: borderRadius.full,
              }}
            >
              <div
                className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-all"
                style={{ boxShadow: shadows.sm }}
              />
            </div>
            <span className="text-sm" style={{ color: colors.text }}>
              Notifications
            </span>
          </label>

          {/* Checkbox */}
          <label className="flex cursor-pointer items-center gap-2">
            <div
              className="flex h-5 w-5 items-center justify-center"
              style={{
                backgroundColor: colors.primary,
                borderRadius: borderRadius.sm,
              }}
            >
              <Check className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm" style={{ color: colors.text }}>
              Remember me
            </span>
          </label>

          {/* Radio */}
          <label className="flex cursor-pointer items-center gap-2">
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full border-2"
              style={{ borderColor: colors.primary }}
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
            </div>
            <span className="text-sm" style={{ color: colors.text }}>
              Option A
            </span>
          </label>
        </div>
      </section>

      {/* Section: Badges & Tags */}
      <section>
        <h3
          className="mb-4 text-lg font-bold"
          style={{ fontFamily: typography.fontFamily?.heading }}
        >
          Badges & Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          <span
            className="px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: colors.primary, borderRadius: borderRadius.full }}
          >
            New
          </span>
          <span
            className="px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: colors.accent, borderRadius: borderRadius.full }}
          >
            Featured
          </span>
          <span
            className="px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: colors.success, borderRadius: borderRadius.full }}
          >
            Available
          </span>
          <span
            className="px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: colors.warning, borderRadius: borderRadius.md }}
          >
            Limited Seats
          </span>
          <span
            className="px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: colors.error, borderRadius: borderRadius.md }}
          >
            Sold Out
          </span>
          <span
            className="border px-2.5 py-1 text-xs font-medium"
            style={{
              borderColor: colors.border,
              color: colors.textMuted,
              borderRadius: borderRadius.full,
            }}
          >
            AI/ML
          </span>
          <span
            className="border px-2.5 py-1 text-xs font-medium"
            style={{
              borderColor: colors.border,
              color: colors.textMuted,
              borderRadius: borderRadius.full,
            }}
          >
            Design Systems
          </span>
        </div>
      </section>

      {/* Section: Navigation */}
      <section>
        <h3
          className="mb-4 text-lg font-bold"
          style={{ fontFamily: typography.fontFamily?.heading }}
        >
          Navigation
        </h3>
        <div
          className="flex items-center gap-1 p-1"
          style={{
            backgroundColor: colors.backgroundAlt,
            borderRadius: borderRadius.lg,
          }}
        >
          {['Schedule', 'Speakers', 'Venue', 'Network'].map((item, i) => (
            <button
              key={item}
              className="flex-1 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: i === 0 ? colors.surface : 'transparent',
                color: i === 0 ? colors.primary : colors.textMuted,
                borderRadius: borderRadius.md,
                boxShadow: i === 0 ? shadows.sm : 'none',
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Section: Alerts */}
      <section>
        <h3
          className="mb-4 text-lg font-bold"
          style={{ fontFamily: typography.fontFamily?.heading }}
        >
          Alerts
        </h3>
        <div className="space-y-3">
          <div
            className="flex items-center gap-3 p-4"
            style={{
              backgroundColor: `${colors.success}15`,
              borderRadius: borderRadius.lg,
              borderLeft: `4px solid ${colors.success}`,
            }}
          >
            <Check className="h-5 w-5" style={{ color: colors.success }} />
            <div>
              <p className="font-medium" style={{ color: colors.text }}>
                Registration successful!
              </p>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Check your email for confirmation
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-3 p-4"
            style={{
              backgroundColor: `${colors.primary}10`,
              borderRadius: borderRadius.lg,
              borderLeft: `4px solid ${colors.primary}`,
            }}
          >
            <Bell className="h-5 w-5" style={{ color: colors.primary }} />
            <div>
              <p className="font-medium" style={{ color: colors.text }}>
                Keynote starting soon
              </p>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Main Stage in 15 minutes
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
