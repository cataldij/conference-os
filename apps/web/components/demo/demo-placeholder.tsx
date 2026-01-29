'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LucideIcon, ArrowRight, Sparkles, Lock } from 'lucide-react'

interface DemoPlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  features?: string[]
}

export function DemoPlaceholder({ title, description, icon: Icon, features }: DemoPlaceholderProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20">
          <Icon className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{description}</p>

        {features && features.length > 0 && (
          <div className="mt-6 rounded-2xl border bg-white/50 p-6 text-left">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              What you can do with the full version:
            </div>
            <ul className="space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/register">
              Get Full Access
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="gap-2">
            <Link href="/demo/design">
              <Sparkles className="h-4 w-4" />
              Try Design Studio
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Read-only demo mode</span>
        </div>
      </div>
    </div>
  )
}
