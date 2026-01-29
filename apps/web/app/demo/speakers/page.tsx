'use client'

import { DemoPlaceholder } from '@/components/demo/demo-placeholder'
import { UserCog } from 'lucide-react'

export default function DemoSpeakersPage() {
  return (
    <DemoPlaceholder
      title="Speakers"
      description="Manage your speaker lineup and session assignments."
      icon={UserCog}
      features={[
        'Speaker portal for bio and photo uploads',
        'Session assignment and scheduling',
        'Travel and accommodation tracking',
        'Speaker communication hub',
        'Presentation file collection',
      ]}
    />
  )
}
