'use client'

import { DemoPlaceholder } from '@/components/demo/demo-placeholder'
import { BarChart3 } from 'lucide-react'

export default function DemoAnalyticsPage() {
  return (
    <DemoPlaceholder
      title="Analytics"
      description="Track engagement and measure event success."
      icon={BarChart3}
      features={[
        'Real-time attendance tracking',
        'Session popularity metrics',
        'Engagement scoring',
        'Custom report builder',
        'Export to PDF and CSV',
      ]}
    />
  )
}
