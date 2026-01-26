'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function BadgePrintControls() {
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Print badges
      </Button>
    </div>
  )
}

