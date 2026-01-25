import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const sessionId = formData.get('sessionId') as string
    const language = formData.get('language') as string || 'en'

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'Missing audio file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
    whisperFormData.append('language', language)
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
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Append to existing transcript or create new
      const { data: session } = await supabase
        .from('sessions')
        .select('transcript')
        .eq('id', sessionId)
        .single()

      const existingTranscript = session?.transcript || ''
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
Content-Type: multipart/form-data

Form fields:
- audio: File (required) - Audio file (mp3, mp4, mpeg, mpga, m4a, wav, webm)
- sessionId: string (optional) - Session ID to store transcript
- language: string (optional) - Language code (e.g., 'en', 'es', 'fr')

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
