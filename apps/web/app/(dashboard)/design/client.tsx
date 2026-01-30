'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DesignSystemProvider } from '@/contexts/design-system-context'
import { DesignEditor } from '@/components/design-system/design-editor'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, Eye, Settings } from 'lucide-react'

interface Conference {
  id: string
  name: string
  slug: string
}

interface DesignStudioClientProps {
  conferences: Conference[]
}

export function DesignStudioClient({ conferences }: DesignStudioClientProps) {
  const [selectedConference, setSelectedConference] = useState<Conference>(conferences[0])

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Design Studio</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedConference.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Conference Selector */}
          {conferences.length > 1 && (
            <select
              value={selectedConference.id}
              onChange={(e) => {
                const conf = conferences.find(c => c.id === e.target.value)
                if (conf) setSelectedConference(conf)
              }}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {conferences.map((conf) => (
                <option key={conf.id} value={conf.id}>
                  {conf.name}
                </option>
              ))}
            </select>
          )}

          <Button variant="outline" asChild>
            <Link href={`/c/${selectedConference.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/conferences/${selectedConference.id}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6">
        <DesignSystemProvider
          key={selectedConference.id}
          conferenceId={selectedConference.id}
          demoMode={false}
        >
          <DesignEditor conferenceId={selectedConference.id} />
        </DesignSystemProvider>
      </div>
    </div>
  )
}
