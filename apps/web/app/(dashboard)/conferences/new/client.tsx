'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AIConferenceForm } from '@/components/conference/ai-conference-form'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { FormState } from './actions'

interface NewConferenceClientProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        'Create Conference'
      )}
    </Button>
  )
}

export function NewConferenceClient({ action }: NewConferenceClientProps) {
  const [state, formAction] = useFormState(action, {})

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Conference</h1>
          <p className="text-muted-foreground">
            Create a new conference with AI-powered assistance
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/conferences">Back to Conferences</Link>
        </Button>
      </div>

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{state.error}</p>
        </div>
      )}

      <AIConferenceForm action={formAction}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/conferences">Cancel</Link>
          </Button>
          <SubmitButton />
        </div>
      </AIConferenceForm>
    </div>
  )
}
