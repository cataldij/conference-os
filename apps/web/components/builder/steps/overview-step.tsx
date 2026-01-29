'use client'

import { useBuilder } from '@/contexts/builder-context'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, MapPin, FileText, Image } from 'lucide-react'

export function OverviewStep() {
  const { state, updateOverview } = useBuilder()
  const { overview } = state

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <FileText className="h-5 w-5 text-primary" />
          Event Overview
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up the basic details for your conference app.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Event Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Event Name</Label>
          <Input
            id="name"
            value={overview.name}
            onChange={(e) => updateOverview({ name: e.target.value })}
            placeholder="My Awesome Conference"
            className="text-lg font-semibold"
          />
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={overview.tagline}
            onChange={(e) => updateOverview({ tagline: e.target.value })}
            placeholder="Where Innovation Meets Inspiration"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={overview.description}
            onChange={(e) => updateOverview({ description: e.target.value })}
            placeholder="Tell attendees what to expect..."
            rows={3}
          />
        </div>

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={overview.startDate}
              onChange={(e) => updateOverview({ startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={overview.endDate}
              onChange={(e) => updateOverview({ endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Venue */}
        <div className="space-y-2">
          <Label htmlFor="venueName" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Venue Name
          </Label>
          <Input
            id="venueName"
            value={overview.venueName}
            onChange={(e) => updateOverview({ venueName: e.target.value })}
            placeholder="Moscone Center"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="venueAddress">Venue Address</Label>
          <Input
            id="venueAddress"
            value={overview.venueAddress}
            onChange={(e) => updateOverview({ venueAddress: e.target.value })}
            placeholder="747 Howard St, San Francisco, CA 94103"
          />
        </div>

        {/* Logo & Banner Upload Placeholders */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Logo
            </Label>
            <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-muted-foreground">
              Drag & drop or click to upload
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Banner Image
            </Label>
            <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-muted-foreground">
              Drag & drop or click to upload
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
