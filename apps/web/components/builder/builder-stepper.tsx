'use client'

import { useBuilder } from '@/contexts/builder-context'
import { cn } from '@/lib/utils'
import { Check, FileText, Palette, LayoutGrid, Rocket } from 'lucide-react'

const STEPS = [
  { id: 0, name: 'Overview', description: 'Event details', icon: FileText },
  { id: 1, name: 'Branding', description: 'Design system', icon: Palette },
  { id: 2, name: 'Navigation', description: 'App modules', icon: LayoutGrid },
  { id: 3, name: 'Publish', description: 'Go live', icon: Rocket },
]

export function BuilderStepper() {
  const { currentStep, setStep } = useBuilder()

  return (
    <div className="rounded-2xl border bg-white/80 p-4 backdrop-blur-xl">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isComplete = currentStep > step.id
            const isCurrent = currentStep === step.id

            return (
              <li key={step.name} className="relative flex-1">
                {index !== 0 && (
                  <div
                    className={cn(
                      'absolute left-0 top-5 -ml-px h-0.5 w-full -translate-x-1/2',
                      isComplete ? 'bg-primary' : 'bg-slate-200'
                    )}
                    aria-hidden="true"
                  />
                )}
                <button
                  onClick={() => setStep(step.id)}
                  className={cn(
                    'group relative flex flex-col items-center',
                    (isComplete || isCurrent) ? 'cursor-pointer' : 'cursor-default'
                  )}
                >
                  <span
                    className={cn(
                      'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                      isComplete
                        ? 'border-primary bg-primary text-white'
                        : isCurrent
                        ? 'border-primary bg-white text-primary'
                        : 'border-slate-300 bg-white text-slate-400'
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </span>
                  <span className="mt-2 text-center">
                    <span
                      className={cn(
                        'block text-sm font-semibold',
                        isCurrent ? 'text-primary' : isComplete ? 'text-slate-900' : 'text-slate-500'
                      )}
                    >
                      {step.name}
                    </span>
                    <span className="block text-xs text-slate-500">{step.description}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
