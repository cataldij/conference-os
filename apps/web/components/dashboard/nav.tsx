'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  Building2,
  BarChart3,
  Settings,
  Ticket,
  MessageSquare,
  Bell,
} from 'lucide-react'

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Conferences',
    href: '/dashboard/conferences',
    icon: Calendar,
  },
  {
    name: 'Attendees',
    href: '/dashboard/attendees',
    icon: Users,
  },
  {
    name: 'Speakers',
    href: '/dashboard/speakers',
    icon: UserCog,
  },
  {
    name: 'Sponsors',
    href: '/dashboard/sponsors',
    icon: Building2,
  },
  {
    name: 'Tickets',
    href: '/dashboard/tickets',
    icon: Ticket,
  },
  {
    name: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
  },
  {
    name: 'Announcements',
    href: '/dashboard/announcements',
    icon: Bell,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">C</span>
          </div>
          <div>
            <div className="text-sm font-semibold">Conference OS</div>
            <div className="text-xs text-muted-foreground">Organizer</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex-1 truncate">
            <div className="truncate text-sm font-medium">Organizer</div>
            <div className="truncate text-xs text-muted-foreground">
              admin@example.com
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
