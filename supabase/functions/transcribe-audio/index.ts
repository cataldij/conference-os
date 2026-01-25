import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, verifyAuth, isValidUUID, checkRateLimit } from '../_shared/auth.ts'

// Valid language codes for Whisper
const VALID_LANGUAGES = new Set([
  'af', 'ar', 'hy', 'az', 'be', 'bs', 'bg', 'ca', 'zh', 'hr', 'cs', 'da', 'nl', 'en',
  'et', 'fi', 'fr', 'gl', 'de', 'el', 'he', 'hi', 'hu', 'is', 'id', 'it', 'ja', 'kn',
  'kk', 'ko', 'lv', 'lt', 'mk', 'ms', 'mr', 'mi', 'ne', 'no', 'fa', 'pl', 'pt', 'ro',
  'ru', 'sr', 'sk', 'sl', 'es', 'sw', 'sv', 'tl', 'ta', 'th', 'tr', 'uk', 'ur', 'vi', 'cy'
])

// Max file size: 25MB (Whisper API limit)
const MAX_FILE_SIZE = 25 * 1024 * 1024

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Rate limiting by IP (transcription is expensive)
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIP, 10, 60000)) {
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

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const sessionId = formData.get('sessionId') as string
    const language = (formData.get('language') as string) || 'en'

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'Missing audio file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 25MB' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file type
    const validMimeTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a',
      'audio/wav', 'audio/webm', 'audio/ogg', 'video/mp4', 'video/webm'
    ]
    if (!validMimeTypes.includes(audioFile.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Supported: mp3, mp4, m4a, wav, webm, ogg' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate language code
    if (!VALID_LANGUAGES.has(language.toLowerCase())) {
      return new Response(
        JSON.stringify({ error: 'Invalid language code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate sessionId if provided
    if (sessionId && !isValidUUID(sessionId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid sessionId format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // If sessionId provided, verify user has permission to transcribe for this session
    if (sessionId) {
      // Get the session's conference
      const { data: session } = await supabase
        .from('sessions')
        .select('conference_id')
        .eq('id', sessionId)
        .single()

      if (!session) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if user is speaker, organizer, or staff for this conference
      const { data: membership } = await supabase
        .from('conference_members')
        .select('role')
        .eq('conference_id', session.conference_id)
        .eq('user_id', user.id)
        .single()

      const { data: isSpeaker } = await supabase
        .from('session_speakers')
        .select('id')
        .eq('session_id', sessionId)
        .eq('speaker_id', user.id)
        .single()

      if (!isSpeaker && (!membership || !['organizer', 'staff'].includes(membership.role))) {
        return new Response(
          JSON.stringify({ error: 'Only speakers, organizers, and staff can transcribe session audio' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare form data for OpenAI Whisper API
    const whisperFormData = new FormData()
    whisperFormData.append('file', audioFile)
    whisperFormData.append('model', 'whisper-1')
    whisperFormData.append('language', language.toLowerCase())
    whisperFormData.append('response_format', 'verbose_json')
    whisperFormData.append('timestamp_granularities[]', 'segment')

    // Call OpenAI Whisper API
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: whisperFormData,
    })

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text()
      console.error('Whisper API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Transcription failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const transcriptionData = await whisperResponse.json()

    // If sessionId provided, store transcript in database
    if (sessionId) {
      // Append to existing transcript or create new
      const { data: existingSession } = await supabase
        .from('sessions')
        .select('transcript')
        .eq('id', sessionId)
        .single()

      const existingTranscript = existingSession?.transcript || ''
      const newTranscript = existingTranscript
        ? `${existingTranscript}\n\n${transcriptionData.text}`
        : transcriptionData.text

      const { error: updateError } = await supabase
        .from('sessions')
        .update({ transcript: newTranscript })
        .eq('id', sessionId)

      if (updateError) {
        console.error('Failed to save transcript:', updateError)
      }
    }

    return new Response(
      JSON.stringify({
        text: transcriptionData.text,
        language: transcriptionData.language,
        duration: transcriptionData.duration,
        segments: transcriptionData.segments?.map((seg: any) => ({
          start: seg.start,
          end: seg.end,
          text: seg.text,
        })),
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

/*
Usage:

POST /transcribe-audio
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

Form fields:
- audio: File (required) - Audio file (mp3, mp4, m4a, wav, webm, max 25MB)
- sessionId: string (optional) - Session ID to store transcript (requires speaker/organizer/staff role)
- language: string (optional) - Language code (default: 'en')

Response:
{
  "text": "Full transcript text...",
  "language": "en",
  "duration": 120.5,
  "segments": [
    { "start": 0.0, "end": 5.2, "text": "Hello and welcome..." },
    { "start": 5.2, "end": 10.1, "text": "Today we'll discuss..." }
  ]
}

Supported languages:
af, ar, hy, az, be, bs, bg, ca, zh, hr, cs, da, nl, en, et, fi, fr, gl, de, el, he, hi, hu, is, id, it, ja, kn, kk, ko, lv, lt, mk, ms, mr, mi, ne, no, fa, pl, pt, ro, ru, sr, sk, sl, es, sw, sv, tl, ta, th, tr, uk, ur, vi, cy
*/
