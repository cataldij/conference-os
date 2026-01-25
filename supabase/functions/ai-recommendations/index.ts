import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SessionRecommendation {
  sessionId: string
  score: number
  reason: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { conferenceId } = await req.json()

    // Get user's profile and interests
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('interests')
      .eq('id', user.id)
      .single()

    // Get user's saved sessions to understand preferences
    const { data: savedSessions } = await supabaseClient
      .from('saved_sessions')
      .select('session:sessions(track_id, session_type)')
      .eq('user_id', user.id)

    // Get all upcoming sessions for the conference
    const { data: sessions } = await supabaseClient
      .from('sessions')
      .select('id, title, description, track_id, session_type, track:tracks(name)')
      .eq('conference_id', conferenceId)
      .gte('start_time', new Date().toISOString())

    if (!sessions) {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Simple recommendation algorithm (can be enhanced with OpenAI)
    const recommendations: SessionRecommendation[] = sessions
      .map((session) => {
        let score = 0
        let reasons: string[] = []

        // Match interests with session title/description
        if (profile?.interests) {
          const sessionText = `${session.title} ${session.description}`.toLowerCase()
          profile.interests.forEach((interest: string) => {
            if (sessionText.includes(interest.toLowerCase())) {
              score += 30
              reasons.push(`Matches your interest in ${interest}`)
            }
          })
        }

        // Boost sessions in tracks user has engaged with
        const userTrackPreferences = savedSessions
          ?.map((s: any) => s.session?.track_id)
          .filter(Boolean)

        if (userTrackPreferences?.includes(session.track_id)) {
          score += 20
          reasons.push(`Similar to sessions you've saved`)
        }

        // Boost keynotes and featured sessions
        if (session.session_type === 'keynote') {
          score += 15
          reasons.push('Featured keynote session')
        }

        return {
          sessionId: session.id,
          score,
          reason: reasons.join('. '),
        }
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
