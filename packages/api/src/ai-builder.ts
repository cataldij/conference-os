// @ts-nocheck
// AI Conference Builder API
import { getSupabase } from './client'

// Generation types
export type AIGenerationType =
  | 'conference_details'
  | 'tracks'
  | 'sessions'
  | 'session_description'
  | 'speaker_bio'
  | 'schedule'
  | 'marketing_copy'
  | 'chat'

// Response types for each generation
export interface ConferenceDetailsResponse {
  name: string
  tagline: string
  description: string
}

export interface TrackSuggestion {
  name: string
  description: string
  color: string
  suggestedSessionCount: number
}

export interface TracksResponse {
  tracks: TrackSuggestion[]
}

export interface SessionSuggestion {
  title: string
  description: string
  sessionType: 'keynote' | 'talk' | 'panel' | 'workshop'
  durationMinutes: number
  level: 'beginner' | 'intermediate' | 'advanced'
  suggestedSpeakerProfile: string
}

export interface SessionsResponse {
  sessions: SessionSuggestion[]
}

export interface SessionDescriptionResponse {
  description: string
  keyTakeaways: string[]
  targetAudience: string
}

export interface SpeakerBioResponse {
  bio: string
  extendedBio: string
  suggestedTopics: string[]
}

export interface ScheduleBlock {
  startTime: string
  endTime: string
  type: 'keynote' | 'session' | 'break' | 'networking' | 'lunch'
  title: string
  room?: string
  trackId?: string
}

export interface ScheduleDay {
  date: string
  blocks: ScheduleBlock[]
}

export interface ScheduleResponse {
  days: ScheduleDay[]
}

export interface MarketingCopyResponse {
  subject?: string
  headline?: string
  body: string
  cta?: string
  hashtags?: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIGenerationResult<T> {
  type: AIGenerationType
  content: T
  usage?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

// Context types for each generation
export interface ConferenceDetailsContext {
  topic: string
  industry?: string
  audience?: string
  size?: string
  duration?: string
  additionalNotes?: string
}

export interface TracksContext {
  conferenceName: string
  theme: string
  audience?: string
  duration?: string
  existingTracks?: string
}

export interface SessionsContext {
  trackName: string
  trackDescription?: string
  conferenceTheme?: string
  audience?: string
  existingSessions?: string
}

export interface SessionDescriptionContext {
  title: string
  speaker?: string
  track?: string
  sessionType?: string
  currentDescription?: string
  notes?: string
  enhance?: boolean
}

export interface SpeakerBioContext {
  name: string
  company?: string
  role?: string
  expertise?: string
  achievements?: string
  currentBio?: string
}

export interface ScheduleContext {
  conferenceName: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  tracks?: Array<{ id: string; name: string }>
  roomCount?: number
  includeNetworking?: boolean
  includeLunch?: boolean
}

export interface MarketingCopyContext {
  copyType: 'email' | 'social' | 'website' | 'announcement'
  conferenceName: string
  tagline?: string
  highlights?: string
  audience?: string
  dates?: string
  location?: string
  cta?: string
  tone?: string
}

export interface ChatContext {
  message: string
}

// Main generation function
async function callAIBuilder<T>(
  type: AIGenerationType,
  context: Record<string, any>,
  previousMessages?: ChatMessage[]
): Promise<AIGenerationResult<T>> {
  const supabase = getSupabase()

  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-conference-builder`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify({
        type,
        context,
        previousMessages,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'AI generation failed')
  }

  return response.json()
}

// Typed generation functions
export async function generateConferenceDetails(
  context: ConferenceDetailsContext
): Promise<AIGenerationResult<ConferenceDetailsResponse>> {
  return callAIBuilder('conference_details', context)
}

export async function generateTracks(
  context: TracksContext
): Promise<AIGenerationResult<TracksResponse>> {
  return callAIBuilder('tracks', context)
}

export async function generateSessions(
  context: SessionsContext
): Promise<AIGenerationResult<SessionsResponse>> {
  return callAIBuilder('sessions', context)
}

export async function generateSessionDescription(
  context: SessionDescriptionContext
): Promise<AIGenerationResult<SessionDescriptionResponse>> {
  return callAIBuilder('session_description', context)
}

export async function generateSpeakerBio(
  context: SpeakerBioContext
): Promise<AIGenerationResult<SpeakerBioResponse>> {
  return callAIBuilder('speaker_bio', context)
}

export async function generateSchedule(
  context: ScheduleContext
): Promise<AIGenerationResult<ScheduleResponse>> {
  return callAIBuilder('schedule', context)
}

export async function generateMarketingCopy(
  context: MarketingCopyContext
): Promise<AIGenerationResult<MarketingCopyResponse>> {
  return callAIBuilder('marketing_copy', context)
}

export async function chatWithAssistant(
  message: string,
  previousMessages?: ChatMessage[]
): Promise<AIGenerationResult<string>> {
  return callAIBuilder('chat', { message }, previousMessages)
}

// Streaming chat (for better UX) - uses Server-Sent Events if available
export async function streamChatWithAssistant(
  message: string,
  previousMessages: ChatMessage[],
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  // For now, fall back to regular chat since Gemini streaming requires different setup
  try {
    const result = await chatWithAssistant(message, previousMessages)
    onComplete(result.content)
  } catch (error) {
    onError(error as Error)
  }
}
