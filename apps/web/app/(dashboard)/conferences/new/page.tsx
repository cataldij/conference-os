import { NewConferenceClient } from './client'
import { createConferenceAction } from './actions'

export default function NewConferencePage() {
  return <NewConferenceClient action={createConferenceAction} />
}
