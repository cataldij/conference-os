'use client'

import { DemoPlaceholder } from '@/components/demo/demo-placeholder'
import { Settings } from 'lucide-react'

export default function DemoSettingsPage() {
  return (
    <DemoPlaceholder
      title="Settings"
      description="Configure your conference and account settings."
      icon={Settings}
      features={[
        'Custom domain mapping',
        'Email template customization',
        'Integration settings (Stripe, Zoom)',
        'Team member permissions',
        'API keys and webhooks',
      ]}
    />
  )
}
