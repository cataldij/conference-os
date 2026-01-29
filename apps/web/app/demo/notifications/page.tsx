'use client'

import { DemoPlaceholder } from '@/components/demo/demo-placeholder'
import { Bell } from 'lucide-react'

export default function DemoNotificationsPage() {
  return (
    <DemoPlaceholder
      title="Notifications"
      description="Send push notifications and announcements."
      icon={Bell}
      features={[
        'Push notifications to mobile app',
        'Scheduled announcements',
        'Segment-targeted messaging',
        'Real-time alerts for sessions',
        'Delivery tracking and analytics',
      ]}
    />
  )
}
