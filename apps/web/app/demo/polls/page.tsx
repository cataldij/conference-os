'use client'

import { DemoPlaceholder } from '@/components/demo/demo-placeholder'
import { ListChecks } from 'lucide-react'

export default function DemoPollsPage() {
  return (
    <DemoPlaceholder
      title="Live Polls"
      description="Engage your audience with real-time polling."
      icon={ListChecks}
      features={[
        'Multiple choice and rating polls',
        'Word clouds and open-ended questions',
        'Live results visualization',
        'Session-linked polling',
        'Export results for analysis',
      ]}
    />
  )
}
