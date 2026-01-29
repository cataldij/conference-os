import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, verifyAuth, isValidUUID, checkRateLimit } from '../_shared/auth.ts'

interface SessionRecommendation {
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

interface OpenAIEmbeddingResponse {
  data: { embedding: number[] }[]
}

interface AnthropicResponse {
  content: { text: string }[]
}

// Generate embedding using OpenAI
async function generateEmbedding(text: string, openaiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000), // Limit input length
      }),
    })

    if (!response.ok) {
      console.error('OpenAI embedding error:', await response.text())
      return null
    }

    const data: OpenAIEmbeddingResponse = await response.json()
    return data.data[0].embedding
  } catch (error) {
    console.error('Embedding generation failed:', error)
    return null
  }
}

// Generate personalized explanations using Claude
async function generateExplanations(
  sessions: any[],
  userProfile: any,
  anthropicKey: string
): Promise<Record<string, string>> {
  try {
    const sessionList = sessions.slice(0, 5).map((s, i) =>
      `${i + 1}. "${s.title}" - ${s.track?.name || 'General'} track`
    ).join('\n')

    const interests = userProfile?.interests?.join(', ') || 'general topics'
    const jobTitle = userProfile?.job_title || 'attendee'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `You're a conference assistant. Generate brief, friendly 1-sentence recommendations for why this ${jobTitle} interested in ${interests} should attend each session. Be specific and actionable.

Sessions:
${sessionList}

Return JSON object mapping session number to recommendation. Example:
{"1": "Perfect for learning practical AI implementation strategies", "2": "Great networking opportunity with design leaders"}

Only return the JSON, no other text.`
        }]
      }),
    })

    if (!response.ok) {
      console.error('Anthropic error:', await response.text())
      return {}
    }

    const data: AnthropicResponse = await response.json()
    const text = data.content[0]?.text || '{}'

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      // Map back to session IDs
      const result: Record<string, string> = {}
      sessions.slice(0, 5).forEach((s, i) => {
        if (parsed[String(i + 1)]) {
          result[s.id] = parsed[String(i + 1)]
        }
      })
      return result
    }
    return {}
  } catch (error) {
    console.error('Explanation generation failed:', error)
    return {}
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Rate limiting by IP
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIP, 30, 60000)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify authentication
    const { user, error: authError } = await verifyAuth(req)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: authError || 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { conferenceId, forceRefresh } = await req.json()

    // Validate conferenceId format
    if (!conferenceId || !isValidUUID(conferenceId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing conferenceId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const openaiKey = Deno.env.get('OPENAI_API_KEY') ?? ''
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Verify user is a member of this conference
    const { data: membership } = await supabaseClient
      .from('conference_members')
      .select('id')
      .eq('conference_id', conferenceId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return new Response(
        JSON.stringify({ error: 'Not a member of this conference' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for cached recommendations (unless force refresh)
    if (!forceRefresh) {
      const { data: cached } = await supabaseClient
        .from('user_recommendations')
        .select(`
          session_id,
          score,
          reason,
          recommendation_type,
          sessions (
            id, title, start_time,
            track:tracks(name, color),
            room:rooms(name)
          )
        `)
        .eq('user_id', user.id)
        .eq('conference_id', conferenceId)
        .gt('expires_at', new Date().toISOString())
        .order('score', { ascending: false })
        .limit(10)

      if (cached && cached.length > 0) {
        const recommendations: SessionRecommendation[] = cached.map((r: any) => ({
          sessionId: r.session_id,
          title: r.sessions?.title,
          score: r.score,
          reason: r.reason,
          type: r.recommendation_type,
          track: r.sessions?.track?.name,
          trackColor: r.sessions?.track?.color,
          startTime: r.sessions?.start_time,
          room: r.sessions?.room?.name,
        }))
        return new Response(JSON.stringify({ recommendations, cached: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Get user's profile and interests
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('interests, job_title, company, interest_embedding')
      .eq('id', user.id)
      .single()

    // Get user's saved sessions to understand preferences
    const { data: savedSessions } = await supabaseClient
      .from('saved_sessions')
      .select('session_id')
      .eq('user_id', user.id)

    const savedSessionIds = new Set(savedSessions?.map((s: any) => s.session_id) || [])

    // Get user's past interactions
    const { data: interactions } = await supabaseClient
      .from('session_interactions')
      .select('session_id, interaction_type, rating')
      .eq('user_id', user.id)

    // Get all upcoming sessions for the conference
    const { data: sessions } = await supabaseClient
      .from('sessions')
      .select(`
        id, title, description, session_type, start_time, end_time,
        embedding, topics, difficulty,
        track:tracks(id, name, color),
        room:rooms(name)
      `)
      .eq('conference_id', conferenceId)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })

    if (!sessions || sessions.length === 0) {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Filter out already saved sessions
    const unsavedSessions = sessions.filter(s => !savedSessionIds.has(s.id))

    // ===== HYBRID RECOMMENDATION ALGORITHM =====

    let scoredSessions: { session: any; score: number; type: string }[] = []

    // 1. EMBEDDING SIMILARITY (if user has interests)
    if (profile?.interests?.length > 0 && openaiKey) {
      // Generate user interest embedding if not exists
      let userEmbedding = profile.interest_embedding

      if (!userEmbedding) {
        const interestText = profile.interests.join(', ') +
          (profile.job_title ? `. Role: ${profile.job_title}` : '')
        userEmbedding = await generateEmbedding(interestText, openaiKey)

        // Cache user embedding
        if (userEmbedding) {
          await supabaseClient
            .from('profiles')
            .update({
              interest_embedding: userEmbedding,
              embedding_updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
        }
      }

      if (userEmbedding) {
        // Find sessions with embeddings and calculate similarity
        for (const session of unsavedSessions) {
          if (session.embedding) {
            // Cosine similarity
            const similarity = cosineSimilarity(userEmbedding, session.embedding)
            scoredSessions.push({
              session,
              score: similarity * 100,
              type: 'interest_match'
            })
          }
        }
      }
    }

    // 2. KEYWORD MATCHING (fallback if no embeddings)
    if (scoredSessions.length === 0 && profile?.interests) {
      for (const session of unsavedSessions) {
        const sessionText = `${session.title} ${session.description || ''} ${session.topics?.join(' ') || ''}`.toLowerCase()
        let score = 0

        for (const interest of profile.interests) {
          if (sessionText.includes(interest.toLowerCase())) {
            score += 25
          }
        }

        if (score > 0) {
          scoredSessions.push({ session, score, type: 'interest_match' })
        }
      }
    }

    // 3. TRACK PREFERENCE (from past behavior)
    const preferredTracks = new Map<string, number>()
    interactions?.forEach((i: any) => {
      const trackId = sessions.find(s => s.id === i.session_id)?.track?.id
      if (trackId) {
        preferredTracks.set(trackId, (preferredTracks.get(trackId) || 0) + 1)
      }
    })

    for (const session of unsavedSessions) {
      const trackCount = preferredTracks.get(session.track?.id) || 0
      if (trackCount > 0) {
        const existing = scoredSessions.find(s => s.session.id === session.id)
        if (existing) {
          existing.score += trackCount * 10
        } else {
          scoredSessions.push({
            session,
            score: trackCount * 15,
            type: 'similar_attendees'
          })
        }
      }
    }

    // 4. BOOST KEYNOTES
    for (const scored of scoredSessions) {
      if (scored.session.session_type === 'keynote') {
        scored.score += 20
      }
    }

    // Sort and take top 10
    scoredSessions.sort((a, b) => b.score - a.score)
    const topSessions = scoredSessions.slice(0, 10)

    // 5. GENERATE AI EXPLANATIONS (for top 5)
    let explanations: Record<string, string> = {}
    if (anthropicKey && topSessions.length > 0) {
      explanations = await generateExplanations(
        topSessions.map(s => s.session),
        profile,
        anthropicKey
      )
    }

    // Build final recommendations
    const recommendations: SessionRecommendation[] = topSessions.map(({ session, score, type }) => ({
      sessionId: session.id,
      title: session.title,
      score: Math.round(score),
      reason: explanations[session.id] || getDefaultReason(type, session),
      type: type as SessionRecommendation['type'],
      track: session.track?.name,
      trackColor: session.track?.color,
      startTime: session.start_time,
      room: session.room?.name,
    }))

    // Cache recommendations
    if (recommendations.length > 0) {
      // Clear old recommendations
      await supabaseClient
        .from('user_recommendations')
        .delete()
        .eq('user_id', user.id)
        .eq('conference_id', conferenceId)

      // Insert new ones
      await supabaseClient
        .from('user_recommendations')
        .insert(recommendations.map(r => ({
          user_id: user.id,
          conference_id: conferenceId,
          session_id: r.sessionId,
          score: r.score,
          reason: r.reason,
          recommendation_type: r.type,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
        })))
    }

    return new Response(JSON.stringify({ recommendations, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// Helper: Cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Helper: Default reason when AI explanation not available
function getDefaultReason(type: string, session: any): string {
  switch (type) {
    case 'interest_match':
      return `Matches your interests in ${session.track?.name || 'this topic'}`
    case 'popular':
      return 'Popular session with high engagement'
    case 'similar_attendees':
      return 'Attendees like you found this valuable'
    case 'skill_building':
      return 'Builds on sessions you\'ve attended'
    case 'schedule_fit':
      return 'Fits perfectly in your schedule'
    default:
      return 'Recommended based on your profile'
  }
}
