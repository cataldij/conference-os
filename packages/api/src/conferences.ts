// @ts-nocheck
// TODO: Fix Supabase type inference issues
import { getSupabase, Conference, ConferenceMember, Session, Track, Room } from './client'
import { z } from 'zod'

// Validation schemas
export const conferenceSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  tagline: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  startDate: z.string(),
  endDate: z.string(),
  timezone: z.string().default('UTC'),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  primaryColor: z.string().default('#2563eb'),
  isPublic: z.boolean().default(true),
  isHybrid: z.boolean().default(false),
  maxAttendees: z.number().optional(),
})

export type ConferenceInput = z.infer<typeof conferenceSchema>

// Conference with related data
export interface ConferenceWithDetails extends Conference {
  tracks: Track[]
  rooms: Room[]
  memberCount: number
}

export interface SessionQuestion {
  id: string
  user_id: string
  question: string
  is_anonymous: boolean
  upvotes: number
  is_answered: boolean
  is_featured: boolean
  created_at: string
  user?: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

export interface SessionPollOption {
  id: string
  text: string
}

export interface SessionPoll {
  id: string
  question: string
  options: SessionPollOption[]
  is_active: boolean
  show_results: boolean
  allow_multiple: boolean
  created_at: string
  closed_at: string | null
}

export type PollResponseCounts = Record<string, Record<string, number>>
export type UserPollResponses = Record<string, string[]>

function normalizePollOptions(rawOptions: unknown): SessionPollOption[] {
  if (!Array.isArray(rawOptions)) return []

  return rawOptions
    .map((option, index) => {
      if (typeof option === 'string') {
        return { id: String(index), text: option }
      }

      if (
        option &&
        typeof option === 'object' &&
        'id' in option &&
        'text' in option
      ) {
        return {
          id: String((option as { id: unknown }).id),
          text: String((option as { text: unknown }).text),
        }
      }

      if (option && typeof option === 'object' && 'text' in option) {
        return {
          id: String(index),
          text: String((option as { text: unknown }).text),
        }
      }

      return null
    })
    .filter((option): option is SessionPollOption => Boolean(option))
}

// Fetch conferences
export async function getPublicConferences(): Promise<Conference[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('conferences')
    .select('*')
    .eq('is_public', true)
    .order('start_date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getUpcomingConferences(): Promise<Conference[]> {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('conferences')
    .select('*')
    .eq('is_public', true)
    .gte('end_date', today)
    .order('start_date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getConferenceBySlug(slug: string): Promise<ConferenceWithDetails | null> {
  const supabase = getSupabase()

  const { data: conference, error } = await supabase
    .from('conferences')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // Get tracks
  const { data: tracks } = await supabase
    .from('tracks')
    .select('*')
    .eq('conference_id', conference.id)
    .order('sort_order')

  // Get rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('conference_id', conference.id)
    .order('sort_order')

  // Get member count
  const { count } = await supabase
    .from('conference_members')
    .select('*', { count: 'exact', head: true })
    .eq('conference_id', conference.id)

  return {
    ...conference,
    tracks: tracks || [],
    rooms: rooms || [],
    memberCount: count || 0,
  }
}

export async function getConferenceById(id: string): Promise<Conference | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('conferences')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

// User's conferences (ones they're registered for)
export async function getUserConferences(userId: string): Promise<Conference[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('conference_members')
    .select('conference:conferences(*)')
    .eq('user_id', userId)
    .order('registered_at', { ascending: false })

  if (error) throw error

  return data?.map(d => d.conference as Conference).filter(Boolean) || []
}

// Conference membership
export async function joinConference(conferenceId: string, userId: string, ticketType?: string): Promise<ConferenceMember> {
  const supabase = getSupabase()

  // Generate unique ticket code
  const ticketCode = `${conferenceId.slice(0, 8)}-${userId.slice(0, 8)}-${Date.now().toString(36)}`

  const { data, error } = await supabase
    .from('conference_members')
    .insert({
      conference_id: conferenceId,
      user_id: userId,
      role: 'attendee',
      ticket_type: ticketType || 'general',
      ticket_code: ticketCode,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getConferenceMembership(conferenceId: string, userId: string): Promise<ConferenceMember | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('conference_members')
    .select('*')
    .eq('conference_id', conferenceId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

export async function checkInAttendee(ticketCode: string, checkedInBy: string): Promise<ConferenceMember> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('conference_members')
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString(),
      checked_in_by: checkedInBy,
    })
    .eq('ticket_code', ticketCode)
    .select()
    .single()

  if (error) throw error
  return data
}

// Sessions
export async function getConferenceSessions(conferenceId: string): Promise<Session[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('conference_id', conferenceId)
    .order('start_time', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getSessionsByDate(conferenceId: string, date: string): Promise<Session[]> {
  const supabase = getSupabase()

  const startOfDay = `${date}T00:00:00Z`
  const endOfDay = `${date}T23:59:59Z`

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('conference_id', conferenceId)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .order('start_time', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getSessionById(sessionId: string): Promise<Session | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      track:tracks(*),
      room:rooms(*)
    `)
    .eq('id', sessionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

export async function getSessionQuestions(sessionId: string): Promise<SessionQuestion[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('qa_questions')
    .select(`
      *,
      user:profiles(full_name, avatar_url)
    `)
    .eq('session_id', sessionId)
    .order('is_featured', { ascending: false })
    .order('upvotes', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getUserUpvotedQuestionIds(userId: string): Promise<string[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('qa_upvotes')
    .select('question_id')
    .eq('user_id', userId)

  if (error) throw error
  return (data || []).map((row) => row.question_id)
}

export async function askSessionQuestion(
  sessionId: string,
  userId: string,
  question: string,
  isAnonymous = false
) {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('qa_questions')
    .insert({
      session_id: sessionId,
      user_id: userId,
      question: question.trim(),
      is_anonymous: isAnonymous,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleSessionQuestionUpvote(
  questionId: string,
  userId: string,
  hasUpvoted: boolean
): Promise<boolean> {
  const supabase = getSupabase()

  if (hasUpvoted) {
    const { error: deleteError } = await supabase
      .from('qa_upvotes')
      .delete()
      .eq('question_id', questionId)
      .eq('user_id', userId)

    if (deleteError) throw deleteError

    const { error: rpcError } = await supabase.rpc('decrement_upvotes', {
      question_id: questionId,
    })

    if (rpcError) {
      console.warn('decrement_upvotes RPC warning:', rpcError.message)
    }

    return false
  }

  const { error: insertError } = await supabase.from('qa_upvotes').insert({
    question_id: questionId,
    user_id: userId,
  })

  if (insertError) throw insertError

  const { error: rpcError } = await supabase.rpc('increment_upvotes', {
    question_id: questionId,
  })

  if (rpcError) {
    console.warn('increment_upvotes RPC warning:', rpcError.message)
  }

  return true
}

export async function getSessionPolls(sessionId: string): Promise<SessionPoll[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((poll) => ({
    ...poll,
    options: normalizePollOptions(poll.options),
  }))
}

export async function getPollResponseCounts(pollIds: string[]): Promise<PollResponseCounts> {
  const supabase = getSupabase()

  if (!pollIds.length) return {}

  const { data, error } = await supabase
    .from('poll_responses')
    .select('poll_id, option_id')
    .in('poll_id', pollIds)

  if (error) throw error

  const counts: PollResponseCounts = {}

  for (const row of data || []) {
    if (!counts[row.poll_id]) {
      counts[row.poll_id] = {}
    }
    counts[row.poll_id][row.option_id] = (counts[row.poll_id][row.option_id] || 0) + 1
  }

  return counts
}

export async function getUserPollResponses(
  userId: string,
  pollIds: string[]
): Promise<UserPollResponses> {
  const supabase = getSupabase()

  if (!pollIds.length) return {}

  const { data, error } = await supabase
    .from('poll_responses')
    .select('poll_id, option_id')
    .eq('user_id', userId)
    .in('poll_id', pollIds)

  if (error) throw error

  const responses: UserPollResponses = {}

  for (const row of data || []) {
    if (!responses[row.poll_id]) {
      responses[row.poll_id] = []
    }
    responses[row.poll_id].push(row.option_id)
  }

  return responses
}

export async function submitPollResponse(pollId: string, userId: string, optionId: string) {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('poll_responses')
    .insert({
      poll_id: pollId,
      user_id: userId,
      option_id: optionId,
    })
    .select()
    .single()

  // Unique conflict means user already voted for this option; treat as success.
  if (error && error.code !== '23505') throw error
  return data
}

export async function getSessionAttendanceCount(sessionId: string): Promise<number | null> {
  const supabase = getSupabase()

  const { count, error } = await supabase
    .from('session_attendance')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)

  if (error) {
    console.warn('Could not fetch session attendance count:', error.message)
    return null
  }

  return count || 0
}

// Saved sessions (user's personal agenda)
export async function saveSession(userId: string, sessionId: string) {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('saved_sessions')
    .insert({
      user_id: userId,
      session_id: sessionId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unsaveSession(userId: string, sessionId: string) {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('saved_sessions')
    .delete()
    .eq('user_id', userId)
    .eq('session_id', sessionId)

  if (error) throw error
}

export async function getUserSavedSessions(userId: string, conferenceId: string): Promise<Session[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('saved_sessions')
    .select('session:sessions(*)')
    .eq('user_id', userId)

  if (error) throw error

  const sessions = data?.map(d => d.session as Session).filter(Boolean) || []
  return sessions.filter(s => s.conference_id === conferenceId)
}

// Tracks
export async function getConferenceTracks(conferenceId: string): Promise<Track[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('conference_id', conferenceId)
    .order('sort_order')

  if (error) throw error
  return data || []
}

// Rooms
export async function getConferenceRooms(conferenceId: string): Promise<Room[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('conference_id', conferenceId)
    .order('sort_order')

  if (error) throw error
  return data || []
}

// Conference creation (for organizers)
export async function createConference(input: ConferenceInput, createdBy: string): Promise<Conference> {
  const supabase = getSupabase()
  const validated = conferenceSchema.parse(input)

  const { data, error } = await supabase
    .from('conferences')
    .insert({
      name: validated.name,
      slug: validated.slug,
      tagline: validated.tagline,
      description: validated.description,
      start_date: validated.startDate,
      end_date: validated.endDate,
      timezone: validated.timezone,
      venue_name: validated.venueName,
      venue_address: validated.venueAddress,
      primary_color: validated.primaryColor,
      is_public: validated.isPublic,
      is_hybrid: validated.isHybrid,
      max_attendees: validated.maxAttendees,
      created_by: createdBy,
    })
    .select()
    .single()

  if (error) throw error

  // Auto-add creator as organizer
  await supabase.from('conference_members').insert({
    conference_id: data.id,
    user_id: createdBy,
    role: 'organizer',
  })

  return data
}

// =============================================
// AI RECOMMENDATIONS
// =============================================

export interface SessionRecommendation {
  sessionId: string
  title: string
  score: number
  reason: string
  type: 'interest_match' | 'popular' | 'similar_attendees' | 'skill_building' | 'schedule_fit'
  track?: string
  trackColor?: string
  startTime: string
  room?: string
}

export async function getSessionRecommendations(
  conferenceId: string,
  forceRefresh = false
): Promise<SessionRecommendation[]> {
  const supabase = getSupabase()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-recommendations`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conferenceId, forceRefresh }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get recommendations')
  }

  const data = await response.json()
  return data.recommendations || []
}

// Track session interaction (for improving recommendations)
export async function trackSessionInteraction(
  sessionId: string,
  interactionType: 'viewed' | 'saved' | 'attended' | 'rated' | 'shared',
  rating?: number,
  durationSeconds?: number
) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('session_interactions')
    .upsert({
      user_id: user.id,
      session_id: sessionId,
      interaction_type: interactionType,
      rating,
      duration_seconds: durationSeconds,
    }, {
      onConflict: 'user_id,session_id,interaction_type'
    })

  if (error) throw error
}

// Update user interests (triggers embedding regeneration)
export async function updateUserInterests(interests: string[]) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({
      interests,
      interest_embedding: null, // Clear to force regeneration
      embedding_updated_at: null,
    })
    .eq('id', user.id)

  if (error) throw error
}
