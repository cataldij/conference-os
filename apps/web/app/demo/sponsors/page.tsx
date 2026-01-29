'use client'

import { DemoPlaceholder } from '@/components/demo/demo-placeholder'
import { Building2 } from 'lucide-react'

export default function DemoSponsorsPage() {
  return (
    <DemoPlaceholder
      title="Sponsors"
      description="Manage sponsor relationships and booth experiences."
      icon={Building2}
      features={[
        'Tiered sponsorship packages',
        'Virtual booth customization',
        'Lead capture and analytics',
        'Sponsor portal for asset uploads',
        'ROI reporting and metrics',
      ]}
    />
  )
}
