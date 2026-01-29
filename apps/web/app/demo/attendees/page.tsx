'use client'

import { DemoPlaceholder } from '@/components/demo/demo-placeholder'
import { Users } from 'lucide-react'

export default function DemoAttendeesPage() {
  return (
    <DemoPlaceholder
      title="Attendees"
      description="Track registrations and manage your attendee experience."
      icon={Users}
      features={[
        'Import attendees via CSV or API',
        'Custom registration forms and fields',
        'Attendee segmentation and tagging',
        'Bulk email and communication tools',
        'Export attendee data and analytics',
      ]}
    />
  )
}
