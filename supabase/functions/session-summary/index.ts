import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, verifyAuth, isValidUUID, checkRateLimit } from '../_shared/auth.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Rate limiting by IP
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIP, 20, 60000)) {
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

    const { sessionId } = await req.json()

    // Validate input format
    if (!sessionId || !isValidUUID(sessionId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch session details
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        track:tracks(name),
        speakers:session_speakers(
          speaker:profiles(full_name, company, job_title)
        )
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If session already has a summary, return it
    if (session.summary) {
      return new Response(
        JSON.stringify({
          summary: session.summary,
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If no transcript available, cannot generate summary
    if (!session.transcript) {
      return new Response(
        JSON.stringify({
          error: 'No transcript available for this session',
          summary: null
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate summary using OpenAI GPT-4
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `You are an expert conference session summarizer. Generate a comprehensive but concise summary of the following session transcript.

Session Title: ${session.title}
Speaker(s): ${session.speakers.map((s: any) => s.speaker.full_name).join(', ')}
Track: ${session.track?.name || 'General'}

Transcript:
${session.transcript}

Please provide:
1. A brief overview (2-3 sentences) of what was covered
2. Key takeaways (3-5 bullet points)
3. Important quotes or highlights (if any)
4. Action items or next steps mentioned (if any)

Format the response as structured JSON with keys: overview, keyTakeaways (array), quotes (array), actionItems (array)`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional conference session summarizer. Provide clear, actionable summaries.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', await openaiResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to generate summary' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiData = await openaiResponse.json()
    const summaryText = openaiData.choices[0].message.content

    // Parse the JSON response
    let summaryJson
    try {
      summaryJson = JSON.parse(summaryText)
    } catch (e) {
      // If not valid JSON, treat entire response as overview
      summaryJson = {
        overview: summaryText,
        keyTakeaways: [],
        quotes: [],
        actionItems: []
      }
    }

    // Store the summary in the database
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ summary: summaryJson })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Failed to save summary:', updateError)
    }

    return new Response(
      JSON.stringify({
        summary: summaryJson,
        cached: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
