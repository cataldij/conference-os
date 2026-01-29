'use client'

import { DemoPlaceholder } from '@/components/demo/demo-placeholder'
import { Ticket } from 'lucide-react'

export default function DemoTicketsPage() {
  return (
    <DemoPlaceholder
      title="Tickets"
      description="Create ticket types and manage sales."
      icon={Ticket}
      features={[
        'Multiple ticket tiers and pricing',
        'Early bird and promo codes',
        'Group discounts and packages',
        'Stripe integration for payments',
        'Real-time sales dashboard',
      ]}
    />
  )
}
