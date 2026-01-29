import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, verifyAuth, isValidUUID } from '../_shared/auth.ts'

interface OpenAIEmbeddingResponse {
  data: { embedding: number[] }[]
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
        input: text.slice(0, 8000),
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const openaiKey = Deno.env.get('OPENAI_API_KEY') ?? ''

    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    const { action, sessionId, conferenceId } = await req.json()

    // Action: Generate embedding for a single session
    if (action === 'session' && sessionId) {
      if (!isValidUUID(sessionId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid sessionId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: session } = await supabaseClient
        .from('sessions')
        .select('id, title, description, topics')
        .eq('id', sessionId)
        .single()

      if (!session) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create embedding text from title + description + topics
      const embeddingText = [
        session.title,
        session.description || '',
        session.topics?.join(', ') || ''
      ].filter(Boolean).join('. ')

      const embedding = await generateEmbedding(embeddingText, openaiKey)

      if (!embedding) {
        return new Response(
          JSON.stringify({ error: 'Failed to generate embedding' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update session with embedding
      const { error: updateError } = await supabaseClient
        .from('sessions')
        .update({
          embedding,
          embedding_updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, sessionId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Action: Generate embeddings for all sessions in a conference
    if (action === 'conference' && conferenceId) {
      if (!isValidUUID(conferenceId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid conferenceId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get all sessions without embeddings
      const { data: sessions } = await supabaseClient
        .from('sessions')
        .select('id, title, description, topics')
        .eq('conference_id', conferenceId)
        .is('embedding', null)
        .limit(50) // Process in batches to avoid timeout

      if (!sessions || sessions.length === 0) {
        return new Response(
          JSON.stringify({ success: true, processed: 0, message: 'All sessions already have embeddings' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      let processed = 0
      let failed = 0

      for (const session of sessions) {
        const embeddingText = [
          session.title,
          session.description || '',
          session.topics?.join(', ') || ''
        ].filter(Boolean).join('. ')

        const embedding = await generateEmbedding(embeddingText, openaiKey)

        if (embedding) {
          const { error } = await supabaseClient
            .from('sessions')
            .update({
              embedding,
              embedding_updated_at: new Date().toISOString()
            })
            .eq('id', session.id)

          if (!error) {
            processed++
          } else {
            failed++
          }
        } else {
          failed++
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      return new Response(
        JSON.stringify({
          success: true,
          processed,
          failed,
          remaining: sessions.length - processed - failed
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Action: Generate embedding for user interests
    if (action === 'user') {
      const { user, error: authError } = await verifyAuth(req)
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: authError || 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('interests, job_title, company')
        .eq('id', user.id)
        .single()

      if (!profile?.interests?.length) {
        return new Response(
          JSON.stringify({ error: 'No interests set in profile' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const embeddingText = [
        profile.interests.join(', '),
        profile.job_title ? `Role: ${profile.job_title}` : '',
        profile.company ? `Company: ${profile.company}` : ''
      ].filter(Boolean).join('. ')

      const embedding = await generateEmbedding(embeddingText, openaiKey)

      if (!embedding) {
        return new Response(
          JSON.stringify({ error: 'Failed to generate embedding' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          interest_embedding: embedding,
          embedding_updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: session, conference, or user' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
