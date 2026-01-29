'use client'

import { DemoPlaceholder } from '@/components/demo/demo-placeholder'
import { Calendar } from 'lucide-react'

export default function DemoConferencesPage() {
  return (
    <DemoPlaceholder
      title="Conferences"
      description="Manage all your conferences from one powerful dashboard."
      icon={Calendar}
      features={[
        'Create unlimited conferences with custom branding',
        'Multi-day and multi-track event support',
        'Clone existing conferences as templates',
        'Real-time collaboration with team members',
        'Automated reminders and notifications',
      ]}
    />
  )
}
