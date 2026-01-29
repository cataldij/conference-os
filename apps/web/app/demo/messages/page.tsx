'use client'

import { DemoPlaceholder } from '@/components/demo/demo-placeholder'
import { MessageSquare } from 'lucide-react'

export default function DemoMessagesPage() {
  return (
    <DemoPlaceholder
      title="Messages"
      description="Real-time chat and networking for your attendees."
      icon={MessageSquare}
      features={[
        'Public and private chat rooms',
        'Direct messaging between attendees',
        'Session-specific Q&A channels',
        'Moderation tools and filters',
        'Message export and analytics',
      ]}
    />
  )
}
