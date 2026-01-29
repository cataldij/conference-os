'use client'

import { useState } from 'react'
import {
  Home,
  Calendar,
  Users,
  Building2,
  MessageCircle,
  Map,
  Bell,
  User,
  Mic2,
  Gift,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Calendar,
  Users,
  Building2,
  MessageCircle,
  Map,
  Bell,
  User,
  Mic2,
  Gift,
  BarChart3,
  Settings,
}

interface ModuleTileProps {
  name: string
  icon: string
  primaryColor: string
  surfaceColor: string
  textColor: string
  borderColor: string
  onTap?: () => void
}

export function ModuleTile({
  name,
  icon,
  primaryColor,
  surfaceColor,
  textColor,
  borderColor,
  onTap,
}: ModuleTileProps) {
  const [isPressed, setIsPressed] = useState(false)
  const Icon = ICON_MAP[icon] || Home

  // Generate a subtle gradient for the icon background
  const iconBgGradient = `linear-gradient(145deg, ${primaryColor}18, ${primaryColor}08)`

  return (
    <button
      className="group relative w-full text-left transition-transform duration-100 ease-out focus:outline-none active:scale-[0.97]"
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onClick={onTap}
      style={{
        transform: isPressed ? 'scale(0.97)' : 'scale(1)',
      }}
    >
      <div
        className="rounded-[18px] p-3.5 transition-shadow duration-150"
        style={{
          backgroundColor: surfaceColor,
          boxShadow: isPressed
            ? '0 1px 2px rgba(0,0,0,0.03)'
            : `
              0 1px 3px rgba(0,0,0,0.04),
              0 4px 12px rgba(0,0,0,0.04)
            `,
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* iOS-style icon container */}
        <div
          className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-[12px]"
          style={{
            background: iconBgGradient,
          }}
        >
          <Icon
            className="h-5 w-5"
            style={{ color: primaryColor }}
            strokeWidth={2}
          />
        </div>

        {/* Label */}
        <p
          className="text-[13px] font-medium leading-tight"
          style={{ color: textColor }}
        >
          {name}
        </p>
      </div>
    </button>
  )
}
