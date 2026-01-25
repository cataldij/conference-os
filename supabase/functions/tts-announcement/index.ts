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
    const { text, voiceId, conferenceId } = await req.json()

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
    const selectedVoiceId = voiceId || defaultVoiceId

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
          text: text,
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
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabase = createClient(supabaseUrl, supabaseKey)

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
        text: text,
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
{
  "text": "Attention all attendees: The keynote session will begin in 10 minutes in the Grand Ballroom.",
  "voiceId": "21m00Tcm4TlvDq8ikWAM", // Optional: Rachel voice
  "conferenceId": "uuid-here" // Optional: If you want to store the audio
}

Response:
{
  "audioBase64": "base64-encoded-mp3-data",
  "audioUrl": "https://supabase-storage-url/audio/conference-id/announcements/timestamp.mp3",
  "mimeType": "audio/mpeg",
  "text": "original text",
  "voiceId": "voice-id-used"
}

Available ElevenLabs Voices (default voices):
- Rachel (21m00Tcm4TlvDq8ikWAM) - Professional female
- Antoni (ErXwobaYiN019PkySvjV) - Professional male
- Bella (EXAVITQu4vr4xnSDxMaL) - Soft female
- Josh (TxGEqnHWrfWFTfGW9XjX) - Deep male
*/
