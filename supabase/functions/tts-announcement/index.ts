import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, verifyAuth, isValidUUID, sanitizeString, checkRateLimit } from '../_shared/auth.ts'

// Valid ElevenLabs voice IDs
const VALID_VOICE_IDS = new Set([
  '21m00Tcm4TlvDq8ikWAM', // Rachel - Professional female
  'ErXwobaYiN019PkySvjV', // Antoni - Professional male
  'EXAVITQu4vr4xnSDxMaL', // Bella - Soft female
  'TxGEqnHWrfWFTfGW9XjX', // Josh - Deep male
])

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Rate limiting by IP (TTS is expensive)
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

    const { text, voiceId, conferenceId } = await req.json()

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate conferenceId if provided
    if (conferenceId && !isValidUUID(conferenceId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid conferenceId format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sanitize text (limit length to prevent abuse)
    const sanitizedText = sanitizeString(text, 1000)
    if (sanitizedText.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is empty after sanitization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // If conferenceId provided, verify user is organizer/staff
    if (conferenceId) {
      const { data: membership } = await supabase
        .from('conference_members')
        .select('role')
        .eq('conference_id', conferenceId)
        .eq('user_id', user.id)
        .single()

      if (!membership || !['organizer', 'staff'].includes(membership.role)) {
        return new Response(
          JSON.stringify({ error: 'Only organizers and staff can create announcements' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenLabsApiKey) {
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default to Rachel voice (professional female voice)
    const defaultVoiceId = '21m00Tcm4TlvDq8ikWAM'
    let selectedVoiceId = defaultVoiceId

    // Validate voiceId if provided
    if (voiceId) {
      if (!VALID_VOICE_IDS.has(voiceId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid voiceId. Use one of: Rachel, Antoni, Bella, Josh' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      selectedVoiceId = voiceId
    }

    // Generate speech using ElevenLabs
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: sanitizedText,
          model_id: 'eleven_turbo_v2', // Fast, high-quality model
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text()
      console.error('ElevenLabs API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to generate speech' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the audio as array buffer
    const audioBuffer = await elevenLabsResponse.arrayBuffer()
    const audioBase64 = btoa(
      new Uint8Array(audioBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    )

    // If conferenceId provided, store in Supabase Storage
    let publicUrl = null
    if (conferenceId) {
      const fileName = `${conferenceId}/announcements/${Date.now()}.mp3`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
      } else {
        const { data: urlData } = supabase.storage
          .from('audio')
          .getPublicUrl(fileName)

        publicUrl = urlData.publicUrl
      }
    }

    return new Response(
      JSON.stringify({
        audioBase64: audioBase64,
        audioUrl: publicUrl,
        mimeType: 'audio/mpeg',
        text: sanitizedText,
        voiceId: selectedVoiceId,
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
Usage Example:

POST /tts-announcement
Authorization: Bearer <jwt-token>
{
  "text": "Attention all attendees: The keynote session will begin in 10 minutes in the Grand Ballroom.",
  "voiceId": "21m00Tcm4TlvDq8ikWAM", // Optional: Rachel voice (default)
  "conferenceId": "uuid-here" // Optional: If you want to store the audio (requires organizer/staff role)
}

Response:
{
  "audioBase64": "base64-encoded-mp3-data",
  "audioUrl": "https://supabase-storage-url/audio/conference-id/announcements/timestamp.mp3",
  "mimeType": "audio/mpeg",
  "text": "sanitized text",
  "voiceId": "voice-id-used"
}

Available ElevenLabs Voices:
- Rachel (21m00Tcm4TlvDq8ikWAM) - Professional female
- Antoni (ErXwobaYiN019PkySvjV) - Professional male
- Bella (EXAVITQu4vr4xnSDxMaL) - Soft female
- Josh (TxGEqnHWrfWFTfGW9XjX) - Deep male
*/
