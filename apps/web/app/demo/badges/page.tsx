'use client'

import { DemoPlaceholder } from '@/components/demo/demo-placeholder'
import { BadgeCheck } from 'lucide-react'

export default function DemoBadgesPage() {
  return (
    <DemoPlaceholder
      title="Badges"
      description="Design and print professional attendee badges."
      icon={BadgeCheck}
      features={[
        'Custom badge templates',
        'QR codes for check-in',
        'Variable data printing',
        'On-site badge printing',
        'Digital badges for virtual events',
      ]}
    />
  )
}
