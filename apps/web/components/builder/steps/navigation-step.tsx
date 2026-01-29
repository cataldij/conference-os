'use client'

import { useBuilder } from '@/contexts/builder-context'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  LayoutGrid,
  Home,
  Calendar,
  Users,
  Building2,
  MessageCircle,
  Map,
  Bell,
  User,
  GripVertical,
} from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  Home,
  Calendar,
  Users,
  Building2,
  MessageCircle,
  Map,
  Bell,
  User,
}

export function NavigationStep() {
  const { state, toggleModule, reorderModules } = useBuilder()
  const { navigation } = state

  const enabledModules = navigation.filter(m => m.enabled)
  const disabledModules = navigation.filter(m => !m.enabled)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <LayoutGrid className="h-5 w-5 text-primary" />
          Navigation Modules
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose which modules to include in your conference app.
        </p>
      </div>

      {/* Enabled Modules */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Active Modules ({enabledModules.length})
        </h3>
        <div className="space-y-2">
          {enabledModules
            .sort((a, b) => a.order - b.order)
            .map((module) => {
              const Icon = ICON_MAP[module.icon] || Home
              return (
                <div
                  key={module.id}
                  className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md"
                >
                  <button className="cursor-grab text-slate-400 hover:text-slate-600">
                    <GripVertical className="h-5 w-5" />
                  </button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{module.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getModuleDescription(module.id)}
                    </p>
                  </div>
                  <Switch
                    checked={module.enabled}
                    onCheckedChange={() => toggleModule(module.id)}
                  />
                </div>
              )
            })}
        </div>
      </div>

      {/* Disabled Modules */}
      {disabledModules.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Available Modules ({disabledModules.length})
          </h3>
          <div className="space-y-2">
            {disabledModules.map((module) => {
              const Icon = ICON_MAP[module.icon] || Home
              return (
                <div
                  key={module.id}
                  className="flex items-center gap-3 rounded-xl border border-dashed bg-slate-50 p-4 opacity-60"
                >
                  <div className="w-5" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-600">{module.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getModuleDescription(module.id)}
                    </p>
                  </div>
                  <Switch
                    checked={module.enabled}
                    onCheckedChange={() => toggleModule(module.id)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Preview Info */}
      <div className="rounded-xl border bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Drag modules to reorder them. The order here will be reflected in your app&apos;s bottom navigation.
        </p>
      </div>
    </div>
  )
}

function getModuleDescription(id: string): string {
  const descriptions: Record<string, string> = {
    home: 'Landing page with event overview',
    schedule: 'Session agenda and personal schedule',
    speakers: 'Speaker profiles and bios',
    sponsors: 'Sponsor booths and information',
    networking: 'Chat and attendee networking',
    map: 'Interactive venue map',
    notifications: 'Push notifications and alerts',
    profile: 'Attendee profile and settings',
  }
  return descriptions[id] || 'Module description'
}
